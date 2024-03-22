import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Edad } from 'src/app/models/edad';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EdadService {
  route = `${environment.apiUrl}/edad`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Edad[]>(`${this.route}/obtener-todos`);
  }

}
