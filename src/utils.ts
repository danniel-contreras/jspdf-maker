import jsPDF from "jspdf";
import { DateTime } from "luxon";
import { SeedcodeCatalogosMhService } from "seedcode-catalogos-mh";
import autoTable, { RowInput } from "jspdf-autotable";
import LOGO from "./assets/janilda.png"
import QR from "./assets/qr_code.png"

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
    year,
  };
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

const formatName = (
  name: string,
  nameComercial: string,
  canInvertName: boolean = false
) => {
  if (nameComercial === name) {
    return name;
  } else {
    return canInvertName
      ? `${nameComercial}, ${name}`
      : `${name}, ${nameComercial}`;
  }
};

export const headerDoc = async (
  doc: jsPDF,
  dte,
  canInvertName: boolean = false
) => {
  autoTable(doc, {
    startY: 5,
    showHead: false,
    body: [["", "", ""]],
    theme: "plain",
    didDrawCell: (data) => {
      if (data.column.index === 0 && data.row.index === 0) {
        try {
          doc.addImage(
            LOGO,
            "PNG",
            data.cell.x + 2,
            data.cell.y,
            20,
            20,
            "LOGO",
            "SLOW"
          );
        } catch {
          doc.text("error", data.cell.x + 2, data.cell.y + 5);
        }
      }
      if (data.column.index === 1 && data.row.index === 0) {
        const cellX = data.cell.x;
        const cellY = data.cell.y;
        const cellWidth = data.cell.width;

        doc.setFontSize(7);

        const formattedName =
          dte.identificacion.tipoDte === "01" ||
          dte.identificacion.tipoDte === "03"
            ? formatName(
                dte.emisor.nombre,
                (dte as DteFe).emisor.nombreComercial,
                canInvertName
              )
            : dte.emisor.nombre;

        const name = doc.splitTextToSize(formattedName, cellWidth - 4);
        const hName = getHeightText(doc, name);
        returnBoldText(doc, name, cellX + cellWidth / 2, cellY + 5, "center");
        const actEco = doc.splitTextToSize(
          `Actividad económica: ${dte.emisor.descActividad}`,
          cellWidth - 4
        );
        const hActEco = getHeightText(doc, actEco);
        returnBoldText(
          doc,
          actEco,
          cellX + cellWidth / 2,
          cellY + hName + 5.5,
          "center"
        );

        // Agregar dirección
        const address = doc.splitTextToSize(
          `DIRECCIÓN : ${dte.emisor.direccion.complemento} ${formatAddress(
            dte.emisor.direccion.departamento,
            dte.emisor.direccion.municipio
          )}`,
          cellWidth - 4
        );
        const hAddress = getHeightText(doc, address);
        returnBoldText(
          doc,
          address,
          cellX + cellWidth / 2,
          cellY + hName + hActEco + 6.5,
          "center"
        );

        // Agregar teléfono
        returnBoldText(
          doc,
          `TEL: ${dte.emisor.telefono}`,
          cellX + cellWidth / 2,
          cellY + hName + hActEco + hAddress + 7,
          "center"
        );
      }
      if (data.column.index === 2 && data.row.index === 0) {
        const cellX = data.cell.x;
        const cellY = data.cell.y;
        const cellWidth = 45;
        const cellHeight = 25;

        doc.setDrawColor(0, 0, 0);

        doc.roundedRect(
          cellX + 30,
          cellY + 2,
          cellWidth - 4,
          cellHeight - 4,
          2,
          2,
          "S"
        );

        doc.setFontSize(5);
        returnBoldText(
          doc,
          "DOCUMENTO TRIBUTARIO ELECTRÓNICO",
          cellX + 50,
          cellY + 5,
          "center"
        );

        const docName = doc.splitTextToSize(
          formatNameByTypeDte(dte.identificacion.tipoDte),
          30
        );
        doc.setFontSize(5);
        returnBoldText(doc, docName, cellX + 50, cellY + 9, "center");
        doc.setFontSize(6);
        returnBoldText(
          doc,
          `N.I.T. ${dte.emisor.nit}`,
          cellX + 50,
          cellY + 16,
          "center"
        );
        returnBoldText(
          doc,
          `NRC No. ${dte.emisor.nrc}`,
          cellX + 50,
          cellY + 20,
          "center"
        );

        doc.addImage(QR, "PNG", cellX + 5, cellY + 1, 23, 23);
      }
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 70 },
    },
    margin: { top: 5, left: 5, right: 5 },
  });
};

