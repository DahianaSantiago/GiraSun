// Firestore security rules tests.
// Requires the Firestore emulator to be running on port 8080.
// Run via: pnpm firebase:emulators (separate terminal) then pnpm test:rules
// Or in one shot: pnpm firebase:emulators:exec "pnpm test:rules"

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, afterEach, beforeAll, describe, it } from "vitest";

let testEnv: RulesTestEnvironment;

const RULES_PATH = resolve(__dirname, "../../../../../firestore.rules");

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "girasun-test",
    firestore: {
      rules: readFileSync(RULES_PATH, "utf-8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });

  // Seed the admin doc so isAdmin() works in rules tests.
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "admins", "admin@girasun.com"), {
      role: "admin",
      addedAt: new Date(),
    });
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

afterEach(async () => {
  await testEnv.clearFirestore();
  // Re-seed the admin doc after each clear.
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "admins", "admin@girasun.com"), {
      role: "admin",
      addedAt: new Date(),
    });
  });
});

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
const anon = () => testEnv.unauthenticatedContext().firestore();
const user = (uid = "user-1") =>
  testEnv.authenticatedContext(uid, { email: `${uid}@test.com` }).firestore();
const admin = () =>
  testEnv.authenticatedContext("admin-uid", { email: "admin@girasun.com" }).firestore();

const visibleComment = {
  postType: "cuento",
  postSlug: "mi-historia",
  uid: "user-1",
  authorName: "Test User",
  body: "Un comentario de prueba.",
  createdAt: serverTimestamp(),
  hidden: false,
};

const hiddenComment = { ...visibleComment, hidden: true };

// ---------------------------------------------------------------------------
// /comments
// ---------------------------------------------------------------------------
describe("comments", () => {
  it("anyone can read a visible comment", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "comments", "c1"), visibleComment);
    });
    await assertSucceeds(getDoc(doc(anon(), "comments", "c1")));
    await assertSucceeds(getDoc(doc(user(), "comments", "c1")));
  });

  it("non-admin cannot read a hidden comment", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "comments", "c2"), hiddenComment);
    });
    await assertFails(getDoc(doc(anon(), "comments", "c2")));
    await assertFails(getDoc(doc(user(), "comments", "c2")));
  });

  it("admin can read a hidden comment", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "comments", "c3"), hiddenComment);
    });
    await assertSucceeds(getDoc(doc(admin(), "comments", "c3")));
  });

  it("authenticated user can create a valid comment", async () => {
    await assertSucceeds(
      setDoc(doc(user("user-1"), "comments", "new-comment"), {
        postType: "cuento",
        postSlug: "mi-historia",
        uid: "user-1",
        authorName: "Test User",
        body: "Qué historia tan hermosa.",
        createdAt: serverTimestamp(),
      }),
    );
  });

  it("cannot create a comment with a mismatched uid", async () => {
    await assertFails(
      setDoc(doc(user("user-1"), "comments", "bad-uid"), {
        postType: "cuento",
        postSlug: "mi-historia",
        uid: "other-user",
        authorName: "Test User",
        body: "Cuerpo del comentario.",
        createdAt: serverTimestamp(),
      }),
    );
  });

  it("cannot create a comment with an invalid postType", async () => {
    await assertFails(
      setDoc(doc(user("user-1"), "comments", "bad-type"), {
        postType: "blog",
        postSlug: "mi-historia",
        uid: "user-1",
        authorName: "Test User",
        body: "Cuerpo del comentario.",
        createdAt: serverTimestamp(),
      }),
    );
  });

  it("cannot create a comment with hidden: true", async () => {
    await assertFails(
      setDoc(doc(user("user-1"), "comments", "hidden-create"), {
        postType: "cuento",
        postSlug: "mi-historia",
        uid: "user-1",
        authorName: "Test User",
        body: "Cuerpo del comentario.",
        createdAt: serverTimestamp(),
        hidden: true,
      }),
    );
  });

  it("unauthenticated user cannot create a comment", async () => {
    await assertFails(
      setDoc(doc(anon(), "comments", "anon-comment"), {
        postType: "cuento",
        postSlug: "mi-historia",
        uid: "anon",
        authorName: "Anon",
        body: "Cuerpo.",
        createdAt: serverTimestamp(),
      }),
    );
  });

  it("non-admin cannot update a comment", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "comments", "cu1"), visibleComment);
    });
    await assertFails(updateDoc(doc(user(), "comments", "cu1"), { hidden: true }));
  });

  it("admin can update (hide) a comment", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "comments", "cu2"), visibleComment);
    });
    await assertSucceeds(updateDoc(doc(admin(), "comments", "cu2"), { hidden: true }));
  });

  it("non-admin cannot delete a comment", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "comments", "cd1"), visibleComment);
    });
    await assertFails(deleteDoc(doc(user(), "comments", "cd1")));
  });

  it("admin can delete a comment", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "comments", "cd2"), visibleComment);
    });
    await assertSucceeds(deleteDoc(doc(admin(), "comments", "cd2")));
  });
});

