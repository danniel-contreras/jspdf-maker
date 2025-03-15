import jsPDF from "jspdf";
import { DateTime } from "luxon";
import { SeedcodeCatalogosMhService } from "seedcode-catalogos-mh";

export const formattedStartDate = (startDate: string) => {
  const format = DateTime.fromISO(startDate, { zone: "America/El_Salvador" });
  const formattedStartDate = format.toLocaleString(DateTime.DATE_FULL);
  return formattedStartDate;
};

export const formatDdMmYyyy = (startDate: string) => {
  const format = DateTime.fromISO(startDate, { zone: "America/El_Salvador" });
  const formattedStartDate = format.toFormat("dd/MM/yyyy");
  return formattedStartDate;
};
export const formatMoney = (amount: number): string => {
  return Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const calcSaldo = (
  typeAccount: string,
  totalDbe: number,
  totalHber: number,
  saldoAnterior: number,
  index: number,
  lastSaldo: number
) => {
  const saldos: Record<string, number> = {
    Activo: 0, // O1
    Pasivo: 0, // O2
    Patrimonio: 0, // O3
    "Resultado Deudoras": 0, // O4
    "Resultado Acreedoras": 0, // O5
    "Cuentas de Cierre": 0, // O6
    "Orden Deudoras": 0, // O7
    "Orden Acreedoras": 0, // O8
  };

  saldos[typeAccount] = index === 0 ? saldoAnterior : lastSaldo;

  switch (typeAccount) {
    case "Activo": // O1
      saldos[typeAccount] += totalDbe - totalHber;
      break;

    case "Pasivo": // O2
      saldos[typeAccount] += totalHber - totalDbe;
      break;

    case "Patrimonio": // O3
      saldos[typeAccount] += totalHber - totalDbe;
      break;

    case "Resultado Deudoras": // O4 (Gastos)
      saldos[typeAccount] += totalDbe - totalHber;
      break;

    case "Resultado Acreedoras": // O5 (Ingresos)
      saldos[typeAccount] += totalHber - totalDbe;
      break;

    case "Cuentas de Cierre": // O6 (No afectan el saldo)
      break;

    case "Orden Deudoras": // O7
      saldos[typeAccount] += totalDbe - totalHber;
      break;

    case "Orden Acreedoras": // O8
      saldos[typeAccount] += totalHber - totalDbe;
      break;

    default:
      break;
  }

  return saldos[typeAccount];
};

export const getHeightText = (doc: jsPDF, text: string) => {
  const dimensions = doc.getTextDimensions(text);
  return dimensions.h;
};

export const formatAddress = (
  dep_code: string,
  mun_code: string,
  showDep: boolean = true
) => {
  const service = new SeedcodeCatalogosMhService();

  const deparment = service
    .get012Departamento()
    .find((dep) => dep.codigo === dep_code);

  if (deparment) {
    const municipio = service.get013Municipio(dep_code);
    if (municipio) {
      const munici = municipio.find((mun) => mun.codigo === mun_code);
      if (munici) {
        return showDep
          ? `${munici.valores}, ${deparment.valores}`
          : `${munici.valores}`;
      }
      return showDep ? `${deparment.valores}` : "";
    }
    return showDep ? `${deparment.valores}` : "";
  }
  return "";
};

export const formatDepto = (dep_code: string) => {
  const service = new SeedcodeCatalogosMhService();

  const deparment = service
    .get012Departamento()
    .find((dep) => dep.codigo === dep_code);

  return deparment ? deparment.valores : "";
};

export const returnBoldText = (
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  alignContent: "left" | "center" | "right" = "left"
) => {
  doc.setFont("helvetica", "bold");
  doc.text(text, x, y, { align: alignContent });
  doc.setFont("helvetica", "normal");
};

export const formatNameByTypeDte = (typeDte: string) => {
  switch (typeDte) {
    case "01":
      return "COMPROBANTE DE FACTURA CONSUMIDOR FINAL";
    case "03":
      return "COMPROBANTE DE CRÉDITO FISCAL";
    case "05":
      return "COMPROBANTE DE NOTA DE CRÉDITO";
    case "06":
      return "COMPROBANTE DE NOTA DE DÉBITO";
    case "14":
      return "COMPROBANTE DE FACTURA DE SUJETO EXCLUIDO";
    default:
      return "";
  }
};

export const splitTextIntoLines = (
  doc: jsPDF,
  text: string,
  maxWidth: number,
  fontSize: number
) => {
  const words = text.split(" ");
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width =
      (doc.getStringUnitWidth(currentLine + " " + word) * fontSize) /
      doc.internal.scaleFactor;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
};

export const getDayMonthAndYear = (date: string) => {
  const format = DateTime.fromISO(date, { zone: "America/El_Salvador" });
  const formattedStartDate = format.toLocaleString(DateTime.DATE_FULL);
  return formattedStartDate;
};

export const getDateSeparated = (date: string) => {
  const [year, month, day] = date.split("-");
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const monthS = meses[parseInt(month) - 1];

  return {
    day,
    month: monthS,
    year
  }
};
