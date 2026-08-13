export interface User {
  id: string;
  username: string;
  email: string;
  email_verified_at: Date | null;
  password: string;
  password_changed_at: Date;
  phone: string | null;
  avatar_url: string | null;
  features: string[];
  cpf: string | null;
  address: string | null;
  notes: string | null;
  banned_at: Date | null;
  banned_by: string | null;
  banned_reason: string | null;
  deactivated_at: Date | null;
  created_at: Date | string;
  updated_at: Date;
}

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  cpf: string;
  phone: string;
  address: string;
  notes?: string | null;
  features?: string[];
  avatar_url?: string | null;
}

export interface CreateUserInputNoRequired {
  username?: string;
  email?: string;
  password?: string;
  cpf?: string;
  phone?: string;
  address?: string;
  notes?: string | null;
  features?: string[];
  avatar_url?: string | null;
}

export interface UserSecureOutputProps {
  id: User["id"];
  username: User["username"];
  features: User["features"];
  created_at: User["created_at"];
  updated_at: User["updated_at"];
  address: User["address"];
  notes: User["notes"];
  phone: User["phone"];
  avatar_url: User["avatar_url"];
}
