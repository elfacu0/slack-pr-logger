import { it, expect } from "vitest";
import "../mocks/firestore";
import { collection, doc, setDoc } from "firebase/firestore";
import { savePullRequest } from "../../storage/storage";

it("calls Firestore helpers with correct arguments and passes PR object", async () => {
  const testPr = {
    id: 1,
    repo: "test/repo",
    title: "Fix bug",
    url: "http://example.com",
    author: "john",
    action: "opened",
    date: "2020/10/10",
  };

  await expect(savePullRequest(testPr)).resolves.toBeUndefined();

  expect(collection).toHaveBeenCalledWith({}, "prs");
  expect(doc).toHaveBeenCalledWith("prs");
  expect(setDoc).toHaveBeenCalledWith("prs/mockDoc", { ...testPr });
});
