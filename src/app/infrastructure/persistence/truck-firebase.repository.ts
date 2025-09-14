import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { ITruckRepository } from '../../domain/contracts/i-truck.repository';
import { Truck, CreateTruckRequest, UpdateTruckRequest } from '../../domain/models/truck.model';

@Injectable({
  providedIn: 'root'
})
export class TruckFirebaseRepository implements ITruckRepository {
  private readonly collectionName = 'trucks';

  constructor(private firestore: Firestore) {}

  getAll(): Observable<Truck[]> {
    const trucksRef = collection(this.firestore, this.collectionName);
    const q = query(trucksRef, orderBy('licensePlate'));
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => this.mapDocumentToTruck(doc.id, doc.data()))
      )
    );
  }

  getActive(): Observable<Truck[]> {
    const trucksRef = collection(this.firestore, this.collectionName);
    const q = query(trucksRef, where('status', '==', 'ativo'), orderBy('licensePlate'));
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => this.mapDocumentToTruck(doc.id, doc.data()))
      )
    );
  }

  getById(id: string): Observable<Truck | null> {
    const truckRef = doc(this.firestore, this.collectionName, id);
    
    return from(getDoc(truckRef)).pipe(
      map(doc => {
        if (doc.exists()) {
          return this.mapDocumentToTruck(doc.id, doc.data());
        }
        return null;
      })
    );
  }

  async create(request: CreateTruckRequest): Promise<Truck> {
    const trucksRef = collection(this.firestore, this.collectionName);
    const now = new Date();
    
    const truckData = {
      ...request,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(trucksRef, truckData);
    
    return {
      id: docRef.id,
      ...truckData
    };
  }

  async update(id: string, request: UpdateTruckRequest): Promise<Truck> {
    const truckRef = doc(this.firestore, this.collectionName, id);
    const updateData = {
      ...request,
      updatedAt: new Date()
    };

    await updateDoc(truckRef, updateData);
    
    // Buscar o documento atualizado
    const updatedDoc = await getDoc(truckRef);
    return this.mapDocumentToTruck(updatedDoc.id, updatedDoc.data());
  }

  async deactivate(id: string): Promise<void> {
    const truckRef = doc(this.firestore, this.collectionName, id);
    await updateDoc(truckRef, {
      status: 'inativo',
      updatedAt: new Date()
    });
  }

  existsByLicensePlate(licensePlate: string): Observable<boolean> {
    const trucksRef = collection(this.firestore, this.collectionName);
    const q = query(trucksRef, where('licensePlate', '==', licensePlate));
    
    return from(getDocs(q)).pipe(
      map(snapshot => !snapshot.empty)
    );
  }

  private mapDocumentToTruck(id: string, data: any): Truck {
    return {
      id,
      licensePlate: data.licensePlate,
      model: data.model,
      year: data.year,
      status: data.status,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  }
}
