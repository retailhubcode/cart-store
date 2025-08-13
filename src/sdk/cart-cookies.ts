import { parse } from "../../node_modules/cookie/dist/index";
import { getDocument } from "../utils/get-document";

export const CART_COOKIE_IDENTIFIER = "cart";
export const VTEX_CART_COOKIE_IDENTIFIER = "checkout.vtex.com";

export function getCookiesOnClient(): Record<string, string | undefined> {
  if (typeof window === "undefined") return {};
  return parse(document.cookie);
}

export function getCookiesOnServer(
  cookieHeader?: string
): Record<string, string | undefined> {
  if (!cookieHeader) return {};
  return parse(cookieHeader);
}

export async function getCookiesUniversal(
  cookieHeader?: string
): Promise<Record<string, string | undefined>> {
  if (typeof window === "undefined") {
    // Server
    return getCookiesOnServer(cookieHeader);
  } else {
    // Browser
    return getCookiesOnClient();
  }
}

export const getCartCookieIdentifier = (platform?: string) => {
  let platformValue = platform;

  if (!platformValue && typeof window !== "undefined") {
    platformValue =
      getDocument().querySelector("html")?.getAttribute("site-platform") ?? "";
  }

  switch (platformValue) {
    case "vtex":
      return VTEX_CART_COOKIE_IDENTIFIER;
    default:
      return CART_COOKIE_IDENTIFIER;
  }
};

export const getCartCookieValueUniversal = async (platform?: string) => {
  const cartIdentifier = getCartCookieIdentifier(platform);
  const cookies = await getCookiesUniversal();
  const cartIdentifierValue = cookies[cartIdentifier] ?? "";

  switch (cartIdentifier) {
    case VTEX_CART_COOKIE_IDENTIFIER:
      const cartId = cartIdentifierValue?.replace("__ofid=", "");
      return cartId;
    default:
      return cartIdentifierValue;
  }
};
