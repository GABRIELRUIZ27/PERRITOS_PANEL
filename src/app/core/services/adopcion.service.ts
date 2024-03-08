import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Adopciones } from 'src/app/models/adopcion';

@Injectable({
  providedIn: 'root'
})
export class AdopcionService {
  route = `${environment.apiUrl}/adoptados`;
  private _refreshListAdopciones$ = new Subject<Adopciones | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { }

  get refreshListAdopciones() {
    return this._refreshListAdopciones$;
  }

  getById(id: number) {
    return this.http.get<Adopciones>(`${this.route}/obtener-por-id/${id}`);
  }

  getAll() {
    return this.http.get<Adopciones[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Adopciones) {
    return this.http.post<Adopciones>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListAdopciones$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Adopciones) {
    return this.http.put<Adopciones>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListAdopciones$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListAdopciones$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }
}
