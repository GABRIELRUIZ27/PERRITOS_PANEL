import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Perritos } from 'src/app/models/perritos';

@Injectable({
  providedIn: 'root'
})
export class PerritosService {
  route = `${environment.apiUrl}/perritos`;
  private _refreshListPerritos$ = new Subject<Perritos | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { }

  get refreshListPerritos() {
    return this._refreshListPerritos$;
  }

  getById(id: number) {
    return this.http.get<Perritos>(`${this.route}/obtener-por-id/${id}`);
  }

  getAll() {
    return this.http.get<Perritos[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Perritos) {
    return this.http.post<Perritos>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListPerritos$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Perritos) {
    return this.http.put<Perritos>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListPerritos$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListPerritos$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }
}
