import { environment } from '../../environments/environment';
import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginService implements OnInit {

  url: string;
  usuario = undefined;
  ciudadesPermitidas = [];
  tiposDePago = [];
  usuarios = [];

  constructor(private http: HttpClient,
              private router: Router) {
    this.url = environment.API_URL;
  }

  // tslint:disable-next-line: contextual-lifecycle
  ngOnInit() {
  }

  login(email: string, code: string) {
    const pssw = window.btoa( code );
    const xUrl = this.url + '/usr' ;
    return this.http.post( xUrl, { email, clave: pssw } );
  }

  logout() {
    this.usuario = undefined;
    this.router.navigate(['/login']);
  }

  estaLogeado() {
    return ( this.usuario === undefined ) ? false : true ;
  }

  put( user ) {
    this.usuario = user;
    this.ciudades();
    this.tiposdepago();
    this.retrieveUsuarios();
  }

  ciudades() {
    // console.log('locxuser', this.usuario);
    const xUrl = this.url + '/ciudades' ;
    this.http.get( xUrl )
        .subscribe( (data: any) => {
            console.log(data);
            try {
              this.ciudadesPermitidas = ( data.datos.length > 0 ) ? data.datos : [];
            } catch (error) {
              this.ciudadesPermitidas = [];
            }
          },
          (err) => {
            return console.log('Err', err);
          }
        );
  }

  tiposdepago() {
    const xUrl = this.url + '/tipopago' ;
    this.http.get( xUrl, {} )
        .subscribe( (data: any) => {
            console.log(data);
            try {
              this.tiposDePago = ( data.datos.length > 0 ) ? data.datos : [];
            } catch (error) {
              this.tiposDePago = [];
            }
        },
        (err) => {
          return console.log('Err', err);
        }
      );
    }

  retrieveUsuarios() {
    const xUrl = this.url + '/usuarios' ;
    this.http.get( xUrl )
        .subscribe( (data: any) => {
          console.log(data);
          try {
            this.usuarios = ( data.datos.length > 0 ) ? data.datos : [];
          } catch (error) {
            this.usuarios = [];
          }
        },
        (err) => {
          return console.log('Err', err);
        }
      );
  }

  saveUser( xid, xnomb, xmail, xrut, xpssw, xdirecc, xcomuna, xadmin, xvigente, xfono, xcargo ) {
    const xUrl = this.url + '/grabarUsuario' ;
    const body = { xid, xnomb, xmail, xrut, xpssw, xdirecc, xcomuna, xadmin, xvigente, xfono, xcargo, };
    return this.http.post( xUrl, body );
  }

}
