import { IdGenerator } from "./generator";

declare const idNominal: unique symbol;
export type Id<T> = string & { [idNominal]: T };

export const idGenerator = new IdGenerator();

export { IdGenerator } from "./generator";
