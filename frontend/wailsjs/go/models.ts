export namespace dto {
	
	export class PaginatedClientes {
	    data: models.Cliente[];
	    total: number;
	
	    static createFrom(source: any = {}) {
	        return new PaginatedClientes(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.data = this.convertValues(source["data"], models.Cliente);
	        this.total = source["total"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PaginatedDoctores {
	    data: models.Doctor[];
	    total: number;
	
	    static createFrom(source: any = {}) {
	        return new PaginatedDoctores(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.data = this.convertValues(source["data"], models.Doctor);
	        this.total = source["total"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PaginatedMutuales {
	    data: models.Mutual[];
	    total: number;
	
	    static createFrom(source: any = {}) {
	        return new PaginatedMutuales(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.data = this.convertValues(source["data"], models.Mutual);
	        this.total = source["total"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PaginatedRecetas {
	    data: models.Receta[];
	    total: number;
	
	    static createFrom(source: any = {}) {
	        return new PaginatedRecetas(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.data = this.convertValues(source["data"], models.Receta);
	        this.total = source["total"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace gorm {
	
	export class DeletedAt {
	    // Go type: time
	    Time: any;
	    Valid: boolean;
	
	    static createFrom(source: any = {}) {
	        return new DeletedAt(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Time = this.convertValues(source["Time"], null);
	        this.Valid = source["Valid"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace models {
	
	export class Lente {
	    id: number;
	    cristalTipo: string;
	    cristalPrecio: number;
	    armazonTipo: string;
	    armazonPrecio: number;
	    recetaId: number;
	
	    static createFrom(source: any = {}) {
	        return new Lente(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.cristalTipo = source["cristalTipo"];
	        this.cristalPrecio = source["cristalPrecio"];
	        this.armazonTipo = source["armazonTipo"];
	        this.armazonPrecio = source["armazonPrecio"];
	        this.recetaId = source["recetaId"];
	    }
	}
	export class Graduacion {
	    id: number;
	    tipoDistancia: string;
	    ojo: string;
	    esf?: number;
	    cil?: number;
	    grados?: number;
	    recetaId: number;
	
	    static createFrom(source: any = {}) {
	        return new Graduacion(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.tipoDistancia = source["tipoDistancia"];
	        this.ojo = source["ojo"];
	        this.esf = source["esf"];
	        this.cil = source["cil"];
	        this.grados = source["grados"];
	        this.recetaId = source["recetaId"];
	    }
	}
	export class Mutual {
	    id: number;
	    nombre: string;
	    recetas?: Receta[];
	
	    static createFrom(source: any = {}) {
	        return new Mutual(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.nombre = source["nombre"];
	        this.recetas = this.convertValues(source["recetas"], Receta);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Doctor {
	    id: number;
	    nombre: string;
	    apellido: string;
	    recetas?: Receta[];
	
	    static createFrom(source: any = {}) {
	        return new Doctor(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.nombre = source["nombre"];
	        this.apellido = source["apellido"];
	        this.recetas = this.convertValues(source["recetas"], Receta);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Receta {
	    id: number;
	    // Go type: time
	    fecha: any;
	    notas: string;
	    tieneMutual: boolean;
	    total: number;
	    clienteId: number;
	    doctorId: number;
	    mutualId?: number;
	    cliente?: Cliente;
	    doctor?: Doctor;
	    mutual?: Mutual;
	    graduaciones?: Graduacion[];
	    lentes?: Lente[];
	
	    static createFrom(source: any = {}) {
	        return new Receta(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.fecha = this.convertValues(source["fecha"], null);
	        this.notas = source["notas"];
	        this.tieneMutual = source["tieneMutual"];
	        this.total = source["total"];
	        this.clienteId = source["clienteId"];
	        this.doctorId = source["doctorId"];
	        this.mutualId = source["mutualId"];
	        this.cliente = this.convertValues(source["cliente"], Cliente);
	        this.doctor = this.convertValues(source["doctor"], Doctor);
	        this.mutual = this.convertValues(source["mutual"], Mutual);
	        this.graduaciones = this.convertValues(source["graduaciones"], Graduacion);
	        this.lentes = this.convertValues(source["lentes"], Lente);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Cliente {
	    id: number;
	    nombre: string;
	    apellido: string;
	    dni: string;
	    telefono: string;
	    recetas?: Receta[];
	
	    static createFrom(source: any = {}) {
	        return new Cliente(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.nombre = source["nombre"];
	        this.apellido = source["apellido"];
	        this.dni = source["dni"];
	        this.telefono = source["telefono"];
	        this.recetas = this.convertValues(source["recetas"], Receta);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	
	

}

export namespace repositories {
	
	export class ClienteFilters {
	    Limit: number;
	    Offset: number;
	    Search: string;
	
	    static createFrom(source: any = {}) {
	        return new ClienteFilters(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Limit = source["Limit"];
	        this.Offset = source["Offset"];
	        this.Search = source["Search"];
	    }
	}
	export class DoctorFilters {
	    Limit: number;
	    Offset: number;
	    Search: string;
	
	    static createFrom(source: any = {}) {
	        return new DoctorFilters(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Limit = source["Limit"];
	        this.Offset = source["Offset"];
	        this.Search = source["Search"];
	    }
	}
	export class MutualFilters {
	    Limit: number;
	    Offset: number;
	    Search: string;
	
	    static createFrom(source: any = {}) {
	        return new MutualFilters(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Limit = source["Limit"];
	        this.Offset = source["Offset"];
	        this.Search = source["Search"];
	    }
	}
	export class RecetaFilters {
	    // Go type: time
	    FechaDesde?: any;
	    // Go type: time
	    FechaHasta?: any;
	    ClienteID?: number;
	    DoctorID?: number;
	    MutualID?: number;
	    Limit: number;
	    Offset: number;
	
	    static createFrom(source: any = {}) {
	        return new RecetaFilters(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.FechaDesde = this.convertValues(source["FechaDesde"], null);
	        this.FechaHasta = this.convertValues(source["FechaHasta"], null);
	        this.ClienteID = source["ClienteID"];
	        this.DoctorID = source["DoctorID"];
	        this.MutualID = source["MutualID"];
	        this.Limit = source["Limit"];
	        this.Offset = source["Offset"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

