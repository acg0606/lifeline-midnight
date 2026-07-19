import { en } from "@/lib/i18n/messages/en";
import { pt } from "@/lib/i18n/messages/pt";
import type { Locale } from "@/lib/i18n/types";
import type { Messages } from "@/lib/i18n/messages/en";
import { CircleState } from "./types";

const catalogs: Record<Locale, Messages> = { en, pt };

export function createInitialState(locale: Locale = "en"): CircleState {
  const messages = catalogs[locale];
  const cats = messages.categories;
  const needs = messages.demo.needs;

  return {
    circleName: messages.demo.circleName,
    cycle: messages.demo.cycle,
    creditBalance: 100,
    supporters: 4,
    totalContributed: 390,
    userRole: "beneficiary",
    needs: [
      {
        id: "energy",
        title: needs.energy.title,
        category: cats[needs.energy.category as keyof typeof cats],
        amount: 240,
        dueDate: needs.energy.dueDate,
        impact: needs.energy.impact,
        votes: 100,
        status: "voting",
      },
      {
        id: "card",
        title: needs.card.title,
        category: cats[needs.card.category as keyof typeof cats],
        amount: 780,
        dueDate: needs.card.dueDate,
        impact: needs.card.impact,
        votes: 190,
        status: "voting",
      },
      {
        id: "internet",
        title: needs.internet.title,
        category: cats[needs.internet.category as keyof typeof cats],
        amount: 130,
        dueDate: needs.internet.dueDate,
        impact: needs.internet.impact,
        votes: 50,
        status: "voting",
      },
      {
        id: "loan",
        title: needs.loan.title,
        category: cats[needs.loan.category as keyof typeof cats],
        amount: 1200,
        dueDate: needs.loan.dueDate,
        impact: needs.loan.impact,
        votes: 50,
        status: "voting",
      },
    ],
  };
}

/** English demo snapshot used as storage fallback. */
export const initialState: CircleState = createInitialState("en");
