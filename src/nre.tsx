import jsPDF from "jspdf";
import { useState } from "react";
import balance from "./balance.json";
import autoTable from "jspdf-autotable";
import { formatMoney } from "./utils";

export interface Root {
  accounts: Account[];
  ok: boolean;
}

export interface Account {
  id: number;
  code: string;
  name: string;
  majorAccount: string;
  accountLevel: string;
  accountType: string;
  uploadAs: string;
  subAccount: boolean;
  item: string;
  isActive: boolean;
  totalDebe: number;
  totalHaber: number;
  saldoAnterior: number;
}

function Nre() {
  const [pdf, setPdf] = useState("");

  function groupAccountsByPrefix(
    data: Root,
    isNormal: boolean = false
  ): { code: string; name: string; items: Account[] }[] {
    const majorAccounts = data.accounts.filter(
      (account: Account) => account.code.length === 1
    );
    const groupedAccounts = majorAccounts.map((majorAccount: Account) => {
      const items = data.accounts.filter((account: Account) =>
        account.code.startsWith(majorAccount.code)
      );

      return {
        code: majorAccount.code,
        name: majorAccount.name,
        items: items.map((account: Account) => ({
          ...account,
          totalDebe: calcSaldoDorH(
            +account.totalDebe,
            +account.totalHaber,
            account.code.slice(0, 1),
            isNormal
          ).totalDebe,
          totalHaber: calcSaldoDorH(
            +account.totalDebe,
            +account.totalHaber,
            account.code.slice(0, 1),
            isNormal
          ).totalHaber,
          saldoAnterior: +account.saldoAnterior,
        })),
      };
    });
    return groupedAccounts;
  }

  const calcSaldoDorH = (
    totalDebe: number,
    totalHaber: number,
    type: string,
    isNormal: boolean = false
  ) => {
    switch (type) {
      case "1":
        return {
          totalDebe: isNormal ? totalDebe : totalDebe - totalHaber,
          totalHaber: isNormal ? totalHaber : 0,
        };
      case "2":
        return {
          totalDebe: isNormal ? totalDebe : 0,
          totalHaber: isNormal ? totalHaber : totalHaber - totalDebe,
        };
      case "4":
        return {
          totalDebe: isNormal ? totalDebe : totalDebe - totalHaber,
          totalHaber: isNormal ? totalHaber : 0,
        };
      case "5":
        return {
          totalDebe: isNormal ? totalDebe : 0,
          totalHaber: isNormal ? totalHaber : totalHaber - totalDebe,
        };
      default:
        return {
          totalDebe: 0,
          totalHaber: 0,
        };
    }
  };

  const calcSaldoWithSaldoAnterior = (
    totalDebe: number,
    totalHaber: number,
    saldoAnterior: number,
    type: string
  ) => {
    switch (type) {
      case "1":
        return (
          calcSaldoDorH(totalDebe, totalHaber, type).totalDebe + saldoAnterior
        );
      case "2":
        return (
          calcSaldoDorH(totalDebe, totalHaber, type).totalHaber + saldoAnterior
        );
      case "4":
        return (
          calcSaldoDorH(totalDebe, totalHaber, type).totalDebe + saldoAnterior
        );
      case "5":
        return (
          calcSaldoDorH(totalDebe, totalHaber, type).totalHaber + saldoAnterior
        );
      default:
        return 0;
    }
  };

  const handleGetPdf = async () => {
    const jsPdf = new jsPDF();
    const showBalance: boolean = true;
    const showTrialBalance: boolean = false;
    let sInicialFinal = 0;
    let tDebeFinal = 0;
    let tHaberFinal = 0;
    let sFinalFinal = 0;
    const items = groupAccountsByPrefix(
      balance,
      !showBalance && !showTrialBalance
    );

    for (const item of items) {
      const dataFormat = item.items
        .sort((a, b) => a.code.localeCompare(b.code))
        .map((it, index) => {
          const newSaldo = calcSaldoWithSaldoAnterior(
            +it.totalDebe,
            +it.totalHaber,
            +it.saldoAnterior,
            it.code.slice(0, 1)
          );

          if (
            showTrialBalance &&
            (it.code.slice(0, 1) === "2" || it.code.slice(0, 1) === "5")
          ) {
            const saldoAnterior = -Number(it.saldoAnterior);

            const saldoFinal =
              Number(saldoAnterior) +
              Math.abs(Number(it.totalDebe)) -
              Math.abs(Number(it.totalHaber));

            const saldoInicial = Number(+it.totalHaber) - Math.abs(saldoFinal);

            if (index === 0) {
              sInicialFinal = saldoInicial;
              tDebeFinal = Number(it.totalDebe);
              tHaberFinal = Number(it.totalHaber);
              sFinalFinal = Number(saldoFinal);
            }

            return [
              it.code,
              it.name,
              Number(saldoInicial),
              Number(it.totalDebe),
              Number(it.totalHaber),
              Number(saldoFinal),
            ];
          }

          if (showTrialBalance && index === 0) {
            sInicialFinal = Number(it.saldoAnterior);
            tDebeFinal = Number(it.totalDebe);
            tHaberFinal = Number(it.totalHaber);
            sFinalFinal = Number(newSaldo);
          }

          return [
            it.code,
            it.name,
            Number(it.saldoAnterior),
            Number(it.totalDebe),
            Number(it.totalHaber),
            Number(newSaldo),
          ];
        });

      const data = dataFormat.map((it) => {
        return [
          it[0],
          it[1],
          Number(it[2]) < 0
            ? `(${formatMoney(Math.abs(Number(it[2])))})`
            : formatMoney(Number(it[2])),
          Number(it[3]) < 0
            ? `(${formatMoney(Math.abs(Number(it[3])))})`
            : formatMoney(Number(it[3])),
          Number(it[4]) < 0
            ? `(${formatMoney(Math.abs(Number(it[4])))})`
            : formatMoney(Number(it[4])),
          Number(it[5]) < 0
            ? `(${formatMoney(Math.abs(Number(it[5])))})`
            : formatMoney(Number(it[5])),
        ];
      });

      let { lastAutoTable } = jsPdf as unknown as {
        lastAutoTable: { finalY: number };
      };
      const spaceNeededForTitleAndHeader = 20; // Espacio estimado para el título y el encabezado
      const currentY = lastAutoTable ? lastAutoTable.finalY : 30;

      if (
        currentY + spaceNeededForTitleAndHeader >
        jsPdf.internal.pageSize.height - 20
      ) {
        jsPdf.addPage(); // Forzar salto de página si no cabe
        lastAutoTable = {
          finalY: 30,
        };
      }

      const formatName = (code: string) => {
        switch (code) {
          case "1":
            return "Activo";
          case "2":
            return "Pasivo";
          case "4":
            return "Gastos";
          case "5":
            return "Ingresos";
          default:
            return item.name;
        }
      };

      jsPdf.setFontSize(10);
      jsPdf.setFont("helvetica", "bold");
      jsPdf.text(
        formatName(item.code),
        5,
        lastAutoTable ? lastAutoTable.finalY + 10 : 30
      );
      jsPdf.setFont("helvetica", "normal");

      const saldo = calcSaldoWithSaldoAnterior(
        +item.items[0].totalDebe,
        +item.items[0].totalHaber,
        +item.items[0].saldoAnterior,
        item.code.slice(0, 1)
      );

      const foot = showTrialBalance
        ? [
            [
              "",
              "",
              sInicialFinal < 0
                ? `(${formatMoney(Math.abs(sInicialFinal))})`
                : formatMoney(sInicialFinal),
              tDebeFinal < 0
                ? `(${formatMoney(Math.abs(tDebeFinal))})`
                : formatMoney(tDebeFinal),
              tHaberFinal < 0
                ? `(${formatMoney(Math.abs(tHaberFinal))})`
                : formatMoney(tHaberFinal),
              sFinalFinal < 0
                ? `(${formatMoney(Math.abs(sFinalFinal))})`
                : formatMoney(sFinalFinal),
            ],
          ]
        : [
            [
              "",
              "",
              Number(item.items[0].saldoAnterior) < 0
                ? `(${formatMoney(Math.abs(item.items[0].saldoAnterior))})`
                : formatMoney(item.items[0].saldoAnterior),
              `$${
                +item.items[0].totalDebe < 0
                  ? `(${formatMoney(Math.abs(-item.items[0].totalDebe))})`
                  : formatMoney(+item.items[0].totalDebe)
              }`,
              `$${
                +item.items[0].totalHaber < 0
                  ? `(${formatMoney(Math.abs(-item.items[0].totalHaber))})`
                  : formatMoney(+item.items[0].totalHaber)
              }`,
              `$${
                saldo < 0
                  ? `(${formatMoney(Math.abs(saldo))})`
                  : formatMoney(saldo)
              }`,
            ],
          ];

      autoTable(jsPdf, {
        margin: {
          horizontal: 3,
          top: 35,
        },
        startY: (lastAutoTable ? lastAutoTable.finalY + 10 : 30) + 3,
        showHead: "firstPage",
        showFoot: "lastPage",
        head: [["Código", "Nombre", "Saldo inicial", "Debe", "Haber", "Saldo"]],
        foot: foot,
        body: data,
        bodyStyles: {
          fontSize: 7,
        },
        headStyles: {
          fontSize: 8,
        },
        footStyles: {
          fontSize: 7,
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: "auto" },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 },
          4: { cellWidth: 30 },
          5: { cellWidth: 30 },
        },
        theme: "plain",
        didDrawCell: (data) => {
          if (data.section === "head") {
            jsPdf.setDrawColor(0, 0, 0);
            jsPdf.line(
              1,
              data.cell.y - 1,
              jsPdf.internal.pageSize.width - 2,
              data.cell.y - 1
            );
            jsPdf.line(
              1,
              data.cell.y,
              jsPdf.internal.pageSize.width - 2,
              data.cell.y
            );
            jsPdf.line(
              1,
              data.cell.y + data.cell.height,
              jsPdf.internal.pageSize.width - 2,
              data.cell.y + data.cell.height
            );
          }
          if (data.section === "foot") {
            jsPdf.setDrawColor(0, 0, 0);
            jsPdf.line(
              85,
              data.cell.y,
              jsPdf.internal.pageSize.width - 2,
              data.cell.y
            );
          }
        },
        didDrawPage: () => {
          jsPdf.setFontSize(12);
          jsPdf.setFont("helvetica", "bold");
          jsPdf.text("MADNESS", jsPdf.internal.pageSize.width / 2, 10, {
            align: "center",
          });
          jsPdf.text(
            "Balance de comprobación",
            jsPdf.internal.pageSize.width / 2,
            15,
            {
              align: "center",
            }
          );

          jsPdf.setFontSize(10);
          jsPdf.setFont("helvetica", "normal");

          jsPdf.text(
            "del 3 de Marzo de 2024 al 3 de Marzo de 2025",
            jsPdf.internal.pageSize.width / 2,
            20,
            {
              align: "center",
            }
          );
        },
      });
    }

    const url = jsPdf.output("bloburl");

    setPdf(url as unknown as string);
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <button onClick={handleGetPdf}>Exportar a PDF</button>
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

export default Nre;
