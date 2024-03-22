import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Tamaño } from 'src/app/models/tamaño';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TamañoService {
  route = `${environment.apiUrl}/tamaño`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Tamaño[]>(`${this.route}/obtener-todos`);
  }

}
