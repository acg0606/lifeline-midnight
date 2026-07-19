import { describe, expect, it } from "vitest";
import { en } from "./messages/en";
import { pt } from "./messages/pt";
import { translate } from "./translate";
import { createInitialState } from "@/lib/demo-data";
import { localizeCircleState } from "./localize-demo";

describe("translate", () => {
  it("returns english and portuguese nav labels", () => {
    expect(translate(en, "nav.overview")).toBe("Overview");
    expect(translate(pt, "nav.overview")).toBe("Visão geral");
  });

  it("interpolates params", () => {
    expect(translate(en, "toast.privateVoteConfirmed", { weight: 50 })).toBe(
      "Private vote confirmed with weight 50",
    );
    expect(translate(pt, "toast.privateVoteConfirmed", { weight: 50 })).toBe(
      "Voto privado confirmado com peso 50",
    );
  });
});

describe("demo localization", () => {
  it("localizes known demo needs when switching catalog", () => {
    const state = createInitialState("en");
    const localized = localizeCircleState(state, pt);
    expect(localized.circleName).toBe("Círculo Recomeço");
    expect(localized.needs[0].title).toBe("Energia elétrica");
    expect(localized.needs[0].category).toBe("Essencial");
  });
});
