import dayjs from "dayjs";

export type DeadlineLabel = {
  text: string;
  isOverdue: boolean;
  isToday: boolean;
};

export const formatDeadline = (deadline: Date | string): DeadlineLabel => {
  const target = dayjs(deadline);
  const today = dayjs();

  if (target.isBefore(today)) {
    return { text: "Overdue", isOverdue: true, isToday: false };
  }
  if (target.isSame(today, "day")) {
    return {
      text: `Today, ${target.format("HH:mm")}`,
      isOverdue: false,
      isToday: true,
    };
  }
  if (target.isSame(today.add(1, "day"), "day")) {
    return { text: "Tomorrow", isOverdue: false, isToday: false };
  }
  return { text: target.format("MMM D"), isOverdue: false, isToday: false };
};

export const formatEstimatedTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins.toString().padStart(2, "0")}m`;
};
