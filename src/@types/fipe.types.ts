export interface FipeBrand {
  codigo: string;
  nome: string;
}

export interface FipeModel {
  codigo: number;
  nome: string;
}

export interface FipeYear {
  codigo: string;
  nome: string;
}

export interface FipeVehicleInfo {
  Valor: string;
  Marca: string;
  Modelo: string;
  AnoModelo: number;
  Combustivel: string;
  CodigoFipe: string;
  MesReferencia: string;
  SiglaCombustivel: string;
}