import { useRouter } from "@tanstack/react-router";
import { useCallback } from "react";
import { generateSchedules } from "../api/api";

export const useGenerateSchedule = () => {
  const router = useRouter();

  const generate = useCallback(async () => {
    try {
      await generateSchedules();
      router.invalidate();
    } catch (error) {
      console.error("Failed to generate schedule", error);
    }
  }, [router]);

  return {
    generate,
  };
};
