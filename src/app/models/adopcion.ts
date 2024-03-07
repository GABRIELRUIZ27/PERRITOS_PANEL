import { Perritos } from "./perritos";

export interface Adopciones {
    id: number;
    perritos: Perritos;
    imagen: string;
    imagenBase64: string;
    fechaAdopcion: string;
}
