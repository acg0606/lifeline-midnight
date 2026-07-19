import type { Messages } from "./messages/en";
import type { MessageParams } from "./types";

function getByPath(messages: Messages, key: string): unknown {
  return key.split(".").reduce<unknown>((current, part) => {
    if (current === null || current === undefined || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[part];
  }, messages);
}

function interpolate(template: string, params?: MessageParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = params[name];
    return value === undefined ? `{${name}}` : String(value);
  });
}

/** Translate a string message by dot-path key (e.g. `nav.overview`). */
export function translate(messages: Messages, key: string, params?: MessageParams): string {
  const value = getByPath(messages, key);
  if (typeof value !== "string") {
    console.warn(`[i18n] Missing or non-string message: ${key}`);
    return key;
  }
  return interpolate(value, params);
}

export type TranslateFn = (key: string, params?: MessageParams) => string;
