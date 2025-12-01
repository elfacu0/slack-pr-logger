import { collection, doc, setDoc } from "firebase/firestore";

import { PRInterface } from "../github/interfaces/pr.interface";
import { getFirestoreInstance } from "./firestore";

export async function savePullRequest(pr: PRInterface) {
  const db = getFirestoreInstance();
  const pullsCollection = collection(db, "prs");
  await setDoc(doc(pullsCollection), { ...pr });
}
