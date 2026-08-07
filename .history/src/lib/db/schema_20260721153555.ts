import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("message_role", ["user", "assistant"]);
