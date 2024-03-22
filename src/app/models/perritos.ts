import { Discapacidad } from "./discapacidad";
import { Edad } from "./edad";
import { Genero } from "./genero";
import { Tamaño } from "./tamaño";

export interface Perritos {
    id: number;
    nombre: string;
    genero: Genero;
    esterelizado: boolean;
    imagen: string;
    imagenBase64: string;
    discapacidad: Discapacidad;
    edad: Edad;
    tamaño: Tamaño;
}
