import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Router } from '@angular/router';
// sweet alert
import Swal from 'sweetalert2';

import { LoginService } from '../../services/login.service';
import { EncomiendaUserComponent } from '../encomienda-user/encomienda-user.component';

@Component({
  selector: 'app-encomienda-cm',
  templateUrl: './encomienda-cm.component.html',
  styleUrls: ['./encomienda-cm.component.scss']
})
export class EncomiendaCmComponent implements OnInit {

  estados = [];
  estadosPqt = [];
  estaPosicion;
  cerrarPQT = false;
  buscandoMasivo = false;
  buscandoRetiros = false;
  marcaRojo = true;

  constructor( private router: Router,
               public login: LoginService,
               private dialogMas: MatDialogRef<EncomiendaCmComponent>,
               public dialog: MatDialog,
               @Inject(MAT_DIALOG_DATA) public parametros ) {}

  ngOnInit() {
    if ( !this.login.usuario ) {
      this.router.navigate(['/login']);
    }
    this.estados = this.login.estados;
  }

  salir() {
    this.dialogMas.close();    
  }

  cambiandoEstado( item ) {
    if ( item.anterior === true ) {
      Swal.fire({
        icon: 'error',
        title: 'Cuidado...',
        text: 'No puede deshacer un hecho pasado, solo puede cambiar el Usuario asignado',
      });
    } else {
      item.marcada = !item.marcada;
      if ( item.marcada ) {
        item.usuario      = this.login.usuario.id;
        item.nombre       = this.login.usuario.nombre;
        item.fecha_entera = new Date();
      } else {
        item.usuario      = 0;
        item.nombre       = '';
        item.fecha_entera = null;
      }
    }
  }

  cambiodeEstadoMasivo() {
    // limpiar para asignar
    this.login.estados.forEach( element => {
        element.id_estado = 0;
        element.marcada   = false;
        element.anterior  = false;
        element.nombre    = '';
        element.fecha_entera = null;
    });
    //
    this.cerrarPQT = false;
    this.estados = this.login.estados;
    this.estadosPqt = [];
    this.buscandoRetiros = true;
    //
  }

  updateEstadosMasivos() {
    this.dialogMas.close({ cerrarPQT: this.cerrarPQT })
  }

  buscarCambiarUsuario( item ) {
    //
    this.estaPosicion = item.estado;
    //
    const dialogConfig2 = new MatDialogConfig();
    dialogConfig2.disableClose = false;
    dialogConfig2.autoFocus = false;
    dialogConfig2.width = '950p';
    dialogConfig2.height = '700px';
    dialogConfig2.data = { estaPosicion: item.estado };
    //
    const dialogMas = this.dialog.open( EncomiendaUserComponent, dialogConfig2 );
    
    dialogMas.afterClosed()
      .subscribe( data => {
        if ( data ) {
          // this.grabarUsuarioEmpresa( data );
          console.log('dialogMas.afterClosed()->',data);
        }
      });  
     
  }

}
