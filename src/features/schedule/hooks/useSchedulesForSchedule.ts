import type { ScheduleEventData, ScheduleProps } from "@mantine/schedule";
import { useRouter } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { editSchedule, type ScheduleListItem } from "../api/api";
import { moveScheduleKeepingDuration } from "./moveScheduleKeepingDuration";

export type UseEventsForScheduleProps = {
  source: ScheduleListItem[];
  openForm: (schedule: ScheduleListItem) => void;
};

const toScheduleData = (
  schedule: ScheduleListItem,
): ScheduleEventData<{ description: string; isEditable: true }> => ({
  id: schedule.id,
  title: schedule.task.title,
  payload: {
    description: schedule.task.description,
    isEditable: true,
  },
  start: schedule.startAt,
  end: schedule.endAt,
  color: "orange",
});

export const useSchedulesForSchedule = ({
  source,
  openForm: _,
}: UseEventsForScheduleProps) => {
  const router = useRouter();
  const [schedules, setSchedules] = useState(source);
  const data = useMemo(() => schedules.map(toScheduleData), [schedules]);

  useEffect(() => setSchedules(source), [source]);

  const onEventDrop = useCallback<NonNullable<ScheduleProps["onEventDrop"]>>(
    async ({ eventId, newStart }) => {
      const previousSchedule = schedules.find(
        (schedule) => schedule.id === eventId,
      );
      if (!previousSchedule) return;

      const updatedSchedule = moveScheduleKeepingDuration(
        previousSchedule,
        newStart,
      );

      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === updatedSchedule.id ? updatedSchedule : schedule,
        ),
      );

      try {
        await editSchedule({
          data: {
            id: updatedSchedule.id,
            startAt: dayjs(updatedSchedule.startAt).toDate(),
            endAt: dayjs(updatedSchedule.endAt).toDate(),
          },
        });

        router.invalidate();
      } catch (error) {
        setSchedules((prev) =>
          prev.map((schedule) =>
            schedule.id === previousSchedule.id ? previousSchedule : schedule,
          ),
        );
        console.error("Failed to move schedule", error);
      }
    },
    [router, schedules],
  );

  return { data, onEventDrop };
};
