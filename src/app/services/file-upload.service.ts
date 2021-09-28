import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class FileUploadService {

  url = environment.API_URL;

  constructor(private http: HttpClient) {}

  addFile( profileImage: File, item, extension ): Observable<any> {

    const name = profileImage.name;
    
    console.log('----------------------------------------------------');
    console.log(name, profileImage, item.data , extension);
    console.log('----------------------------------------------------');
    
    const imageName = item.data.id_paquete +'_attach_'+ name ;
    //
    const formData = new FormData();
    formData.append('kfoto', profileImage, name       );
    formData.append('name',      imageName            );
    formData.append('extension', extension            );
    formData.append('id_pqt',    item.data.id_paquete );   
    //
    return this.http.post( this.url + '/attachFile', formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      catchError(this.errorMgmt)
    )
  }

  errorMgmt(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }

}