// ---------------------------------------------------------------------------
// /likes
// ---------------------------------------------------------------------------
describe("likes", () => {
  const likeData = {
    postType: "cuento",
    postSlug: "mi-historia",
    uid: "user-1",
    createdAt: serverTimestamp(),
  };
  const likeId = "cuento_mi-historia_user-1";

  it("anyone can read likes", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "likes", likeId), likeData);
    });
    await assertSucceeds(getDoc(doc(anon(), "likes", likeId)));
    await assertSucceeds(getDoc(doc(user(), "likes", likeId)));
  });

  it("authenticated user can create a like with the correct doc id", async () => {
    await assertSucceeds(setDoc(doc(user("user-1"), "likes", likeId), likeData));
  });

  it("cannot create a like with wrong uid", async () => {
    await assertFails(
      setDoc(doc(user("user-1"), "likes", "cuento_mi-historia_user-2"), {
        ...likeData,
        uid: "user-2",
      }),
    );
  });

  it("cannot create a like with wrong doc id format", async () => {
    await assertFails(setDoc(doc(user("user-1"), "likes", "wrong-id"), likeData));
  });

  it("unauthenticated user cannot create a like", async () => {
    await assertFails(setDoc(doc(anon(), "likes", likeId), likeData));
  });

  it("user can delete their own like", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "likes", likeId), likeData);
    });
    await assertSucceeds(deleteDoc(doc(user("user-1"), "likes", likeId)));
  });

  it("user cannot delete another user's like", async () => {
    const otherId = "cuento_mi-historia_user-2";
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "likes", otherId), { ...likeData, uid: "user-2" });
    });
    await assertFails(deleteDoc(doc(user("user-1"), "likes", otherId)));
  });

  it("nobody can update a like", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "likes", likeId), likeData);
    });
    await assertFails(updateDoc(doc(user("user-1"), "likes", likeId), { postSlug: "other" }));
    await assertFails(updateDoc(doc(admin(), "likes", likeId), { postSlug: "other" }));
  });
});

// ---------------------------------------------------------------------------
// /admins — client access fully denied
// ---------------------------------------------------------------------------
describe("admins", () => {
  it("unauthenticated client cannot read admin docs", async () => {
    await assertFails(getDoc(doc(anon(), "admins", "admin@girasun.com")));
  });

  it("regular user cannot read admin docs", async () => {
    await assertFails(getDoc(doc(user(), "admins", "admin@girasun.com")));
  });

  it("admin cannot write admin docs via client SDK", async () => {
    await assertFails(setDoc(doc(admin(), "admins", "new@girasun.com"), { role: "admin" }));
  });
});

// ---------------------------------------------------------------------------
// /subscribers — client access fully denied
// ---------------------------------------------------------------------------
describe("subscribers", () => {
  it("unauthenticated client cannot read subscribers", async () => {
    await assertFails(getDoc(doc(anon(), "subscribers", "test@example.com")));
  });

  it("regular user cannot read or write subscribers", async () => {
    await assertFails(getDoc(doc(user(), "subscribers", "test@example.com")));
    await assertFails(
      setDoc(doc(user(), "subscribers", "test@example.com"), { email: "test@example.com" }),
    );
  });
});

// ---------------------------------------------------------------------------
// /newsletterSends — client access fully denied
// ---------------------------------------------------------------------------
describe("newsletterSends", () => {
  it("nobody can read or write newsletter sends via client SDK", async () => {
    await assertFails(getDoc(doc(anon(), "newsletterSends", "send-1")));
    await assertFails(getDoc(doc(user(), "newsletterSends", "send-1")));
    await assertFails(setDoc(doc(admin(), "newsletterSends", "send-1"), { subject: "test" }));
  });
});

// ---------------------------------------------------------------------------
// /rateLimits — fully denied
// ---------------------------------------------------------------------------
describe("rateLimits", () => {
  it("nobody can read or write rate limit docs", async () => {
    await assertFails(getDoc(doc(anon(), "rateLimits", "key")));
    await assertFails(getDoc(doc(user(), "rateLimits", "key")));
    await assertFails(setDoc(doc(user(), "rateLimits", "key"), { count: 1 }));
    await assertFails(setDoc(doc(admin(), "rateLimits", "key"), { count: 1 }));
  });
});
