import { useState } from "react";
import "./App.css";
import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";
import QR from "./Codigo_QR.svg.png";

function App() {
  const [pdf, setPdf] = useState("");

  const exportToPdf = () => {
    const doc = new jsPDF();

    const margin = 5;
    const rectWidth = doc.internal.pageSize.getWidth() - 2 * margin;
    const rectHeight = doc.internal.pageSize.getHeight() - 2 * margin;
    const radius = 5;

    doc.roundedRect(margin, margin, rectWidth, rectHeight, radius, radius, "S");

    doc.setFontSize(8);
    doc.text("DOCUMENTO TRIBUTARIO ELECTRONICO", 105, 15, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.text("FACTURA", 105, 20, { align: "center" });

    autoTable(doc, {
      margin: { left: 4, right: 10 },
      startY: 18,
      showHead: false,
      body: [["", "", ""]],
      theme: "plain",
      didDrawCell: (data) => {
        if (data.column.index === 0 && data.row.index === 0) {
          const y = data.cell.y + 6;
          autoTable(doc, {
            margin: { left: 5, right: 10 },
            startY: y,
            showHead: false,
            body: [
              [
                "Código de generación : ",
                "82FF4565-DF06-4C4C-B521-2F61536171EF",
              ],
              ["Número de Control : ", "DTE-01-M001P001-000000000000001"],
              [
                "Sello de Recepción : ",
                "202563C0175AA0F643048DAFD62BCAA06A60B3KD",
              ],
            ],
            theme: "plain",
            bodyStyles: { fontSize: 6 },
            columnStyles: {
              0: {
                cellWidth: 30,
                minCellHeight: 5,
                cellPadding: 0.1,
                halign: "right",
                valign: "top",
                fontStyle: "bold",
              },
              1: { cellWidth: 55, minCellHeight: 5, cellPadding: 0.1 },
            },
          });
        }
        if (data.column.index === 1 && data.row.index === 0) {
          const qrSize = 25; // Tamaño del QR
          const cellWidth = data.cell.width;
          const xOffset = (cellWidth - qrSize) / 2;
          doc.addImage(
            QR,
            "PNG",
            data.cell.x + xOffset + 2,
            data.cell.y + 2,
            qrSize,
            qrSize,
            "QR",
            "SLOW"
          );
        }
        if (data.column.index === 2 && data.row.index === 0) {
          const y = data.cell.y + 6;
          autoTable(doc, {
            margin: { left: data.cell.x + 15, right: 10 },
            startY: y,
            showHead: false,
            body: [
              ["Modelo de Facturación : ", "Previo"],
              ["Tipo de Transmisión : ", "Normal"],
              ["Fecha y Hora de Generación : ", "2025-01-07 18:42:17"],
            ],
            theme: "plain",
            bodyStyles: { fontSize: 6 },
            columnStyles: {
              0: {
                cellWidth: 30,
                minCellHeight: 5,
                cellPadding: 0.1,
                halign: "right",
                valign: "top",
                fontStyle: "bold",
              },
              1: { cellWidth: 55, minCellHeight: 5, cellPadding: 0.1 },
            },
          });
        }
      },
      bodyStyles: {
        fontSize: 6.5,
      },
      columnStyles: {},
    });

    let lastAutotableY = (
      doc as unknown as {
        lastAutoTable: { finalY: number };
      }
    ).lastAutoTable.finalY;

    doc.text("EMISOR", 55, lastAutotableY + 22);
    doc.text("RECEPTOR", 145, lastAutotableY + 22);

    autoTable(doc, {
      startY: lastAutotableY + 5,
      showHead: false,
      theme: "plain",
      body: [["", ""]],
      didDrawCell: (data) => {
        const x = data.cell.x;
        const width = data.cell.width;
        const y = data.cell.y + 18;
        const height = 45;
        doc.setDrawColor(0, 0, 0);
        if (data.column.index === 0 && data.row.index === 0) {
          doc.roundedRect(x, y, width, height, 5, 5, "S");
          autoTable(doc, {
            margin: { left: data.cell.x + 3 },
            startY: y + 3,
            showHead: false,
            body: [
              ["Nombre o razón social : ", "ERNESTO AUGUSTO VALENZUELA"],
              ["NIT : ", "0614-050474-118-2"],
              ["NRC : ", " 163225-6"],
              ["Actividad economica : ", "COMEDORES"],
              [
                "Dirección : ",
                "5ª CALLE ORIENTE Y AVENIDA, MORAZAN BARRIO EL CENTRO, SONSONATE CENTRO, SONSONATE",
              ],
              ["Número de teléfono : ", "76656565"],
              ["Nombre Comercial : ", "ERNESTO AUGUSTO VALENZUELA"],
              ["Tipo de establecimiento : ", "Casa Matriz"],
            ],
            theme: "plain",
            bodyStyles: { fontSize: 6 },
            columnStyles: {
              0: {
                cellWidth: 30,
                minCellHeight: 5,
                cellPadding: 0.1,
                halign: "right",
                valign: "top",
                fontStyle: "bold",
              },
              1: { cellWidth: 55, minCellHeight: 5, cellPadding: 0.1 },
            },
          });
        }
        if (data.column.index === 0 && data.row.index === 0) {
          doc.roundedRect(x + 95, y, width, height - 5, 5, 5, "S");
          autoTable(doc, {
            margin: { left: data.cell.x + 95 },
            startY: y + 3,
            showHead: false,
            body: [
              ["Nombre o razón social : ", "VARIOS"],
              ["Otro: : ", ""],
              ["NRC : ", " 163225-6"],
              ["Correo electrónico: : ", "contrerasdanniel@gmail.com"],
              [
                "Dirección : ",
                "5ª CALLE ORIENTE Y AVENIDA, MORAZAN BARRIO EL CENTRO, SONSONATE CENTRO, SONSONATE",
              ],
              ["Número de teléfono : ", "76656565"],
            ],
            theme: "plain",
            bodyStyles: { fontSize: 6 },
            columnStyles: {
              0: {
                cellWidth: 30,
                minCellHeight: 5,
                cellPadding: 0.1,
                halign: "right",
                valign: "top",
                fontStyle: "bold",
              },
              1: { cellWidth: 55, minCellHeight: 5, cellPadding: 0.1 },
            },
          });
        }
      },
    });

    lastAutotableY = (
      doc as unknown as {
        lastAutoTable: { finalY: number };
      }
    ).lastAutoTable.finalY;

    doc.setFontSize(7);
    doc.text("VENTA A CUENTA DE TERCEROS", 105, lastAutotableY + 60, {
      align: "center",
    });
    autoTable(doc, {
      startY: lastAutotableY + 65,
      showHead: false,
      theme: "plain",
      body: [["NIT:", "", "Nombre, denominación o razón social:", ""]],
      bodyStyles: { lineWidth: 0 },
      columnStyles: {
        0: {
          cellWidth: 30,
          fontSize: 7,
          cellPadding: 0,
          halign: "center",
          valign: "middle",
          fontStyle: "bold",
        },
        1: {
          cellWidth: 55,
          cellPadding: 0,
          halign: "left",
          valign: "top",
          fontStyle: "bold",
        },
        2: {
          cellWidth: 40,
          cellPadding: 0,
          halign: "right",
          valign: "top",
          fontStyle: "bold",
          fontSize: 7,
        },
        3: {
          cellWidth: 55,
          cellPadding: 0,
          halign: "left",
          valign: "top",
          fontStyle: "bold",
        },
      },
      didDrawCell: function (data) {
        if (data.column.index === 0) {
          doc.roundedRect(data.cell.x, data.cell.y - 3, 185, 10, 3, 3, "S");
        }
      },
    });

    lastAutotableY = (
      doc as unknown as {
        lastAutoTable: { finalY: number };
      }
    ).lastAutoTable.finalY;

    doc.setFontSize(7);
    doc.text("DOCUMENTOS RELACIONADOS", 105, lastAutotableY + 5, {
      align: "center",
    });

    autoTable(doc, {
      margin: { top: lastAutotableY + 10 },
      showHead: false,
      theme: "plain",
      body: [
        ["Tipo de Documento", "N° de Documento", "Fecha de Documento:"],
        ["-", "-", "-"],
      ],
      bodyStyles: { lineWidth: 0.1, lineColor: [0, 0, 0], cellPadding: 1.5 },
      columnStyles: {
        0: {
          cellWidth: 61.5,
          fontSize: 7,
          fontStyle: "bold",
          halign: "center",
        },
        1: {
          cellWidth: 61.5,
          fontSize: 7,
          fontStyle: "bold",
          halign: "center",
        },
        2: {
          cellWidth: 61.5,
          fontSize: 7,
          fontStyle: "bold",
          halign: "center",
        },
      },
    });
    lastAutotableY = (
      doc as unknown as {
        lastAutoTable: { finalY: number };
      }
    ).lastAutoTable.finalY;

    doc.setFontSize(7);
    doc.text("OTROS DOCUMENTOS ASOCIADOS", 105, lastAutotableY + 5, {
      align: "center",
    });

    autoTable(doc, {
      margin: { top: lastAutotableY + 10 },
      showHead: false,
      theme: "plain",
      body: [
        ["Identificación del documento", "Descripción"],
        ["-", "-"],
      ],
      bodyStyles: { lineWidth: 0.1, lineColor: [0, 0, 0], cellPadding: 1.5 },
      columnStyles: {
        0: {
          cellWidth: 80,
          fontSize: 7,
          fontStyle: "bold",
          halign: "center",
        },
        1: {
          cellWidth: 105,
          fontSize: 7,
          fontStyle: "bold",
          halign: "center",
        },
      },
    });

    const data = doc.output("blob");

    setPdf(URL.createObjectURL(data));
  };

  return (
    <>
      <div className="card">
        <button onClick={() => exportToPdf()}>export to pdf</button>
        {pdf !== "" && (
          <iframe
            style={{ width: "100vw", height: "100vh" }}
            src={pdf}
          ></iframe>
        )}
      </div>
    </>
  );
}

export default App;
