import {
  serial,
  text,
  pgTable,
  timestamp,
  varchar,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";

export const UserSystemEnum = pgEnum("user_system_enum", ["user", "system"]);

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  pdfname: text("pdf_name").notNull(),
  pdfurl: text("pdf_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  filekey: text("file_key").notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatid: integer("chatid")
    .references(() => chats.id)
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  role: UserSystemEnum("role").notNull(),
});
