import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Discapacidad } from 'src/app/models/discapacidad';

@Injectable({
  providedIn: 'root'
})
export class DiscapacidadService {
  route = `${environment.apiUrl}/discapacidades`;
  private _refreshListDiscapacidades$ = new Subject<Discapacidad | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { }

  get refreshListDiscapacidades() {
    return this._refreshListDiscapacidades$;
  }

  getById(id: number) {
    return this.http.get<Discapacidad>(`${this.route}/obtener-por-id/${id}`);
  }

  getAll() {
    return this.http.get<Discapacidad[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Discapacidad) {
    return this.http.post<Discapacidad>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListDiscapacidades$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Discapacidad) {
    return this.http.put<Discapacidad>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListDiscapacidades$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListDiscapacidades$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }
}
