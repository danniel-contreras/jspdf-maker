import { DateTime } from "luxon";

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
