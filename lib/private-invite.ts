import type { CircleState } from "@/lib/types";

export type LifelineInvite = {
  readonly version: 1;
  readonly state: CircleState;
  readonly contractAddress: string;
  readonly createdAt: string;
};

const bytesToBase64Url = (bytes: Uint8Array): string => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
};

const base64UrlToBytes = (value: string): Uint8Array => {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
};

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => Uint8Array.from(bytes).buffer;

export async function createPrivateInvite(
  state: CircleState,
  contractAddress: string,
  currentUrl: string,
): Promise<string> {
  const invite: LifelineInvite = {
    version: 1,
    state: { ...state, userRole: "supporter", votedNeedId: undefined },
    contractAddress,
    createdAt: new Date().toISOString(),
  };
  const secret = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey("raw", toArrayBuffer(secret), "AES-GCM", false, ["encrypt"]);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    key,
    new TextEncoder().encode(JSON.stringify(invite)),
  );
  const url = new URL(currentUrl);
  url.hash = `lifeline=${bytesToBase64Url(secret)}.${bytesToBase64Url(iv)}.${bytesToBase64Url(new Uint8Array(encrypted))}`;
  return url.toString();
}

export async function readPrivateInvite(hashOrUrl: string): Promise<LifelineInvite | null> {
  const hash = hashOrUrl.startsWith("#") ? hashOrUrl : hashOrUrl.includes("#") ? new URL(hashOrUrl).hash : hashOrUrl;
  const value = new URLSearchParams(hash.replace(/^#/u, "")).get("lifeline");
  if (!value) return null;
  const [secretValue, ivValue, encryptedValue] = value.split(".");
  if (!secretValue || !ivValue || !encryptedValue) throw new Error("The private invite is incomplete.");
  try {
    const key = await crypto.subtle.importKey("raw", toArrayBuffer(base64UrlToBytes(secretValue)), "AES-GCM", false, ["decrypt"]);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: toArrayBuffer(base64UrlToBytes(ivValue)) },
      key,
      toArrayBuffer(base64UrlToBytes(encryptedValue)),
    );
    const invite = JSON.parse(new TextDecoder().decode(decrypted)) as LifelineInvite;
    if (invite.version !== 1 || !invite.state || !Array.isArray(invite.state.needs)) {
      throw new Error("Unrecognized invite format.");
    }
    return invite;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Unrecognized")) throw error;
    throw new Error("Could not open the invite. Make sure the full link was copied.");
  }
}
