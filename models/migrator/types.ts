export interface Migration {
  path: string;
  name: string;
  timestamp: string;
}

export type MigrationSecureOutputProps = Migration;
