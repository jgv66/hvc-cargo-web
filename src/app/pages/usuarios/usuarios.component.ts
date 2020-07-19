import { Component, OnInit, ɵCodegenComponentFactoryResolver } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';

// ES6 Modules or TypeScript
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styles: []
})
export class UsuariosComponent implements OnInit {

  cargando = false;
  usuarios = [];
  nombre   = '';
  xid      = 0;
  xnomb    = '';
  xmail    = '';
  xpssw    = '';
  xrut     = '';
  xcomuna  = '';
  xfono    = '';
  xcargo   = '';
  xdirecc  = '';
  xadmin   = false;
  xvigente = false;

  constructor( private login: LoginService,
               private router: Router ) {}

  ngOnInit() {
    if ( !this.login.usuario ) {
      this.router.navigate(['/login']);
    }
    this.consultaUsuario();
  }

  async refresh() {
    this.cargando = true;
    await this.login.retrieveUsuarios();
    this.usuarios = this.login.usuarios;
    this.cargando = false;
  }

  consultaUsuario() {
    this.cargando = true;
    this.usuarios = this.login.usuarios;
    this.cargando = false;
  }

  crearUsuario() {
    this.xid      = -1;
    this.xnomb    = '';
    this.xmail    = '';
    this.xrut     = '';
    this.xpssw    = '';
    this.xdirecc  = '';
    this.xcomuna  = '';
    this.xfono    = '';
    this.xcargo   = '';
    this.xadmin   = false;
    this.xvigente = true;
  }

  modificarUsuario( user ) {
    // console.log( user );
    this.xid      = user.id;
    this.xnomb    = user.nombre;
    this.xmail    = user.email;
    this.xrut     = user.rut;
    this.xpssw    = window.atob(user.clave);
    this.xdirecc  = user.direccion;
    this.xcomuna  = user.comuna;
    this.xfono    = user.telefono;
    this.xcargo   = user.cargo;
    this.xadmin   = user.admin;
    this.xvigente = user.vigente;
  }

  grabarUser() {
    this.cargando = true;
    const pssw = window.btoa( this.xpssw  );
    this.login.saveUser( this.xid, this.xnomb, this.xmail, this.xrut, pssw, this.xdirecc, this.xcomuna, this.xadmin, this.xvigente, this.xfono, this.xcargo )
      .subscribe( (resultado: any) => {
        // console.log(resultado);
        this.cargando = false;
        if ( resultado.resultado === 'ok' ) {
          this.refresh();
          Swal.fire({
            icon: 'success',
            title: 'ATENCION',
            text: 'La grabación se realizó con éxito',
            footer: '<a href>ID: ' + this.xid.toString() + ' </a>'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Cuidado...',
            text: 'La grabación no se pudo llevar a cabo. Corrija y reintente.',
            footer: '<a href>' + resultado.datos + '</a>'
          });
        }
      });
  }

}
