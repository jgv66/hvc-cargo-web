import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
// sweet alert
import Swal from 'sweetalert2';

import { LoginService } from '../../services/login.service';
import { StockService } from '../../services/stock.service';

@Component({
  selector: 'app-calcularvalor',
  templateUrl: './calcularvalor.component.html',
  styleUrls: ['./calcularvalor.component.scss']
})
export class CalcularvalorComponent implements OnInit {

  cantidad: number;
  alto: number;
  ancho: number;
  largo: number;
  peso: number;
  precio: number;

  constructor( private router: Router,
               public login: LoginService,
               public stockSS: StockService,
               private dialogCal: MatDialogRef<CalcularvalorComponent>,
               public dialog: MatDialog ) {}

  ngOnInit() {
    if ( !this.login.usuario ) {
      this.router.navigate(['/login']);
    }
  }

  salir() {
    this.dialogCal.close();    
  }

  solicitarCalculo() {
    this.precio = 0;
    // 
    if (this.cantidad === undefined || this.cantidad <= 0 || 
        this.alto === undefined || this.alto <= 0 || 
        this.ancho === undefined ||  this.ancho <= 0 || 
        this.largo === undefined || this.largo <= 0 || 
        this.peso === undefined || this.peso <= 0 ) {
      //
      Swal.fire({
        icon: 'error',
        title: 'BULTO/PESO',
        text: 'No existen datos para recalcular el precio de la encomienda.',
      });
      //
      return;
    }
    this.stockSS.servicioWEB( '/recalculo',
                            { bulto:    'bulto',
                              cantidad: this.cantidad,
                              alto:     this.alto,
                              ancho:    this.ancho,
                              largo:    this.largo,
                              peso:     this.peso,
                              pallet:   0 } )
      .subscribe( (dev: any) => {
        // console.log(dev);
        if ( dev.resultado === 'ok' ) {
          //
          this.precio = dev.datos;
          //
        } else {
          //
          Swal.fire({
            icon: 'error',
            title: 'Cuidado...',
            text: dev.datos,
          });
          //
        }
      });
  }

  cambiarPrecio() {
    // 
    Swal.fire({
      icon: 'success',
      title: 'Atención',
      text: 'Precio de la encomienda ha cambiado',
    });    
    //
    this.dialogCal.close({ precio: this.precio, 
                           cantidad: this.cantidad, 
                           peso: this.peso, 
                           volumen: (this.alto * this.ancho * this.largo) / 1000000 });
    //
  }

}
