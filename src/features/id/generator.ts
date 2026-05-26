import { nanoid } from "nanoid";
import type { Id } from ".";

export class IdGenerator {
  generate<T>(): Id<T> {
    return nanoid<Id<T>>();
  }
}
