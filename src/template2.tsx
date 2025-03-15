import jsPDF from "jspdf";
import dte from "./assets/0CFA6BE2-F531-426A-AAF6-E483C0817C7B (2).json";
import autoTable from "jspdf-autotable";
import LOGO from "./assets/janilda.png";
import dataQR from "./assets/qr_code.png";
import { useState } from "react";
import {
  formatAddress,
  formatDepto,
  formatNameByTypeDte,
  getDateSeparated,
  getHeightText,
  returnBoldText,
  splitTextIntoLines,
} from "./utils";

function Template2() {
  const [pdf, setPdf] = useState("");

  const makePdf = () => {
    const doc = new jsPDF();

    const items = dte.cuerpoDocumento.map((item) => {
      return [
        item.cantidad,
        item.descripcion,
        item.precioUni,
        item.ventaNoSuj,
        item.ventaExenta,
        item.ventaGravada,
      ];
    });

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
      body: items,
      startY: 92,
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: "#00b4d8",
        halign: "center",
        valign: "middle",
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: "auto" },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 25 },
      },
      theme: "plain",
      margin: { top: 92, left: 5, right: 5, bottom: 65 },
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
          doc.line(data.cell.x, data.cell.y, data.cell.x, data.cell.y + 143);
        }
      },
      didDrawPage: (data) => {
        const rightTopX = doc.internal.pageSize.width - 80;
        const rightTopY = data.settings.margin.top - 64;
        doc.setTextColor("#00b4d8");
        doc.setDrawColor("#00b4d8");
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");

        const { day, month, year } = getDateSeparated(
          dte.identificacion.fecEmi
        );

        doc.text("Dia", rightTopX + 10, rightTopY + 3, { align: "center" });

        doc.line(rightTopX + 25, rightTopY, rightTopX + 20, rightTopY + 10);
        doc.text("Mes", rightTopX + 38, rightTopY + 3, { align: "center" });

        doc.line(rightTopX + 55, rightTopY, rightTopX + 50, rightTopY + 10);
        doc.text("Año", rightTopX + 65, rightTopY + 3, { align: "center" });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor("#000000");
        doc.setFontSize(7.5);
        doc.text(day, rightTopX + 10, rightTopY + 8, { align: "center" });
        doc.text(month, rightTopX + 38, rightTopY + 8, { align: "center" });
        doc.text(year, rightTopX + 65, rightTopY + 8, { align: "center" });
        doc.setTextColor("#00b4d8");
        doc.roundedRect(rightTopX, rightTopY, 75, 10, 2, 2, "S");

        autoTable(doc, {
          startY: 2,
          margin: { top: 2, left: 5, right: 5 },
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
              doc.addImage(
                LOGO,
                "PNG",
                data.cell.x + 2,
                data.cell.y,
                30,
                30,
                "LOGO",
                "SLOW"
              );
            }
            if (data.column.index === 1 && data.row.index === 0) {
              const cellX = data.cell.x;
              const cellY = data.cell.y;
              const cellWidth = data.cell.width;
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
              returnBoldText(doc, docName, cellX + 50, cellY + 8, "center");
              doc.setFontSize(6);
              doc.text(
                dte.identificacion.numeroControl,
                cellX + 50,
                cellY + 13,
                {
                  align: "center",
                }
              );
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

              doc.addImage(
                dataQR,
                "PNG",
                cellX + 5,
                cellY + 1,
                23,
                23,
                "QR",
                "SLOW"
              );
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
        doc.setTextColor("#000000");
        doc.text(dte.receptor.nombre, marginX + 13, StartY + 4);
        doc.setTextColor("#00b4d8");
        doc.line(marginX + 13, StartY + 5, tableWidth + 5, StartY + 5);
        StartY += 7;
        const x = (tableWidth + 5) / 2;
        doc.text("Dirección:", marginX + 2, StartY + 5);
        doc.setTextColor("#000000");
        const maxWidth = 80; // Ajusta este valor según el ancho disponible

        const text = `${dte.receptor.direccion.complemento} ${formatAddress(
          dte.receptor.direccion.departamento,
          dte.receptor.direccion.municipio,
          false
        )}`;

        const lines = splitTextIntoLines(doc, text, maxWidth, 8);
        let y = StartY + 4;
        lines.forEach((line, index) => {
          doc.text(line, index === 0 ? marginX + 16 : marginX + 2, y);
          y += 6;
        });
        doc.setTextColor("#00b4d8");
        doc.line(marginX + 16, StartY + 5, (tableWidth + 5) / 2, StartY + 5);
        doc.line(x + 15, StartY + 5, tableWidth + 5, StartY + 5);
        doc.text("NIT no:", x + 3, StartY + 5);
        doc.setTextColor("#000000");
        doc.text(dte.receptor.nit ?? "", x + 15, StartY + 4);
        doc.setTextColor("#00b4d8");
        StartY += 7;
        doc.line(marginX + 2, StartY + 5, (tableWidth + 5) / 2, StartY + 5);
        doc.line(x + 19, StartY + 5, tableWidth + 5, StartY + 5);
        doc.text("Registro no:", x + 3, StartY + 5);
        doc.setTextColor("#000000");
        doc.text(dte.receptor.nrc ?? "", x + 19, StartY + 4);
        doc.setTextColor("#00b4d8");
        StartY += 7;
        doc.text("Depto:", marginX + 2, StartY + 5);
        doc.setTextColor("#000000");
        doc.text(
          formatDepto(dte.receptor.direccion.departamento),
          marginX + 12,
          StartY + 4
        );
        doc.setTextColor("#00b4d8");
        doc.line(marginX + 12, StartY + 5, (tableWidth + 5) / 2, StartY + 5);
        doc.line(x + 10, StartY + 5, tableWidth + 5, StartY + 5);
        doc.text("Giro:", x + 3, StartY + 5);
        doc.setTextColor("#000000");
        doc.text(dte.receptor.descActividad ?? "", x + 12, StartY + 4);
        doc.setTextColor("#00b4d8");
        StartY += 7;
        doc.text("Codigo generacion:", marginX + 2, StartY + 5);
        doc.setTextColor("#000000");
        doc.text(dte.identificacion.codigoGeneracion, marginX + 27, StartY + 4);
        doc.setTextColor("#00b4d8");
        doc.line(marginX + 27, StartY + 5, (tableWidth + 5) / 2, StartY + 5);
        doc.line(x + 25, StartY + 5, tableWidth + 5, StartY + 5);
        doc.text("Sello Recibido:", x + 3, StartY + 5);
        doc.setTextColor("#000000");
        doc.text(dte.respuestaMH.selloRecibido, x + 25, StartY + 4);
        StartY += 7;
        doc.setTextColor("#00b4d8");
        doc.text("Venta a cuenta de:", marginX + 2, StartY + 5);
        doc.line(marginX + 27, StartY + 5, (tableWidth + 5) / 2, StartY + 5);
        doc.line(x + 30, StartY + 5, tableWidth + 5, StartY + 5);
        doc.text("Condición de pago:", x + 3, StartY + 5);
        StartY += 7;
        doc.text("No. de doc relacionado:", marginX + 2, StartY + 5);
        doc.line(marginX + 33, StartY + 5, (tableWidth + 5) / 2, StartY + 5);
        doc.text("Fecha de doc relacionado:", x + 3, StartY + 5);
        doc.line(x + 38, StartY + 5, tableWidth + 5, StartY + 5);

        doc.setDrawColor("#00b4d8");
        doc.line(
          data.settings.margin.left,
          doc.internal.pageSize.height - 62,
          doc.internal.pageSize.width - data.settings.margin.right,
          doc.internal.pageSize.height - 62
        );

        const iva = dte.resumen.tributos
          ? dte.resumen.tributos
              .map((tributo) => tributo.valor)
              .reduce((a, b) => a + b)
          : dte.resumen.totalIva ?? 0;

        autoTable(doc, {
          startY: doc.internal.pageSize.height - 60.5,
          margin: { top: 5, left: 5, right: 5, bottom: 0 },
          showHead: false,
          head: [["", "", "", "", "", ""]],
          theme: "plain",
          body: [
            [
              "",
              "",
              "Suma",
              dte.resumen.totalNoSuj,
              dte.resumen.totalExenta,
              dte.resumen.totalGravada,
            ],
            ["", "", "13% de IVA", "", "", iva],
            ["", "", "Sub-Total", "", "", dte.resumen.totalGravada],
            [
              "",
              "",
              { colSpan: 2, content: "(-) 1% de IVA Retenido" },
              "",
              dte.resumen.ivaPerci1,
            ],
            ["", "", { colSpan: 2, content: "Venta Exenta" }, "", dte.resumen.totalExenta],
            [
              "",
              "",
              { colSpan: 2, content: "Venta no Sujeta" },
              "",
              dte.resumen.totalNoSuj,
            ],
            ["", "", { colSpan: 2, content: "Venta Total" }, "", dte.resumen.montoTotalOperacion],
          ],
          columnStyles: {
            0: { cellWidth: 18, minCellHeight: 8 },
            1: { cellWidth: "auto", minCellHeight: 8 },
            2: { cellWidth: 25, minCellHeight: 8, textColor: "#00b4d8" },
            3: { cellWidth: 20, minCellHeight: 8 },
            4: { cellWidth: 20, minCellHeight: 8 },
            5: { cellWidth: 25, minCellHeight: 8 },
          },
          bodyStyles: {
            fontSize: 9,
          },
          didDrawCell(data) {
            if (data.section === "body") {
              doc.setDrawColor("#00b4d8");
              if ([3, 4].includes(data.column.index) && data.row.index === 0) {
                doc.line(
                  data.cell.x,
                  data.cell.y + data.cell.height,
                  data.cell.x + data.cell.width,
                  data.cell.y + data.cell.height
                );

                if (data.column.index === 3) {
                  doc.line(
                    data.cell.x,
                    data.cell.y - 2,
                    data.cell.x,
                    data.cell.y + data.cell.height
                  );
                }
              }
              if ([2, 4, 5].includes(data.column.index)) {
                if (data.row.index === 0) {
                  doc.line(
                    data.cell.x,
                    data.cell.y - 2,
                    data.cell.x,
                    data.cell.y + 56.5
                  );
                }
                if (data.column.index === 3 && data.row.index === 1) {
                  doc.line(
                    data.cell.x,
                    data.cell.y + data.cell.height,
                    data.cell.x + data.cell.width,
                    data.cell.y + data.cell.height
                  );
                }
                if (data.column.index === 5 && data.row.index <= 5) {
                  doc.line(
                    data.cell.x,
                    data.cell.y + data.cell.height,
                    data.cell.x + data.cell.width,
                    data.cell.y + data.cell.height
                  );
                }
              }

              if (data.row.index === 0 && data.column.index === 0) {
                let startY = data.cell.y;
                doc.setFont("helvetica", "bold");
                doc.setTextColor("#00b4d8");
                doc.text("Son:", data.cell.x + 3, startY + 5);
                doc.setFont("helvetica", "normal");
                doc.setTextColor("#000000");
                const text = doc.splitTextToSize(
                  dte.resumen.totalLetras,
                  80
                );
                doc.text(text, data.cell.x + 10, startY + 5);

                startY += 15;

                doc.line(data.cell.x, startY, 115, startY);
                doc.line(
                  data.cell.x + 57,
                  startY,
                  data.cell.x + 57,
                  startY + 25
                );
                doc.setFontSize(7);
                doc.setFont("helvetica", "bold");
                doc.setTextColor("#00b4d8");
                doc.text("ENTREGADO POR", data.cell.x + 30, startY + 5, {
                  align: "center",
                });
                doc.text("RECIBIDO POR", data.cell.x + 85, startY + 5, {
                  align: "center",
                });
                doc.setFontSize(7);
                doc.setFont("helvetica", "normal");
                doc.setTextColor("#00b4d8");
                doc.text("Nombre:", data.cell.x + 2, startY + 10);
                doc.line(data.cell.x + 13, startY + 10, 60, startY + 10);
                doc.text("Tipo doc.:", data.cell.x + 2, startY + 15);
                doc.line(data.cell.x + 15, startY + 15, 60, startY + 15);
                doc.text("Numero doc.", data.cell.x + 2, startY + 20);
                doc.line(data.cell.x + 17, startY + 20, 60, startY + 20);
                doc.text("Nombre:", data.cell.x + 58, startY + 10);
                doc.line(data.cell.x + 70, startY + 10, 114, startY + 10);
                doc.text("Tipo doc.:", data.cell.x + 58, startY + 15);
                doc.line(data.cell.x + 70, startY + 15, 114, startY + 15);
                doc.text("Numero doc.", data.cell.x + 58, startY + 20);
                doc.line(data.cell.x + 73, startY + 20, 114, startY + 20);

                doc.line(data.cell.x, startY + 25, 115, startY + 25);
                doc.setFont("helvetica", "bold");
                doc.text("Observaciones:", data.cell.x + 2, startY + 30);
              }
            }
          },
        });
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
