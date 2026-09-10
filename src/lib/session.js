import { auth } from "@/auth";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user) return null;
  return {
    id: Number(session.user.id),
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
  };
}