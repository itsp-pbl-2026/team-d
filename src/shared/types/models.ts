export interface Event {
  id: string;
  title: string;
  description: string;
  start_at: string; // ISO 8601 string or Date, using string for JSON serialization compatibility
  end_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline_at: string;
  estimated_minutes: number;
  actual_minutes: number;
  priority: number;
  progress: number;
  status: string;
}

export interface Schedule {
  id: string;
  taskId: string;
  start_at: string;
  end_at: string;
}

export interface Setting {
  id: string; // the prompt said "ig" but probably meant "id"
  notification: boolean;
  break_time_minutes?: number; // Added since the requirements mentioned "break time setting"
}
