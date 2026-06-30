export type EventFormData = {
  title: string;
  description: string;
  startAt: Date | null;
  endAt: Date | null;
};

export type EventFormDataValidated = {
  title: string;
  description: string;
  startAt: Date;
  endAt: Date;
};

export const createEmptyEventFormData = (): EventFormData => ({
  title: "",
  description: "",
  startAt: null,
  endAt: null,
});
