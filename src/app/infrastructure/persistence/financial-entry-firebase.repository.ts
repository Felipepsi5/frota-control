import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { IFinancialEntryRepository } from '../../domain/contracts/i-financial-entry.repository';
import { 
  FinancialEntry, 
  CreateFinancialEntryRequest, 
  UpdateFinancialEntryRequest,
  FinancialEntryFilters 
} from '../../domain/models/financial-entry.model';

@Injectable({
  providedIn: 'root'
})
export class FinancialEntryFirebaseRepository implements IFinancialEntryRepository {
  private readonly collectionName = 'financialEntries';

  constructor(private firestore: Firestore) {}

  getByFilters(filters: FinancialEntryFilters): Observable<FinancialEntry[]> {
    const entriesRef = collection(this.firestore, this.collectionName);
    let q = query(entriesRef, orderBy('date', 'desc'));

    // Aplicar filtros
    if (filters.truckId) {
      q = query(q, where('truckId', '==', filters.truckId));
    }
    if (filters.entryType) {
      q = query(q, where('entryType', '==', filters.entryType));
    }
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }
    if (filters.startDate) {
      q = query(q, where('date', '>=', Timestamp.fromDate(filters.startDate)));
    }
    if (filters.endDate) {
      q = query(q, where('date', '<=', Timestamp.fromDate(filters.endDate)));
    }

    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => this.mapDocumentToFinancialEntry(doc.id, doc.data()))
      )
    );
  }

  getById(id: string): Observable<FinancialEntry | null> {
    const entryRef = doc(this.firestore, this.collectionName, id);
    
    return from(getDoc(entryRef)).pipe(
      map(doc => {
        if (doc.exists()) {
          return this.mapDocumentToFinancialEntry(doc.id, doc.data());
        }
        return null;
      })
    );
  }

  getByTruckId(truckId: string): Observable<FinancialEntry[]> {
    const entriesRef = collection(this.firestore, this.collectionName);
    const q = query(entriesRef, where('truckId', '==', truckId), orderBy('date', 'desc'));
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => this.mapDocumentToFinancialEntry(doc.id, doc.data()))
      )
    );
  }

  getByUserId(userId: string): Observable<FinancialEntry[]> {
    const entriesRef = collection(this.firestore, this.collectionName);
    const q = query(entriesRef, where('createdUserId', '==', userId), orderBy('date', 'desc'));
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => this.mapDocumentToFinancialEntry(doc.id, doc.data()))
      )
    );
  }

  async create(request: CreateFinancialEntryRequest, userId: string): Promise<FinancialEntry> {
    const entriesRef = collection(this.firestore, this.collectionName);
    const now = new Date();
    
    const entryData = {
      ...request,
      date: Timestamp.fromDate(request.date),
      createdUserId: userId,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(entriesRef, entryData);
    
    return {
      id: docRef.id,
      ...request,
      createdUserId: userId,
      createdAt: now,
      updatedAt: now
    };
  }

  async update(id: string, request: UpdateFinancialEntryRequest): Promise<FinancialEntry> {
    const entryRef = doc(this.firestore, this.collectionName, id);
    const updateData: any = {
      ...request,
      updatedAt: new Date()
    };

    // Converter data para Timestamp se fornecida
    if (request.date) {
      updateData.date = Timestamp.fromDate(request.date);
    }

    await updateDoc(entryRef, updateData);
    
    // Buscar o documento atualizado
    const updatedDoc = await getDoc(entryRef);
    return this.mapDocumentToFinancialEntry(updatedDoc.id, updatedDoc.data());
  }

  async delete(id: string): Promise<void> {
    const entryRef = doc(this.firestore, this.collectionName, id);
    await deleteDoc(entryRef);
  }

  canUserEdit(entryId: string, userId: string, isAdmin: boolean): Observable<boolean> {
    if (isAdmin) {
      return new Observable(observer => observer.next(true));
    }

    return this.getById(entryId).pipe(
      map(entry => entry?.createdUserId === userId)
    );
  }

  private mapDocumentToFinancialEntry(id: string, data: any): FinancialEntry {
    return {
      id,
      truckId: data.truckId,
      date: data.date?.toDate() || new Date(),
      entryType: data.entryType,
      category: data.category,
      amount: data.amount,
      litersFilled: data.litersFilled,
      odometerReading: data.odometerReading,
      createdUserId: data.createdUserId,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  }
}
