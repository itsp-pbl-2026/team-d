export const formatDeadline = (
  deadline: Date | string,
): {
  text: string;
  isOverdue: boolean;
  isToday: boolean;
} => {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateOnly = new Date(
    deadlineDate.getFullYear(),
    deadlineDate.getMonth(),
    deadlineDate.getDate(),
  );

  if (dateOnly < today) {
    return { text: "Overdue", isOverdue: true, isToday: false };
  }
  if (dateOnly.getTime() === today.getTime()) {
    const timeStr = deadlineDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { text: `Today, ${timeStr}`, isOverdue: false, isToday: true };
  }
  if (dateOnly.getTime() === tomorrow.getTime()) {
    return { text: "Tomorrow", isOverdue: false, isToday: false };
  }
  return {
    text: deadlineDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    isOverdue: false,
    isToday: false,
  };
};

export const formatEstimatedTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins.toString().padStart(2, "0")}m`;
};

export const formatCompletedDate = (deadline: Date | string): string => {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dateOnly = new Date(
    deadlineDate.getFullYear(),
    deadlineDate.getMonth(),
    deadlineDate.getDate(),
  );

  if (dateOnly.getTime() === today.getTime()) {
    const timeStr = deadlineDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `Completed Today, ${timeStr}`;
  }
  if (dateOnly.getTime() === yesterday.getTime()) {
    return "Completed Yesterday";
  }
  return `Completed ${deadlineDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
};
