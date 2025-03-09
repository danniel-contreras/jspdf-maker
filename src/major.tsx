import { useState } from "react";
import MajorItems from "./major.json";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDdMmYyyy } from "./utils";

function MajorAccount() {
  const [pdf, setPdf] = useState("");
  const exportToPdf = () => {
    const doc = new jsPDF();

    const calcSaldo = (
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

    let allTotalSee = 0;
    let allTotalShould = 0;

    for (const item of MajorItems.majorAccounts) {
      let saldoAnterior = +item.saldoAnterior;

      let data: string[][] = [];

      if (item.items.length > 0 || saldoAnterior !== 0) {
        data = item.items.map((it, index) => {
          saldoAnterior = calcSaldo(
            item.uploadAs,
            +it.totalDebe,
            +it.totalHaber,
            saldoAnterior,
            index,
            saldoAnterior
          );
          const itemsRes = [
            formatDdMmYyyy(it.day),
            "Transacciones del día",
            formatMoney(+it.totalDebe),
            formatMoney(+it.totalHaber),
            +saldoAnterior < 0
              ? `(${formatMoney(Math.abs(saldoAnterior))})`
              : formatMoney(saldoAnterior),
          ];

          return itemsRes;
        });

        const totalSee = item.items.reduce((acc, it) => acc + +it.totalDebe, 0);
        const totalShould = item.items.reduce(
          (acc, it) => acc + +it.totalHaber,
          0
        );
        allTotalSee += totalSee;
        allTotalShould += totalShould;
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
            ["Cuenta:", item.code],
            ["Nombre de Cuenta:", item.name],
          ],
          columnStyles: {
            0: { cellWidth: 38, font: "helvetica", fontStyle: "bold" },
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
          foot: [
            [
              "",
              "Total Cuenta:",
              formatMoney(totalSee),
              formatMoney(totalShould),
              data.length > 0
                ? data[data.length - 1][4]
                : item.saldoAnterior < 0
                ? `(${Math.abs(item.saldoAnterior).toFixed(2)})`
                : item.saldoAnterior.toFixed(2),
            ],
          ],
          body: [
            [
              "",
              "",
              "",
              "Saldo anterior:",
              item.saldoAnterior < 0
                ? `(${Math.abs(item.saldoAnterior).toFixed(2)})`
                : item.saldoAnterior.toFixed(2),
            ],
            ...data,
          ],
          theme: "plain",
          head: [["Fecha", "Concepto", "Debe", "Haber", "Saldo"]],
          startY: lastAutoTable ? lastAutoTable.finalY + 2 : 5,
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: "auto" },
            2: { cellWidth: 38 },
            3: { cellWidth: 38 },
            4: { cellWidth: 38 },
          },
          didDrawCell: (data) => {
            if (data.section === "foot") {
              doc.setDrawColor(0, 0, 0);
              doc.setLineWidth(0.1);
              doc.line(
                60,
                data.cell.y,
                doc.internal.pageSize.width - 2,
                data.cell.y
              );
            }
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
            doc.text("Libro mayor", doc.internal.pageSize.width / 2, 15, {
              align: "center",
            });

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

    const lastAutoTable = (
      doc as unknown as {
        lastAutoTable: { finalY: number };
      }
    ).lastAutoTable;

    autoTable(doc, {
      margin: {
        horizontal: 3,
        top: 35,
      },
      showHead: "never",
      theme: "plain",
      startY: lastAutoTable ? lastAutoTable.finalY + 15 : 10,
      head: [["", "", "", "", ""]],
      body: [["", "Total General:", formatMoney(allTotalSee), formatMoney(allTotalShould), ""]],
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: "auto", halign: "right" },
        2: { cellWidth: 38 },
        3: { cellWidth: 38 },
        4: { cellWidth: 38 },
      },
      didDrawCell(data){
        if (data.section === "body") {
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.1);
          doc.line(
            60,
            data.cell.y,
            doc.internal.pageSize.width - 20,
            data.cell.y
          );
          doc.line(
            60,
            data.cell.y -1,
            doc.internal.pageSize.width - 20,
            data.cell.y -1
          );
        }
      }
    });

    setPdf(doc.output("bloburl") as unknown as string);
  };
  function formatMoney(amount: number): string {
    return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
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

export default MajorAccount;
