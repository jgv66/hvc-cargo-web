import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class StockService {

  url;                  // 'http://23.239.29.171:3055';
  ficha: string;        // numero de ficha del usuario dentro de softland
  nombre: string;       // nombre del usuario en softland
  email: string;        // email del usuario en softland
  idempresa: number;    // id de la empresa 1,2,3...
  nombreemp: string;    // nombre de la empresa
  logeado = false;

  constructor(private http: HttpClient) {
    this.url = environment.API_URL;
    this.logeado = false;
  }

  servicioWEB( cSP: string, parametros?: any ) {
    const url    = this.url + cSP;
    const body   = parametros;
    return this.http.post( url, body );
  }

  getServicioWEB( cSP: string, parametros?: any ) {
    const params = new HttpParams().append('param', JSON.stringify(parametros));
    const url    = this.url + cSP;
    if ( parametros ) {
      return this.http.get( url,  { params } );
    } else {
      return this.http.get( url );
    }
  }

  // set a key/value
  async guardarDato( key, value ) {
    await localStorage.setItem( key, JSON.stringify( value ) );
  }

  async leerDato( key ) {
    return await JSON.parse( localStorage.getItem( key ) );
  }

  uploadImage( imgb64, name, ext, idPaquete ) {
    //
    const url = this.url + '/imgUpload';
    //
    const formData = new FormData();
    formData.append('foto',      imgb64 );
    formData.append('name',      name);
    formData.append('extension', ext);
    formData.append('id_pqt',    idPaquete );
    //
    return this.http.post(url, formData);
  }

}
