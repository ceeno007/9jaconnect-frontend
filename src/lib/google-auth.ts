import { GOOGLE_CLIENT_ID } from "@/lib/api/config";

type GoogleCredentialResponse = {
  credential?: string;
};

type GsiButtonConfiguration = {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number;
  locale?: string;
};

type GoogleAccountsId = {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    use_fedcm_for_prompt?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: GsiButtonConfiguration,
  ) => void;
  prompt: (listener?: (notification: {
    isNotDisplayed: () => boolean;
    isSkippedMoment: () => boolean;
    getNotDisplayedReason?: () => string;
  }) => void) => void;
};

let scriptPromise: Promise<void> | null = null;
let initializedClientId: string | null = null;
let credentialHandler: ((idToken: string) => void) | null = null;

function getGoogleAccountsId(): GoogleAccountsId | undefined {
  return (
    window as Window & {
      google?: { accounts: { id: GoogleAccountsId } };
    }
  ).google?.accounts?.id;
}

function loadGoogleScript() {
  if (getGoogleAccountsId()) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById("google-gsi");
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google script")),
        { once: true },
      );
      if (getGoogleAccountsId()) resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gsi";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google script"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

function ensureInitialized() {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error(
      "Google sign-in is not configured yet. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID.",
    );
  }

  const googleId = getGoogleAccountsId();
  if (!googleId) {
    throw new Error("Could not start Google sign-in.");
  }

  if (initializedClientId === GOOGLE_CLIENT_ID) return googleId;

  googleId.initialize({
    client_id: GOOGLE_CLIENT_ID,
    auto_select: false,
    cancel_on_tap_outside: true,
    callback: (response) => {
      const token = response?.credential;
      if (!token) return;
      credentialHandler?.(token);
    },
  });
  initializedClientId = GOOGLE_CLIENT_ID;
  return googleId;
}

export function isGoogleAuthConfigured() {
  return Boolean(GOOGLE_CLIENT_ID);
}

export function setGoogleCredentialHandler(
  handler: ((idToken: string) => void) | null,
) {
  credentialHandler = handler;
}

export type GoogleButtonText =
  | "signin_with"
  | "signup_with"
  | "continue_with"
  | "signin";

/** Renders the official Google button into `element` (required by GIS). */
export async function mountGoogleSignInButton(
  element: HTMLElement,
  options?: {
    text?: GoogleButtonText;
    width?: number;
  },
) {
  if (!GOOGLE_CLIENT_ID) return;

  await loadGoogleScript();
  const googleId = ensureInitialized();

  const width = Math.max(
    240,
    Math.floor(options?.width || element.clientWidth || element.offsetWidth || 320),
  );

  element.innerHTML = "";
  googleId.renderButton(element, {
    type: "standard",
    theme: "outline",
    size: "large",
    shape: "pill",
    text: options?.text || "signin_with",
    width,
    logo_alignment: "left",
  });
}

/**
 * Fallback One Tap / account chooser. Prefer mountGoogleSignInButton for UI.
 */
export async function promptGoogleIdToken(): Promise<string> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error(
      "Google sign-in is not configured yet. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID.",
    );
  }

  await loadGoogleScript();
  const googleId = ensureInitialized();

  return new Promise<string>((resolve, reject) => {
    const previous = credentialHandler;
    let settled = false;

    const finish = (token: string) => {
      if (settled) return;
      settled = true;
      credentialHandler = previous;
      resolve(token);
    };

    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      credentialHandler = previous;
      reject(new Error(message));
    };

    credentialHandler = finish;

    googleId.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        fail(
          "Google sign-in was blocked or skipped. Use the Google button on the page instead.",
        );
      }
    });

    window.setTimeout(() => {
      fail("Google sign-in timed out. Try the Google button again.");
    }, 60_000);
  });
}
