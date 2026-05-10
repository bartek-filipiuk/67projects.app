import { getPayload } from "payload";
import config from "../payload.config";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD required");
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be ≥ 12 chars");
  const payload = await getPayload({ config });
  const existing = await payload.find({
    collection: "users",
    where: { email: { equals: email } },
    limit: 1,
  });
  if (existing.totalDocs > 0) {
    console.log(`admin ${email} already exists`);
    return;
  }
  await payload.create({
    collection: "users",
    data: { email, password, role: "admin", name: "Bartek" },
  });
  console.log(`✓ admin user created: ${email}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
