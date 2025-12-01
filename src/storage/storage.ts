import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

import { PRInterface } from "../github/interfaces/pr.interface";
import { getFirestoreInstance } from "./firestore";

export async function savePullRequest(pr: PRInterface) {
  const db = getFirestoreInstance();
  const pullsCollection = collection(db, "prs");
  await setDoc(doc(pullsCollection), { ...pr });
}

export async function getPullRequestsByDate(
  date: string,
): Promise<PRInterface[]> {
  const db = getFirestoreInstance();
  const pullsCollection = collection(db, "prs");

  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 1);

  const startIso = start.toISOString();
  const endIso = end.toISOString();

  const q = query(
    pullsCollection,
    where("date", ">=", startIso),
    where("date", "<", endIso),
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map(
    (docSnap) => docSnap.data() as unknown as PRInterface,
  );
}
