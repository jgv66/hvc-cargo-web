import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
// sweet alert
import Swal from 'sweetalert2';
// material
import { MatTableDataSource } from '@angular/material';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
//
import { map } from 'rxjs/operators';
//
import { StockService } from '../../services/stock.service';
import { LoginService } from '../../services/login.service';
import { GuiasService } from '../../services/guias.service';
import { EncomiendaCmComponent } from '../encomienda-cm/encomienda-cm.component';

@Component({
  selector: 'app-encomiendas',
  templateUrl: './encomiendas.component.html',
  styleUrls: ['./encomiendas.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class EncomiendasComponent implements OnInit {

  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  dsRetiros: MatTableDataSource<any>;
  dsClientes: MatTableDataSource<any>;
  dsBusquedas: MatTableDataSource<any>;
  dsSeguimiento: MatTableDataSource<any>;
  dsMasivos: MatTableDataSource<any>;
  selection = new SelectionModel(true, []);

  filasRetiro = 0;
  filasClientes = 0;
  filasBusqueda = 0;
  filasMasivos = 0;

  dispColumns: string[] = ['id_paquete', 'fecha_creacion', 'obs_carga', 'cli_razon', 'des_razon', 'tipo_pago', 'estado', 'acciones'];
  dispColClientes: string[] = ['rut', 'razon_social', 'direccion', 'telefono1', 'email', 'acciones'];
  dispColSeguimiento: string[] = ['id', 'id_paquete', 'fecha', 'hora', 'usuario', 'receptor', 'notas'];
  dispMasivos: string[] = ['select', 'estado', 'id_paquete', 'fecha_creacion', 'obs_carga', 'cli_razon', 'des_razon', 'tipo_pago'];

  expandedElementR: any;
  expandedElementB: any;

  filtro = '';

  grabando = false;
  cargando = false;
  buscando = false;
  buscandoChico = false;
  buscandoRetiros = false;
  buscandoMasivo = false;
  marcaRojo = true;
  busquedas = false;
  enProceso = false;
  grabandoEnco = false;
  retiros = [];
  encomienda: any = {};
  poracopiar = [];
  acopios = [];
  clientes = [];
  linea: any = {};
  carga: any = {};
  clienteChico = [];
  fecha: Date;
  lasFotos = [];
  idfoto;
  nombreorut = '';
  buscarCliente = '';
  offset = 0;
  idpqt: number;
  buscandoID = false;
  estadosPqt = [];
  estados = [];
  estaPosicion = 0;
  buscarUsuario = '';
  cerrarPQT = false;

  fechaIni = new Date();
  fechaFin = new Date();
  idIni = 0;
  idFin = 0;

  nBuscarPor = 'fecha';
  nIdIni;
  nIdFin;

  constructor( private router: Router,
               public login: LoginService,
               public dialog: MatDialog,
               private stockSS: StockService,
               private guias: GuiasService ) {}

  ngOnInit() {
    if ( !this.login.usuario ) {
      this.router.navigate(['/login']);
    }
    this.cargarDatosPendientes();
    this.initCarga();
  }

  cargarDatosPendientes( event? ) {
    this.cargando = true;
    this.buscandoRetiros = true;
    this.stockSS.servicioWEB( '/pickpend', { ficha: this.login.usuario.id, todos: '*' } )
        .subscribe( (dev: any) => {
            // console.log(dev);
            this.cargando = false;
            this.buscandoRetiros = false;
            if ( dev.resultado === 'error' || dev.resultado === 'nodata' ) {
              Swal.fire('No existen retiros pendientes');
            } else {
              this.filasRetiro = dev.datos.length;
              const rows = [];
              dev.datos.forEach(element => rows.push(element, { detailRow: false, element }));
              this.dsRetiros = new MatTableDataSource(rows);
              this.dsRetiros.paginator = this.paginator.toArray()[0];
              this.dsRetiros.sort = this.sort.toArray()[0];
              // console.log(this.dsRetiros);
            }
        },
        (error) => {
          Swal.fire(error);
        });
  }
  aplicarFiltroRetiro( event ) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsRetiros.filter = filterValue.trim().toLowerCase();
    //
    if (this.dsRetiros.paginator) {
      this.dsRetiros.paginator.firstPage();
    }
    //
  }
  // function
  isExpansionDetailRowR = (i, row) => row.hasOwnProperty('detailRow');

  cargarDatosClientes() {
    this.buscando = true;
    this.stockSS.servicioWEB( '/clientes', { buscar: this.nombreorut, offset: this.offset } )
        .subscribe( (dev: any) => {
            // console.log('cargarDatosClientes', dev);
            this.buscando = false;
            if ( dev.resultado === 'error' || dev.resultado === 'nodata' ) {
              Swal.fire( 'La búsqueda no obtuvo resultados' );
            } else {
              this.filasClientes = dev.datos.length;
              this.dsClientes = new MatTableDataSource(dev.datos);
              this.dsClientes.paginator = this.paginator.toArray()[1];
            }
        },
        (error) => {
          Swal.fire('ERROR', error);
        });
  }
  aplicarFiltroClientes( event ) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsClientes.filter = filterValue.trim().toLowerCase();
    //
    if (this.dsClientes.paginator) {
      this.dsClientes.paginator.firstPage();
    }
    //
  }

  revisarEncomienda( item ) {
    this.encomienda = item;
  }

  updateEncomienda() {
    // validar lo datos
    // si ya estamos procesando....
    this.encomienda.fecha_prometida = this.encomienda.llegada;
    if ( this.encomienda.fecha_prometida === undefined || this.encomienda.fecha_prometida === null ) {
      Swal.fire('CUIDADO', 'Fecha prometida de llegada no esta definida.');
    } else if ( this.encomienda.valor_cobrado < 0 || ( this.encomienda.valor_cobrado === 0 && this.encomienda.tipo_pago !== 'GRATIS' ) ) {
      Swal.fire('CUIDADO', 'Debe indicar valor cobrado por la encomienda.');
    } else if ( this.encomienda.tipo_pago === '' ) {
      Swal.fire('CUIDADO', 'Debe indicar el tipo de pago de la encomienda.');
    } else if ( this.encomienda.obs_carga === '' ) {
      Swal.fire('CUIDADO', 'Debe indicar el tipo de encomienda que será transportada.');
    } else if ( this.encomienda.bultos < 0 || this.encomienda.bultos === 0 ) {
      Swal.fire('CUIDADO', 'Debe indicar la cantidad de bultos de la encomienda.');
    } else if ( this.encomienda.peso < 0 || this.encomienda.peso === 0 ) {
      Swal.fire('CUIDADO', 'Debe indicar el peso de la encomienda.');
    } else if ( this.encomienda.volumen < 0 || this.encomienda.volumen === 0 ) {
      Swal.fire('CUIDADO', 'Debe indicar el volumen de la encomienda.');
    } else {
      Swal.fire({
        title: 'Actualizaremos...',
        text: 'Esta acción actualizará los datos de la encomienda ' + this.encomienda['id_paquete'].toString() + ' en el sistema',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: 'No, abandonar...',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, actualiza!'
      }).then((result) => {
        if (result.value) {
          this.regrabarEncomienda();
        }
      });
    }
  }
  async regrabarEncomienda() {
    this.buscandoRetiros = true;
    // origen
    const carga = { id_paquete: this.encomienda['id_paquete'],
                    recepcionista: this.login.usuario.id,
                    fecha_creacion: this.encomienda['fecha_creacion'],
                    cliente: this.encomienda['cliente'],
                    contacto: this.encomienda['contacto'],
                    fecha_prometida: this.encomienda['fecha_prometida'],
                    documento_legal: this.encomienda['documento_legal'] || '',
                    numero_legal: this.encomienda['numero_legal'],
                    bultos: this.encomienda['bultos'],
                    peso: this.encomienda['peso'],
                    volumen: this.encomienda['volumen'],
                    obs_carga: this.encomienda['obs_carga'],
                    tipo_pago: this.encomienda['tipo_pago'],
                    valor_cobrado: this.encomienda['valor_cobrado'],
                    destinatario: this.encomienda['destinatario'] };
    //
    await this.stockSS.servicioWEB( '/grabarEncomienda', carga )
      .subscribe( (data: any) => {
          //
          this.enProceso = false;
          this.buscandoRetiros = false;
          //
          // console.log(data);
          if ( data.resultado === 'ok' ) {
            //
            Swal.fire({
              icon: 'success',
              title: 'Nro.Encomienda: ' + data.datos[0].id_pqt,
              text: 'Los datos de la nueva encomienda fueron grabados con éxito',
              footer: '<a href>Nro.Interno : ' + data.datos[0].id_pqt + ' </a>'
            });
            //
            this.initCarga();
            //
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Cuidado...',
              text: 'Los datos de la nueva encomienda no fueron grabados',
              footer: '<a href>' + data.datos + '</a>'
            });
          }
      },
      (err) => {
        this.buscandoRetiros = false;
        // console.log(err);
      });
  }

  borrarEncomienda( item ) {
    Swal.fire({
      title: 'ELIMINAR...',
      text: 'Esta acción eliminará la encomienda desde el sistema',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'No, abandonar...',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!'
    }).then((result) => {
      if (result.value) {
        this.borraLaEncomienda(item);
      }
    });
  }
  removeItemFromArr = ( idpqt ) => {
    for ( let i = 0; i < this.retiros.length; i++) {
      if ( this.retiros[i].id_paquete === idpqt  ) {
        this.retiros.splice(i, 1);
        Swal.fire( '#Seguimiento fue eliminado.' );
        return;
      }
    }
  }
  borraLaEncomienda( item ) {
    this.buscandoRetiros = true;
    this.stockSS.servicioWEB( '/borrar_pqt', { id_pqt: item.id_paquete } )
        .subscribe( (dev: any) => {
            // console.log(dev);
            this.buscandoRetiros = false;
            if ( dev.resultado === 'error' || dev.resultado === 'nodata' ) {
              Swal.fire( 'La búsqueda no obtuvo resultados. No se borraron Encomiendas.' );
            } else {
              // borrar de la matriz de datos
              this.removeItemFromArr( item.id_paquete );
            }
        },
        (error) => {
          Swal.fire('ERROR', error);
        });
  }

  cargarFotoFea( idpqt ) {
    this.cargarFoto( { idpqt, id_paquete: idpqt } );
  }

  cargarFoto( item ) {
    this.lasFotos = [];
    this.idfoto = undefined;
    this.cargando = true;
    const IMG_URL = this.stockSS.url + '/public/img/' ;
    //
    this.stockSS.servicioWEB( '/getimages', { id_pqt: item.id_paquete } )
        .subscribe( (dev: any) => {
          this.cargando = false;
          //
          if ( dev.resultado === 'ok' ) {
            this.idfoto = item.id_paquete;
            dev.datos.forEach( element => {
              element.imgb64 = IMG_URL + element.imgb64;
            })
            this.lasFotos = dev.datos;
          }
        });
  }

  crearCliente() {
    this.linea.id_cliente = 0;
    this.linea.rut = '';
    this.linea.razon_social = '';
    this.linea.nombre_fantasia = '';
    this.linea.direccion = '';
    this.linea.ciudad = '';
    this.linea.comuna = '';
    this.linea.referencias = '';
    this.linea.email = '';
    this.linea.telefono1 = '';
    this.linea.telefono2 = '';
    this.linea.tipo = '';
    this.linea.lat = '';
    this.linea.lng = '';
  }
  editarCliente( item ) {
    this.linea = item;
  }
  grabarCliente( regCliForm: NgForm ) {
    if ( regCliForm.invalid ) {
      Swal.fire('ERROR', 'Debe definir los datos obliogatorios para continuar con una grabación');
      return;
    }
    this.buscando = true;
    this.stockSS.servicioWEB( '/upClientes', this.linea )
      .subscribe( (dev: any) => {
          // console.log(dev);
          this.buscando = false;
          if ( dev.resultado === 'ok' ) {
            Swal.fire('Cliente fue grabado con éxito' );
            regCliForm.reset();
          } else  {
            Swal.fire( dev.datos );
          }
      },
      (error) => {
        Swal.fire('ERROR', error);
      });

  }

  buscarClientes() {
    if ( this.nombreorut !== '' ) {
      this.offset = 0;
      this.cargarDatosClientes();
    } else {
      Swal.fire( 'No existen datos para buscar.' );
    }
  }
  limpiaDataChica() {
    this.buscarCliente = '';
    this.clienteChico = [];
  }
  buscarClientesChico() {
    if ( this.buscarCliente !== '' ) {
      this.buscandoChico = true;
      this.stockSS.servicioWEB( '/clientes', { buscar: this.buscarCliente, offset: this.offset } )
          .subscribe( (dev: any) => {
              // console.log(dev);
              this.buscandoChico = false;
              if ( dev.resultado === 'ok' ) {
                this.clienteChico = dev.datos;
              } else {
                Swal.fire( 'La búsqueda no obtuvo resultados');
              }
          },
          (error) => {
            Swal.fire('ERROR', error);
          });
    }
  }

  initCarga() {
    // origen
    this.carga.id_paquete = 0;
    this.carga.recepcionista = this.login.usuario.id;
    this.carga.fecha_creacion = new Date();
    this.carga.cliente = 0;
    this.carga.xrutCliente = '';
    this.carga.xemailCliente = '';
    this.carga.xfonosCliente = '';
    this.carga.xnombreCliente = '';
    this.carga.xdireccCliente = '';
    this.carga.xcomunaCliente = '';
    this.carga.contacto = '';
    this.carga.fecha_prometida = new Date();
    this.carga.documento_legal = '';
    this.carga.numero_legal = '';
    this.carga.bultos = 0;
    this.carga.peso = 0;
    this.carga.volumen = 0;
    this.carga.obs_carga = '';
    this.carga.tipo_pago = '';
    this.carga.valor_cobrado = 0;
    // destino
    this.carga.destinatario = 0;
    this.carga.xrutDestino = '';
    this.carga.xemailDestino = '';
    this.carga.xfonosDestino = '';
    this.carga.xnombreDestino = '';
    this.carga.xdireccDestino = '';
    this.carga.xcomunaDestino = '';
  }
  esteClienteDestino( item, cliente ) {
    if ( cliente === true ) {
      this.carga.cliente        = item.id_cliente;
      this.carga.xrutCliente    = item.rut;
      this.carga.xemailCliente  = item.email;
      this.carga.xfonosCliente  = item.telefono1 + '   ' + item.telefono2;
      this.carga.xnombreCliente = item.razon_social;
      this.carga.xdireccCliente = item.direccion;
      this.carga.xcomunaCliente = item.comuna;
    } else {
      this.carga.destinatario   = item.id_cliente;
      this.carga.xrutDestino    = item.rut;
      this.carga.xemailDestino  = item.email;
      this.carga.xfonosDestino  = item.telefono1 + '   ' + item.telefono2;
      this.carga.xnombreDestino = item.razon_social;
      this.carga.xdireccDestino = item.direccion;
      this.carga.xcomunaDestino = item.comuna;
    }
  }
  crearEncomienda() {
    // validar lo datos
    // console.log(this.carga);
    // si ya estamos procesando....
    if ( this.carga.cliente === 0 ) {
      Swal.fire('CUIDADO', 'No se puede grabar sin haber definido al cliente.');
    } else if ( this.carga.fecha_prometida === undefined || this.carga.fecha_prometida === null ) {
      Swal.fire('CUIDADO', 'Fecha prometida de llegada no esta definida.');
    } else if ( this.carga.valor_cobrado < 0 || ( this.carga.valor_cobrado === 0 && this.carga.tipo_pago !== 'GRATIS' ) ) {
      Swal.fire('CUIDADO', 'Debe indicar valor cobrado por la encomienda.');
    } else if ( this.carga.tipo_pago === '' ) {
      Swal.fire('CUIDADO', 'Debe indicar el tipo de pago de la encomienda.');
    } else if ( this.carga.obs_carga === '' ) {
      Swal.fire('CUIDADO', 'Debe indicar el tipo de carga que será transportada.');
    } else if ( this.carga.bultos < 0 || this.carga.bultos === 0 ) {
      Swal.fire('CUIDADO', 'Debe indicar la cantidad de bultos de la encomienda.');
    } else if ( this.carga.peso < 0 || this.carga.peso === 0 ) {
      Swal.fire('CUIDADO', 'Debe indicar el peso de la encomienda.');
    } else if ( this.carga.volumen < 0 || this.carga.volumen === 0 ) {
      Swal.fire('CUIDADO', 'Debe indicar el volumen de la encomienda.');
    } else if ( this.carga.destinatario === 0 ) {
      Swal.fire('CUIDADO', 'No se puede grabar sin haber definido al destinatario.');
    } else {
      Swal.fire({
        title: 'Grabaremos...',
        text: 'Esta acción generará una nueva encomienda en el sistema',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: 'No, abandonar...',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, grábala!'
      }).then((result) => {
        if (result.value) {
          this.grabarEncomienda();
        }
      });
    }
  }
  async grabarEncomienda() {
    this.grabandoEnco = true;
    // origen
    const carga = { id_paquete: this.carga.id_paquete,
                    recepcionista: this.carga.recepcionista,
                    fecha_creacion: this.carga.fecha_creacion,
                    cliente: this.carga.cliente,
                    contacto: this.carga.contacto,
                    fecha_prometida: this.carga.fecha_prometida,
                    documento_legal: this.carga.documento_legal,
                    numero_legal: this.carga.numero_legal,
                    bultos: this.carga.bultos,
                    peso: this.carga.peso,
                    volumen: this.carga.volumen,
                    obs_carga: this.carga.obs_carga,
                    tipo_pago: this.carga.tipo_pago,
                    valor_cobrado: this.carga.valor_cobrado,
                    destinatario: this.carga.destinatario };
    //
    await this.stockSS.servicioWEB( '/grabarEncomienda', carga )
      .subscribe( (data: any) => {
          //
          this.enProceso = false;
          this.grabandoEnco = false;
          //
          // console.log(data);
          if ( data.resultado === 'ok' ) {
            //
            Swal.fire({
              icon: 'success',
              title: 'Nro.Encomienda: ' + data.datos[0].id_pqt,
              text: 'Los datos de la nueva encomienda fueron grabados con éxito',
              footer: '<a href>Nro.Interno : ' + data.datos[0].id_pqt + ' </a>'
            });
            //
            this.initCarga();
            //
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Cuidado...',
              text: 'Los datos de la nueva encomienda no fueron grabados',
              footer: '<a href>' + data.datos + '</a>'
            });
          }
      });
  }

  async buscarPaquete( cambio? ) {
    if ( this.idpqt !== 0 ) {
      this.buscandoID = true;
      await this.stockSS.servicioWEB( '/estado_pqt', { idpqt: this.idpqt, interno: 1 } )
        .subscribe( (dev: any) => {
            // console.log(dev);
            this.buscandoID = false;
            if ( dev.resultado === 'ok' ) {
              this.dsSeguimiento = new MatTableDataSource(dev.datos);
              this.dsSeguimiento.paginator = this.paginator.toArray()[2];
            } else {
              if ( !cambio ) {
                Swal.fire( 'La búsqueda no obtuvo resultados');
              }
            }
        },
        (error) => {
          Swal.fire('ERROR', error);
        });
    }
  }

  cambiodeEstado( item ) {
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
    this.idpqt = item.id_paquete;
    //
    this.stockSS.servicioWEB( '/estado_pqt', { idpqt: this.idpqt, interno: 1 } )
      .subscribe( (dev: any) => {
        this.buscandoRetiros = false;
        if ( dev.resultado === 'ok' ) {
            this.estadosPqt = dev.datos;
            // console.log('this.estadosPqt', this.estadosPqt);
            // revisar estados
            let pos = 0; let i = -1;
            this.estados.forEach(element => {
              ++i;
              pos = this.estadosPqt.findIndex( (est: any) => est.estado === element.estado );
              if ( pos !== -1 ) {
                this.estados[i].id_estado    = this.estadosPqt[pos].id;
                this.estados[i].fecha_entera = this.estadosPqt[pos].fecha_entera;
                this.estados[i].marcada      = true;
                this.estados[i].anterior     = true;
                this.estados[i].nombre       = this.estadosPqt[pos].nombre;
                this.estados[i].usuario      = this.estadosPqt[pos].usuario;
              }
            });
          }
      },
      (error) => {
        this.buscandoRetiros = false;
        Swal.fire('ERROR', error);
      });
    //
  }

  updateEstados() {
    const texto = 'Esta acción actualizará los estados de la encomienda en el sistema' + (this.cerrarPQT) ? '. Y cerrará el registro. Está de acuerdo?' : '';
    Swal.fire({
      title: 'Grabaremos...',
      text: texto,
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'No, abandonar...',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, actualizar!'
    }).then((result) => {
      if (result.value) {
        this.grabarEstados();
      }
    });

  }

  async grabarEstados() {
    this.buscandoRetiros = true;
    // origen
    const marcados = this.estados.filter( item => item.marcada === true );
    const carga = { id_paquete: this.idpqt,
                    cierre: this.cerrarPQT,
                    estados: marcados };
    //
    await this.stockSS.servicioWEB( '/grabarEstados', carga )
      .subscribe( (data: any) => {
          //
          this.buscandoRetiros = false;
          //
          // console.log(data);
          if ( data.resultado === 'ok' ) {
            //
            Swal.fire({
              icon: 'success',
              title: 'Nro.Encomienda: ' + data.datos[0].id_pqt,
              text: 'El cambio de estado de la encomienda fue grabado con éxito',
              footer: '<a href>Nro.Interno : ' + data.datos[0].id_pqt + ' </a>'
            });
            //
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Cuidado...',
              text: 'Los datos de cambio de estado de la encomienda no fueron grabados',
              footer: '<a href>' + data.datos + '</a>'
            });
          }
      });
  }

  buscarPaquetes( caso: string ) {
    this.buscando = true;
    this.buscandoMasivo = true;
    this.stockSS.servicioWEB( (caso === 'buscar' ) ? '/dameEncomiendas' : '/dameMasivo',
                             {  ficha: this.login.usuario.id,
                                idCliente: 0, 
                                idDestina: 0,
                                filtro: this.nBuscarPor,
                                idIni: (caso === 'buscar' ) ? this.nIdIni : this.idIni,
                                idFin: (caso === 'buscar' ) ? this.nIdFin : this.idFin,
                                fechaIni: this.guias.fechaNormal( this.fechaIni ) ,
                                fechaFin: this.guias.fechaNormal( this.fechaFin ) } )
        .subscribe( (dev: any) => {
            this.buscando = false;
            this.buscandoMasivo = false;
            if ( dev.resultado === 'error' || dev.resultado === 'nodata' ) {
              Swal.fire('No existen encomiendas para los parámetros entregados.');
            } else {
              const rows = [];
              if ( caso === 'buscar') {
                dev.datos.forEach(element => rows.push(element, { detailRow: true, element }));
                this.filasBusqueda = dev.datos.length;
                this.dsBusquedas = new MatTableDataSource(rows);
                this.dsBusquedas.paginator = this.paginator.toArray()[2];
              } else {
                dev.datos.forEach(element => rows.push(element));
                this.filasMasivos = dev.datos.length;
                this.dsMasivos = new MatTableDataSource(rows);
                this.selection = new SelectionModel<Element>(true, []);
              }
            }
        },
        (error) => {
          Swal.fire(error);
        });
  }
  aplicarFiltroBusquedasB( event ) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsBusquedas.filter = filterValue.trim().toLowerCase();
  }
  // function
  isExpansionDetailRowB = (i, row) => row.hasOwnProperty('detailRow');

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    if ( this.dsMasivos !== undefined ) {
      const numSelected = this.selection.selected.length;
      const numRows = this.dsMasivos.data.length;
      return numSelected === numRows;
    } else {
      return 0;
    }
  }
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dsMasivos.data.forEach(row => this.selection.select(row));
  }
  checkboxLabel( row? ): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  updateEstadosMasivos() {
    const texto = 'Esta acción actualizará los estados de todas las encomiendas marcadas' + (this.cerrarPQT) ? '. Y cerrará los registros. Está de acuerdo?' : '.';
    Swal.fire({
      title: 'Grabaremos...',
      text: texto,
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'No, abandonar...',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, actualizar!'
    }).then((result) => {
      if (result.value) {
        this.grabarEstadosMasivos();
      }
    });
  }

  cambiarUsuario( item ) {
    this.estaPosicion = item.estado;
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

  verCambiosMasivos() {
    //
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = false;
    dialogConfig.width = '700px';
    dialogConfig.height = '660px';
    dialogConfig.data = {};
    //
    const dialogRef = this.dialog.open( EncomiendaCmComponent, dialogConfig );
    //
    dialogRef.afterClosed().subscribe(
        data => console.log("Dialog output:", data)
    );  
    //
  }

  grabarEstadosMasivos() {
    this.buscandoMasivo = true;
    this.marcaRojo = true;
    // origen
    let carga = {};
    const marcados = this.estados.filter( item => item.marcada === true );
    //
    for (const s of this.selection.selected ) {
      //
      carga = { id_paquete: s.id_paquete,
                cierre:     this.cerrarPQT,
                estados:    marcados };
      //
      this.stockSS.servicioWEB('/grabarEstados', carga)
        .subscribe((data: any) => {
          //
          if (data.resultado === 'ok') {
            this.dsMasivos.data = this.dsMasivos.data.filter( item => item.id_paquete !== s.id_paquete );
          }
        },
        (error) => {
          console.log(error);
        });
      //
    }
    this.buscandoMasivo = false;
    this.marcaRojo = false;
    //
  }
    
  etq1() {
    return `
    ^XA
    ^DFR:SAMPLE.GRF^FS
    ^FO20,30^GB750,1100,4^FS
    ^FO20,30^GB750,200,4^FS
    ^FO20,30^GB750,400,4^FS
    ^FO20,30^GB750,700,4^FS
    ^FO20,226^GB325,204,4^FS
    ^FO30,40^ADN,36,20^FDShip to:^FS
    ^FO30,260^ADN,18,10^FDPart number #^FS
    ^FO360,260^ADN,18,10^FDDescription:^FS
    ^FO30,750^ADN,36,20^FDFrom:^FS
    ^FO150,125^ADN,36,20^FN1^FS (ship to)
    ^FO60,330^ADN,36,20^FN2^FS(part num)
    ^FO400,330^ADN,36,20^FN3^FS(description)
    ^FO70,480^BY4^B3N,,200^FN4^FS(barcode)
    ^FO150,800^ADN,36,20^FN5^FS (from)
    ^XZ
    ^XA
    ^XFR:SAMPLE.GRF
    ^FN1^FDAcme Printing^FS
    ^FN2^FD14042^FS
    ^FN3^FDScrew^FS
    ^FN4^FD12345678^FS
    ^FN5^FDMacks Fabricating^FS
    ^XZ    
    `;
  }

  openWin() {
    const printWindow = window.open();
    printWindow.document.open('text/plain')
    printWindow.document.write('${HIDROVORTICE}$');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();  
  }

  imprimir( data ) {
    data.spinn = true;
    this.stockSS.imprimirOrden( data )
      .pipe( map( (resp: any) => resp.datos ) )
      .subscribe( (pdf: any) => {
          setTimeout( () => {
              data.spinn = false;
              window.open( 'https://api.hvc.kinetik.cl/static/pdf/' + pdf );
          }, 600);
      });
  }

}

