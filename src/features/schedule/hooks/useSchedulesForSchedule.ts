import type { ScheduleEventData } from "@mantine/schedule";
import { useEffect, useMemo, useState } from "react";
import type { ScheduleListItem } from "../api/api";

export type UseEventsForScheduleProps = {
  source: ScheduleListItem[];
  openForm: (schedule: ScheduleListItem) => void;
};

const toScheduleData = (
  schedule: ScheduleListItem,
): ScheduleEventData<{ description: string }> => ({
  id: schedule.id,
  title: schedule.task.title,
  payload: {
    description: schedule.task.description,
  },
  start: schedule.startAt,
  end: schedule.endAt,
  color: "orange",
});

export const useSchedulesForSchedule = ({
  source,
  openForm: _,
}: UseEventsForScheduleProps) => {
  const [schedules, setSchedules] = useState(source);
  const data = useMemo(() => schedules.map(toScheduleData), [schedules]);

  useEffect(() => setSchedules(source), [source]);

  return { data };
};
