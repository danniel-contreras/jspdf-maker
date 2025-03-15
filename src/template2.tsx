import jsPDF from "jspdf";
import dte from "./assets/0CFA6BE2-F531-426A-AAF6-E483C0817C7B (2).json";
import autoTable from "jspdf-autotable";
import LOGO from "./assets/janilda.png";
import dataQR from "./assets/qr_code.png";
import { useState } from "react";
import {
  formatAddress,
  formatNameByTypeDte,
  getHeightText,
  returnBoldText,
} from "./utils";

function Template2() {
  const [pdf, setPdf] = useState("");

  const makePdf = () => {
    const doc = new jsPDF();

    const data = [
      "CANT.",
      "DESCRIPCION",
      "PRECIO UNITARIO",
      "VTAS. NO SUJETAS",
      "VENTAS EXENTAS",
      "VENTAS AFECTAS",
    ];

    autoTable(doc, {
      head: [data],
      body: [
        ["1", "Transferencia de Productos de Acero de muelles hacia patios UPDP y viceversa. Alambres BARCO SPRING AURA", "3", "4", "5", "6"],
      ],
      startY: 82,
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: "#00b4d8",
        halign: "center",
        valign: "middle",
        fontSize: 7,
      },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: "auto" },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
      },
      theme: "plain",
      margin: { top: 5, left: 5, right: 5 },
      didDrawCell: (data) => {
        if (data.section === "head") {
          doc.setDrawColor("#00b4d8");
          doc.line(
            data.cell.x,
            data.cell.y,
            data.cell.x + data.cell.width,
            data.cell.y
          );
          doc.line(
            data.cell.x,
            data.cell.y + data.cell.height,
            data.cell.x + data.cell.width,
            data.cell.y + data.cell.height
          );
        }
        let secondLineAdded = false;

        if (data.section === "body" && data.row.index === 0) {
          doc.setDrawColor("#00b4d8");
          doc.line(
            data.cell.x,
            data.cell.y - 9,
            data.cell.x,
            data.cell.y + 120
          );

          if (!secondLineAdded) {
            doc.line(
              data.cell.x,
              data.cell.y + 120,
              data.cell.x + data.cell.width,
              data.cell.y + 120
            );
            secondLineAdded = true;
          }
        }
      },
      didDrawPage: () => {
        autoTable(doc, {
          startY: 5,
          margin: { top: 5, left: 5, right: 5 },
          showHead: false,
          body: [["", "", ""]],
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: "auto" },
            2: { cellWidth: 70 },
          },
          theme: "plain",
          didDrawCell: (data) => {
            doc.setTextColor("#00b4d8");
            if (data.column.index === 0 && data.row.index === 0) {
              doc.addImage(LOGO, "PNG", data.cell.x + 2, data.cell.y, 30, 30);
            }
            if (data.column.index === 1 && data.row.index === 0) {
              const cellX = data.cell.x;
              const cellY = data.cell.y;
              const cellWidth = data.cell.width;

              console.log(cellWidth);

              doc.setFontSize(7);

              const formattedName = dte.emisor.nombre;

              const name = doc.splitTextToSize(formattedName, cellWidth - 4);
              const hName = getHeightText(doc, name);
              doc.setFontSize(10);
              returnBoldText(
                doc,
                name,
                cellX + cellWidth / 2,
                cellY + 5,
                "center"
              );
              doc.setFontSize(7);
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
                `DIRECCIÓN : ${
                  dte.emisor.direccion.complemento
                } ${formatAddress(
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

              doc.setDrawColor("#00b4d8");

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

              doc.addImage(dataQR, "PNG", cellX + 5, cellY + 1, 23, 23);
            }
          },
        });
        const marginX = 5;
        const tableWidth = doc.internal.pageSize.width - marginX * 2;
        const radius = 3;
        doc.setDrawColor("#00b4d8");

        doc.roundedRect(
          marginX,
          38,
          tableWidth,
          doc.internal.pageSize.height - 42,
          radius,
          radius,
          "S"
        );

        let StartY = 38 + 2;

        doc.setFontSize(8);
        doc.setTextColor("#00b4d8");
        doc.text("Cliente:", marginX + 2, StartY + 5);
        doc.line(marginX + 13, StartY + 5, tableWidth + 5, StartY + 5);
        StartY += 7;
        const x = (tableWidth + 5) / 2;
        doc.text("Dirección:", marginX + 2, StartY + 5);
        doc.line(marginX + 16, StartY + 5, (tableWidth + 5) / 2, StartY + 5);
        doc.line(x + 15, StartY + 5, tableWidth + 5, StartY + 5);
        doc.text("NIT no:", x + 3, StartY + 5);
        StartY += 7;
        doc.line(marginX + 2, StartY + 5, (tableWidth + 5) / 2, StartY + 5);
        doc.line(x + 19, StartY + 5, tableWidth + 5, StartY + 5);
        doc.text("Registro no:", x + 3, StartY + 5);
        StartY += 7;
        doc.text("Depto:", marginX + 2, StartY + 5);
        doc.line(marginX + 12, StartY + 5, (tableWidth + 5) / 2, StartY + 5);
        doc.line(x + 10, StartY + 5, tableWidth + 5, StartY + 5);
        doc.text("Giro:", x + 3, StartY + 5);
        StartY += 7;
        doc.text("Venta a cuenta de:", marginX + 2, StartY + 5);
        doc.line(marginX + 27, StartY + 5, (tableWidth + 5) / 2, StartY + 5);
        doc.line(x + 30, StartY + 5, tableWidth + 5, StartY + 5);
        doc.text("Condición de pago:", x + 3, StartY + 5);
        StartY += 7;
        doc.text("No. de doc relacionado:", marginX + 2, StartY + 5);
        doc.line(marginX + 33, StartY + 5, (tableWidth + 5) / 2, StartY + 5);
        doc.text("Fecha de doc relacionado:", x + 3, StartY + 5);
        doc.line(x + 38, StartY + 5, tableWidth + 5, StartY + 5);
      },
    });

    setPdf(URL.createObjectURL(doc.output("blob")));
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <button onClick={makePdf}>Exportar a PDF</button>
      {pdf && (
        <iframe
          src={pdf}
          width="100%"
          height="100%"
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
}

export default Template2;
