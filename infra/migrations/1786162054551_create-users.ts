import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    // For reference, GitHub limits usernames to 39 characters.
    username: {
      type: "varchar(30)",
      notNull: true,
      unique: true,
    },
    cpf: {
      type: "varchar(30)",
      notNull: true,
      unique: true,
    },
    // Why 254 in length? https://stackoverflow.com/a/1199238
    email: {
      type: "varchar(254)",
      notNull: true,
      unique: true,
    },
    // bcrypt hash. Pepper NÃO fica no banco — é segredo de aplicação
    // (env var), concatenado à senha antes do hash/verify.
    password: {
      type: "varchar(60)",
      notNull: true,
    },
    password_changed_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },
    phone: {
      type: "varchar(30)",
    },
    address: {
      type: "text",
      notNull: true,
    },
    avatar_url: {
      type: "text",
    },
    // --- Flags administrativas ---
    notes: {
      type: "text",
    },
    features: {
      type: "varchar[]",
      notNull: true,
      default: "{}",
    },
    banned_at: {
      type: "timestamptz",
    },
    banned_by: {
      type: "uuid",
      references: "users(id)",
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    banned_reason: {
      type: "text",
    },
    deactivated_at: {
      type: "timestamptz",
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },
  });
}
