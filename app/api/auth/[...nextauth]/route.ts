export { GET, POST } from "@/app/auth"

// Ensure this route handler runs in the Node.js runtime environment
// as it handles credential authentication which uses bcrypt and Prisma.
export const runtime = "nodejs"
