import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

let db: Firestore;

try {
  // Load config
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  let config: any = {};
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }

  const projectId = config.projectId || process.env.GCLOUD_PROJECT || "gen-lang-client-0789380622";
  const databaseId = config.firestoreDatabaseId || "(default)";

  if (getApps().length === 0) {
    initializeApp({
      projectId: projectId
    });
  }

  // Support custom databaseId if provided
  if (databaseId && databaseId !== "(default)") {
    db = getFirestore(databaseId);
  } else {
    db = getFirestore();
  }

  console.log(`[FirebaseAdmin] Initialized Firestore with Project: ${projectId}, Database: ${databaseId}`);
} catch (error) {
  console.error("[FirebaseAdmin] Failed to initialize Firebase Admin SDK:", error);
  // Fail-safe mock database to prevent crashing the server
  db = {
    collection: (() => {
      console.warn("[FirebaseAdmin] Using mock collection due to initialization error");
      return {
        doc: () => ({
          set: async () => {},
          get: async () => ({ exists: false, data: () => null }),
          update: async () => {},
          collection: () => {}
        }),
        get: async () => ({ docs: [] }),
        add: async () => ({ id: "mock-id" })
      };
    }) as any
  } as any;
}

export { db };
export type { Firestore };
