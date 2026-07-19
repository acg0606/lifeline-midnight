import { describe, expect, it } from "vitest";
import { initialState } from "./demo-data";
import { createPrivateInvite, readPrivateInvite } from "./private-invite";

describe("private invites", () => {
  it("encrypts the circle in the fragment and recovers the data", async () => {
    const url = await createPrivateInvite(initialState, "contract_test_123", "https://lifeline.example/app");
    expect(url).toContain("#lifeline=");
    expect(url).not.toContain(initialState.needs[0].title);
    const invite = await readPrivateInvite(url);
    expect(invite?.state.userRole).toBe("supporter");
    expect(invite?.state.needs).toEqual(initialState.needs);
    expect(invite?.contractAddress).toBe("contract_test_123");
  });

  it("ignores pages without an invite", async () => {
    await expect(readPrivateInvite("#outro=valor")).resolves.toBeNull();
  });
});
