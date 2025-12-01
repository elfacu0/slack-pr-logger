import { vi } from "vitest";

vi.mock("firebase/firestore", () => ({
  collection: vi.fn((db, name) => name),
  doc: vi.fn((collection) => `${collection}/mockDoc`),
  setDoc: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../storage/firestore", () => ({
  getFirestoreInstance: vi.fn(() => ({})),
}));
