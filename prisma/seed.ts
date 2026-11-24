import "dotenv/config";
import { createDatabase } from "../src/server/db/client";
import { seedDefaults } from "../src/server/db/defaults";

const client = createDatabase();
seedDefaults(client)
  .then(() => console.log("Priorio defaults initialized."))
  .catch(() => { console.error("Could not initialize Priorio defaults."); process.exitCode = 1; })
  .finally(() => client.$disconnect());
