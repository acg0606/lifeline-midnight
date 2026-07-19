import type { CircleState, Need } from "@/lib/types";
import { en, type Messages } from "./messages/en";
import { pt } from "./messages/pt";

const DEMO_NEED_IDS = ["energy", "card", "internet", "loan"] as const;
type DemoNeedId = (typeof DEMO_NEED_IDS)[number];

const DEMO_CIRCLE_NAMES = new Set([en.demo.circleName, pt.demo.circleName]);
const DEMO_CYCLES = new Set([en.demo.cycle, pt.demo.cycle]);

function isDemoNeedId(id: string): id is DemoNeedId {
  return (DEMO_NEED_IDS as readonly string[]).includes(id);
}

type CategoryKey = keyof Messages["categories"];

function resolveCategory(messages: Messages, key: string): string {
  if (key in messages.categories) return messages.categories[key as CategoryKey];
  return key;
}

export function localizeDemoNeed(need: Need, messages: Messages): Need {
  if (!isDemoNeedId(need.id)) return need;
  const demo = messages.demo.needs[need.id];
  return {
    ...need,
    title: demo.title,
    category: resolveCategory(messages, demo.category),
    dueDate: demo.dueDate,
    impact: demo.impact,
  };
}

export function localizeCircleState(state: CircleState, messages: Messages): CircleState {
  const isDemoMeta = DEMO_CIRCLE_NAMES.has(state.circleName) || DEMO_CYCLES.has(state.cycle);
  return {
    ...state,
    circleName: isDemoMeta ? messages.demo.circleName : state.circleName,
    cycle: isDemoMeta ? messages.demo.cycle : state.cycle,
    needs: state.needs.map((need) => localizeDemoNeed(need, messages)),
  };
}
