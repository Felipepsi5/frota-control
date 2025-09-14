import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDocs, getDoc, query, where, orderBy } from '@angular/fire/firestore';
import { Observable, from, map, combineLatest } from 'rxjs';
import { ISummaryRepository } from '../../domain/contracts/i-summary.repository';
import { MonthlySummary, DashboardSummary, TruckPerformance } from '../../domain/models/summary.model';
import { Truck } from '../../domain/models/truck.model';
import { FinancialEntry } from '../../domain/models/financial-entry.model';

@Injectable({
  providedIn: 'root'
})
export class SummaryFirebaseRepository implements ISummaryRepository {
  private readonly monthlySummariesCollection = 'monthlySummaries';
  private readonly trucksCollection = 'trucks';
  private readonly financialEntriesCollection = 'financialEntries';

  constructor(private firestore: Firestore) {}

  getDashboardSummary(): Observable<DashboardSummary> {
    return combineLatest([
      this.getTrucksPerformance(),
      this.getMonthlySummaries()
    ]).pipe(
      map(([trucksPerformance, monthlySummaries]) => {
        const totalTrucks = trucksPerformance.length;
        const activeTrucks = trucksPerformance.filter(t => t.totalKm > 0).length;
        const totalRevenue = trucksPerformance.reduce((sum, t) => sum + t.totalRevenue, 0);
        const totalExpenses = trucksPerformance.reduce((sum, t) => sum + t.totalExpenses, 0);
        const netIncome = totalRevenue - totalExpenses;
        
        const trucksWithKm = trucksPerformance.filter(t => t.totalKm > 0);
        const averageKmPerLiter = trucksWithKm.length > 0 
          ? trucksWithKm.reduce((sum, t) => sum + t.kmPerLiterAverage, 0) / trucksWithKm.length 
          : 0;

        return {
          totalTrucks,
          activeTrucks,
          totalRevenue,
          totalExpenses,
          netIncome,
          averageKmPerLiter,
          monthlySummaries
        };
      })
    );
  }

  getMonthlySummariesByTruck(truckId: string): Observable<MonthlySummary[]> {
    const summariesRef = collection(this.firestore, this.monthlySummariesCollection);
    const q = query(summariesRef, where('truckId', '==', truckId), orderBy('year', 'desc'), orderBy('month', 'desc'));
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => this.mapDocumentToMonthlySummary(doc.id, doc.data()))
      )
    );
  }

  getMonthlySummary(truckId: string, year: number, month: number): Observable<MonthlySummary | null> {
    const summaryId = `${truckId}_${year}_${month}`;
    const summaryRef = doc(this.firestore, this.monthlySummariesCollection, summaryId);
    
    return from(getDoc(summaryRef)).pipe(
      map(doc => {
        if (doc.exists()) {
          return this.mapDocumentToMonthlySummary(doc.id, doc.data());
        }
        return null;
      })
    );
  }

  getTrucksPerformance(): Observable<TruckPerformance[]> {
    return combineLatest([
      this.getTrucks(),
      this.getFinancialEntries()
    ]).pipe(
      map(([trucks, entries]) => {
        return trucks.map(truck => {
          const truckEntries = entries.filter(entry => entry.truckId === truck.id);
          const totalRevenue = truckEntries
            .filter(entry => entry.entryType === 'revenue')
            .reduce((sum, entry) => sum + entry.amount, 0);
          
          const totalExpenses = truckEntries
            .filter(entry => entry.entryType === 'expense')
            .reduce((sum, entry) => sum + entry.amount, 0);
          
          const netIncome = totalRevenue - totalExpenses;
          
          const fuelEntries = truckEntries.filter(entry => 
            entry.entryType === 'expense' && 
            entry.category === 'Abastecimento' && 
            entry.litersFilled && 
            entry.odometerReading
          );
          
          let kmPerLiterAverage = 0;
          let totalKm = 0;
          let totalLiters = 0;
          
          if (fuelEntries.length > 0) {
            totalLiters = fuelEntries.reduce((sum, entry) => sum + (entry.litersFilled || 0), 0);
            const odometerReadings = fuelEntries.map(entry => entry.odometerReading || 0);
            if (odometerReadings.length > 1) {
              totalKm = Math.max(...odometerReadings) - Math.min(...odometerReadings);
              kmPerLiterAverage = totalKm > 0 && totalLiters > 0 ? totalKm / totalLiters : 0;
            }
          }

          return {
            truckId: truck.id,
            licensePlate: truck.licensePlate,
            model: truck.model,
            totalRevenue,
            totalExpenses,
            netIncome,
            kmPerLiterAverage,
            totalKm,
            totalLiters
          };
        });
      })
    );
  }

  getTruckPerformance(truckId: string): Observable<TruckPerformance | null> {
    return this.getTrucksPerformance().pipe(
      map(performances => performances.find(p => p.truckId === truckId) || null)
    );
  }

  private getTrucks(): Observable<Truck[]> {
    const trucksRef = collection(this.firestore, this.trucksCollection);
    const q = query(trucksRef, where('status', '==', 'ativo'));
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          licensePlate: doc.data()['licensePlate'],
          model: doc.data()['model'],
          year: doc.data()['year'],
          status: doc.data()['status'],
          createdAt: doc.data()['createdAt']?.toDate() || new Date(),
          updatedAt: doc.data()['updatedAt']?.toDate() || new Date()
        }))
      )
    );
  }

  private getFinancialEntries(): Observable<FinancialEntry[]> {
    const entriesRef = collection(this.firestore, this.financialEntriesCollection);
    const q = query(entriesRef);
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          truckId: doc.data()['truckId'],
          date: doc.data()['date']?.toDate() || new Date(),
          entryType: doc.data()['entryType'],
          category: doc.data()['category'],
          amount: doc.data()['amount'],
          litersFilled: doc.data()['litersFilled'],
          odometerReading: doc.data()['odometerReading'],
          createdUserId: doc.data()['createdUserId'],
          createdAt: doc.data()['createdAt']?.toDate() || new Date(),
          updatedAt: doc.data()['updatedAt']?.toDate() || new Date()
        }))
      )
    );
  }

  private getMonthlySummaries(): Observable<MonthlySummary[]> {
    const summariesRef = collection(this.firestore, this.monthlySummariesCollection);
    const q = query(summariesRef, orderBy('year', 'desc'), orderBy('month', 'desc'));
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => this.mapDocumentToMonthlySummary(doc.id, doc.data()))
      )
    );
  }

  private mapDocumentToMonthlySummary(id: string, data: any): MonthlySummary {
    return {
      id,
      truckId: data.truckId,
      year: data.year,
      month: data.month,
      totalRevenue: data.totalRevenue || 0,
      totalExpenses: data.totalExpenses || 0,
      netIncome: data.netIncome || 0,
      kmPerLiterAverage: data.kmPerLiterAverage || 0,
      expenseBreakdown: data.expenseBreakdown || {},
      totalKm: data.totalKm || 0,
      totalLiters: data.totalLiters || 0,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  }
}
