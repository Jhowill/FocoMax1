export const nowIso = () => new Date().toISOString();

export const getGreetingByHour = (dateLike: string | Date = new Date()) => {
  const date = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "Bom dia";
  }
  if (hour >= 12 && hour < 18) {
    return "Boa tarde";
  }
  return "Boa noite";
};

export const toDateKey = (dateLike: string | Date) => {
  const date = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDuration = (minutes: number) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs <= 0) {
    return `${mins} min`;
  }
  return `${hrs}h ${mins}min`;
};

export const formatClock = (seconds: number) => {
  const safeSeconds = Math.max(seconds, 0);
  const mm = `${Math.floor(safeSeconds / 60)}`.padStart(2, "0");
  const ss = `${safeSeconds % 60}`.padStart(2, "0");
  return `${mm}:${ss}`;
};

export const formatPtDate = (dateLike: string | Date) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(typeof dateLike === "string" ? new Date(dateLike) : dateLike);

export const formatPtDateTime = (dateLike: string | Date) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(typeof dateLike === "string" ? new Date(dateLike) : dateLike);
