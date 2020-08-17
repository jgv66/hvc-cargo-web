import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';

import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatSort } from '@angular/material';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-mattableencomiendas',
  templateUrl: './mattableencomiendas.component.html',
  styleUrls: ['./mattableencomiendas.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class MattableencomiendasComponent implements OnInit, AfterViewInit {

  @Input() dataSource: MatTableDataSource<any>;
  @Input() filas: number;

  @ViewChild( MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild( MatSort, {static: true}) sort: MatSort;

  displayedColumns: string[] = ['id_paquete', 'fecha_creacion', 'obs_carga', 'cli_razon', 'des_razon', 'tipo_pago', 'estado', 'resultado'];
  expandedElement: any;

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    // if ( this.dataSource ) {
    //   this.filas = this.dataSource.data.length;
    //   this.dataSource.paginator = this.paginator;
    //   console.log('aqui en ngAfterViewInit ', this.dataSource.data );
    // }
  }

  onRowClickedBusquedas( row ) {
    this.expandedElement = ( this.expandedElement === row ) ? null : row;
  }

  aplicarFiltroBusquedas( event ) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // function
  isExpansionDetailRow = (i, row) => row.hasOwnProperty('detailRow');

}
