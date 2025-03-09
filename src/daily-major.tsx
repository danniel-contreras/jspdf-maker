import jsPDF from "jspdf";
import { useState } from "react";
import dailyMajor from "./daily-major.json";
import { formatDdMmYyyy } from "./utils";
import autoTable from "jspdf-autotable";

function DailyMajor() {
  const [pdf, setPdf] = useState("");

  function formatMoney(amount: number): string {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const exportToPdf = () => {
    const doc = new jsPDF();

    for (const item of dailyMajor.majorAccounts) {
      let saldoAnterior = +item.saldoAnterior;
      if (item.items.length > 0 || saldoAnterior !== 0) {
        const data = item.items.map((it) => {
          return [
            formatDdMmYyyy(it.item.date),
            it.item.noPartida,
            it.accountCatalog.code,
            it.conceptOfTheTransaction ?? it.accountCatalog.name,
            formatMoney(+it.see),
            formatMoney(+it.should),
          ];
        });
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");

        let { lastAutoTable } = doc as unknown as {
          lastAutoTable: { finalY: number };
        };

        const canAddPage = lastAutoTable.finalY > 260;

        if (canAddPage) {
          console.log(lastAutoTable.finalY);
          console.log("agregar página");
          doc.addPage();
        }

        autoTable(doc, {
          margin: {
            horizontal: 3,
            top: 35,
          },
          showHead: "never",
          theme: "plain",
          startY: canAddPage
            ? 30
            : lastAutoTable
            ? lastAutoTable.finalY + 10
            : 30,
          head: [["", ""]],
          body: [
            [item.code,item.name],
          ],
          bodyStyles: {
            fontSize: 10,
          },
          columnStyles: {
            0: { cellWidth: 30, font: "helvetica", fontStyle: "bold" },
            1: { cellWidth: "auto" },
          },
        });

        lastAutoTable = (
          doc as unknown as {
            lastAutoTable: { finalY: number };
          }
        ).lastAutoTable;

        autoTable(doc, {
          margin: {
            horizontal: 3,
            top: 35,
          },
          showHead: "firstPage",
          showFoot: "lastPage",
          head: [["Fecha", "Numero", "Código", "Concepto", "Debe", "Haber"]],
          body: data,
          bodyStyles: {
            fontSize: 8,
          },
          headStyles: {
            fontSize: 9,
          },
          columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 20 },
            2: { cellWidth: 28 },
            3: { cellWidth: "auto" },
            4: { cellWidth: 38, halign: "right" },
            5: { cellWidth: 38, halign: "right" },
          },
          theme: "plain",
          startY: lastAutoTable ? lastAutoTable.finalY + 2 : 5,
          didParseCell: (data) => {
            if (data.section === "head") {
              if (data.column.index === 4 || data.column.index === 5) {
                data.cell.styles.halign = "right";
              }
            }
          },
          didDrawCell: (data) => {
            // if (data.section === "foot") {
            //   doc.setDrawColor(0, 0, 0);
            //   doc.setLineWidth(0.1);
            //   doc.line(
            //     60,
            //     data.cell.y,
            //     doc.internal.pageSize.width - 2,
            //     data.cell.y
            //   );
            // }
            if (data.section === "head") {
              doc.setDrawColor(0, 0, 0);
              doc.line(
                1,
                data.cell.y - 1,
                doc.internal.pageSize.width - 2,
                data.cell.y - 1
              );
              doc.line(
                1,
                data.cell.y,
                doc.internal.pageSize.width - 2,
                data.cell.y
              );
              doc.line(
                1,
                data.cell.y + data.cell.height,
                doc.internal.pageSize.width - 2,
                data.cell.y + data.cell.height
              );
            }
          },
          didDrawPage: () => {
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("MADNESS", doc.internal.pageSize.width / 2, 10, {
              align: "center",
            });
            doc.text(
              "Libro diario mayor",
              doc.internal.pageSize.width / 2,
              15,
              {
                align: "center",
              }
            );

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");

            doc.text(
              "del 3 de Marzo de 2024 al 3 de Marzo de 2025",
              doc.internal.pageSize.width / 2,
              20,
              {
                align: "center",
              }
            );
            doc.text(
              `VALORES EXPRESADOS EN US DOLARES`,
              doc.internal.pageSize.width / 2,
              25,
              {
                align: "center",
              }
            );
          },
        });
      }
    }

    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    setPdf(url);
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <button onClick={exportToPdf}>Exportar a PDF</button>
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

export default DailyMajor;
