import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  menuUsuarios: any = [
    {
      titulo: 'Usuarios',
      icono: 'mdi mdi-face',
      submenu: [
        { titulo: 'Mantención', url: '/usuarios'   },
        // { titulo: 'Locales por usuario', url: '/locporuser'   },
      ]
    }
  ];

  menuFolios: any = [
    {
      titulo: 'Folios',
      icono: 'mdi mdi-note-plus-outline',
      submenu: [
        { titulo: 'Folios por encomiendas', url: '/folios'   },
      ]
    }
  ];

  menuInformes: any = [
    {
      titulo: 'Informes',
      icono: 'mdi mdi-cloud-print-outline',
      submenu: [
        { titulo: 'OT',      url: '/infot'   },
        { titulo: 'Acopios', url: '/infaco'  },
        { titulo: 'Picking', url: '/infpick' },
      ]
    }
  ];

  menuDocumentos: any = [
    {
      titulo: 'Encomiendas',
      icono: 'mdi mdi-package-variant',
      submenu: [
        { titulo: 'Mantención', url: '/encomiendas' },
      ]
    }
  ];

  menuOT: any = [
    {
      titulo: 'Orden de Transporte',
      icono: 'mdi mdi-cube-send',
      submenu: [
        { titulo: 'Mantención', url: '/ot' },
      ]
    }
  ];

  constructor() { }

}