export const getHeightText = (doc: jsPDF, text: string) => {
  const dimensions = doc.getTextDimensions(text);
  return dimensions.h;
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

export const formatCurrency = (value: number) => {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};

export const tableHeaders = [
  "CANTIDAD",
  "DESCRIPCIÓN",
  "PRECIO UNITARIO",
  "DESCUENTO POR ITEM",
  "OTROS MONTOS NO AFECTOS",
  "VENTAS NO SUJETAS",
  "VENTAS EXENTAS",
  "VENTAS GRAVADAS",
];

export const tableProduct = (
  doc:jsPDF,
  data,
  finalY: number
) => {
  const array_object: (string | number)[][] = [];
  data.cuerpoDocumento.map((prd) => {
    const values = Object.values({
      qty: prd.cantidad,
      desc: prd.descripcion,
      price: formatCurrency(prd.precioUni),
      descu: formatCurrency(prd.montoDescu),
      other: formatCurrency(0),
      vtSuj: formatCurrency(prd.ventaNoSuj),
      vtExe: formatCurrency(prd.ventaExenta),
      vtGrav: formatCurrency(prd.ventaGravada),
    });
    array_object.push(values);
  });

  autoTable(doc, {
    theme: "plain",
    startY: finalY,
    margin: {
      right: 5,
      left: 5,
      bottom: doc.internal.pages.length > 1 ? 10 : 55,
      top: 35,
    },
    head: [tableHeaders],
    body: array_object as unknown as RowInput[],
    columnStyles: {
      0: { cellWidth: 15, halign: "center", cellPadding: 2 },
      1: { cellWidth: 65, cellPadding: 2 },
      2: {
        cellWidth: 20,
        cellPadding: 2,
      },
      3: {
        cellWidth: 20,
        cellPadding: 2,
      },
      4: {
        cellWidth: 20,
        cellPadding: 2,
      },
      5: {
        cellWidth: 20,
        cellPadding: 2,
      },
      6: { cellWidth: 20, cellPadding: 2 },
      7: { cellPadding: 2 },
    },
    headStyles: {
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
      fontSize: 5,
    },
    bodyStyles: {
      fontSize: 7,
    },
  });
};

export const adjustTextInRect = (
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) => {
  const lines = doc.splitTextToSize(text, maxWidth);
  const textHeight = lines.length * lineHeight;

  return {
    lines,
    textHeight,
    adjustedY: y,
    adjustedX: x,
  };
};


export const secondHeader = (
  doc: jsPDF,
  dte,
  contingence: boolean = false
) => {
  const { receptor, identificacion, respuestaMH } = dte

  autoTable(doc, {
    margin: {
      left: 10,
      right: 10,
    },
    showHead: false,
    startY: 35,
    body: [
      [`NOMBRE: ${receptor.nombre}`, `NRC : ${receptor.nrc ?? "-"}`],
      [
        receptor.direccion
          ? `DIRECCIÓN :  ${receptor.direccion.complemento} ${formatAddress(
              receptor.direccion.departamento,
              receptor.direccion.municipio
            )}, El Salvador`
          : "No establecida",
        `CÓDIGO GENERACIÓN : ${identificacion.codigoGeneracion}`,
      ],
      [
        `GIRO : ${receptor.descActividad ?? "-"}`,
        `NUMERO DE CONTROL : ${identificacion.numeroControl}`,
      ],
      [
        `NUMERO DOCUMENTO : ${receptor.numDocumento ?? "-"}`,
        `SELLO : ${respuestaMH.selloRecibido}`,
      ],
      [
        `CORREO : ${receptor.correo ?? "-"}`,
        `FECHA HORA EMISION : ${identificacion.fecEmi} - ${identificacion.horEmi}`,
      ],
      [
        `TEL : ${receptor.telefono ?? "-"}`,
        `MODELO DE FACTURACIÓN : ${contingence ? "Diferido" : "Previo"}`,
      ],
      [
        `CONDICIÓN DE LA OPERACIÓN: CONTADO`,
        `TIPO DE TRANSMISIÓN : ${contingence ? "Por contingencia" : "Normal"}`,
      ],
    ],
    columnStyles: { 0: { cellWidth: 115 }, 1: { cellWidth: 105 } },
    bodyStyles: {
      fontSize: 6.5,
      cellPadding: 0.3,
    },
    theme: "plain",
  });
};
