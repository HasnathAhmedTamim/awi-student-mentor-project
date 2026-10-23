export type Role = "STUDENT" | "MENTOR";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};
