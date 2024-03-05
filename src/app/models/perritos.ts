import { Discapacidad } from "./discapacidad";
import { Genero } from "./genero";

export interface Perritos {
    id: number;
    nombre: string;
    genero: Genero;
    esterelizado: boolean;
    edad: string;
    imagen: string;
    imagenBase64: string;
    discapacidad: Discapacidad;
}
