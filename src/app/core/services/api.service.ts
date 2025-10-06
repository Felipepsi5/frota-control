import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // GET requests
  get<T>(endpoint: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          // Se o valor é um objeto (como Filters), expandir para parâmetros aninhados
          if (typeof params[key] === 'object' && !Array.isArray(params[key])) {
            console.log(`ApiService.get: Expandindo objeto ${key}:`, params[key]);
            Object.keys(params[key]).forEach(nestedKey => {
              if (params[key][nestedKey] !== null && params[key][nestedKey] !== undefined && params[key][nestedKey] !== '') {
                const paramName = `${key}.${nestedKey}`;
                httpParams = httpParams.set(paramName, params[key][nestedKey].toString());
                console.log(`ApiService.get: Parâmetro aninhado ${paramName}:`, params[key][nestedKey]);
              }
            });
          } else {
            console.log(`ApiService.get: Parâmetro simples ${key}:`, params[key]);
            httpParams = httpParams.set(key, params[key].toString());
          }
        }
      });
    }

    console.log('ApiService.get: Parâmetros finais:', httpParams.toString());
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params: httpParams });
  }

  // POST requests
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data);
  }

  // PUT requests
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data);
  }

  // PATCH requests
  patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, data);
  }

  // DELETE requests
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`);
  }

  // GET by ID
  getById<T>(endpoint: string, id: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}/${id}`);
  }

  // PUT by ID
  putById<T>(endpoint: string, id: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}/${id}`, data);
  }

  // DELETE by ID
  deleteById<T>(endpoint: string, id: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}/${id}`);
  }
}
