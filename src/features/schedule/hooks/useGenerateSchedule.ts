import { useRouter } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { generateSchedules } from "../api/api";

export const useGenerateSchedule = () => {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = useCallback(async () => {
    try {
      setIsGenerating(true);
      await generateSchedules();
      router.invalidate();
    } catch (error) {
      console.error("Failed to generate schedule", error);
    } finally {
      setIsGenerating(false);
    }
  }, [router]);

  return {
    generate,
    isGenerating,
  };
};
