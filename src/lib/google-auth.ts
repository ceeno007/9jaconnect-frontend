import { GOOGLE_CLIENT_ID } from "@/lib/api/config";

type GoogleAccountsId = {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential: string }) => void;
  }) => void;
  prompt: () => void;
};

function getGoogleAccountsId(): GoogleAccountsId | undefined {
  return (
    window as Window & {
      google?: { accounts: { id: GoogleAccountsId } };
    }
  ).google?.accounts?.id;
}

function loadGoogleScript() {
  return new Promise<void>((resolve, reject) => {
    if (document.getElementById("google-gsi")) {
      resolve();
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
}

/** Opens Google One Tap / account picker and returns the ID token. */
export async function promptGoogleIdToken(): Promise<string> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error(
      "Google sign-in is not configured yet. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID.",
    );
  }

  if (!getGoogleAccountsId()) {
    await loadGoogleScript();
  }

  const googleId = getGoogleAccountsId();
  if (!googleId) {
    throw new Error("Could not start Google sign-in.");
  }

  return new Promise<string>((resolve, reject) => {
    googleId.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        if (response?.credential) {
          resolve(response.credential);
          return;
        }
        reject(new Error("Google did not return a credential."));
      },
    });
    googleId.prompt();
  });
}

export function isGoogleAuthConfigured() {
  return Boolean(GOOGLE_CLIENT_ID);
}
