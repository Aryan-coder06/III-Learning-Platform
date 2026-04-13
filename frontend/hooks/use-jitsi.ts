"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const JAAS_DOMAIN = process.env.NEXT_PUBLIC_JAAS_DOMAIN || "8x8.vc";
const JAAS_APP_ID = process.env.NEXT_PUBLIC_JAAS_APP_ID || "";
const JAAS_JWT = process.env.NEXT_PUBLIC_JAAS_JWT || "";

type JitsiConfig = {
  roomName: string;
  displayName: string;
  parentNode: HTMLElement;
  onReadyToClose?: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JitsiAPI = any;

function getJaasScriptUrl() {
  if (!JAAS_APP_ID) {
    return "";
  }
  return `https://${JAAS_DOMAIN}/${JAAS_APP_ID}/external_api.js`;
}

function sanitizeRoomName(roomName: string) {
  return `${roomName || "studysync-room"}`
    .trim()
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function loadJitsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const scriptUrl = getJaasScriptUrl();
    if (!scriptUrl) {
      reject(
        new Error(
          "NEXT_PUBLIC_JAAS_APP_ID is not configured. Add your 8x8 JaaS App ID to the frontend environment.",
        ),
      );
      return;
    }

    if (document.getElementById("jitsi-external-api")) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = "jitsi-external-api";
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load 8x8 JaaS API script"));
    document.head.appendChild(script);
  });
}

export function useJitsi() {
  const apiRef = useRef<JitsiAPI>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inCall, setInCall] = useState(false);

  const endMeeting = useCallback(() => {
    if (apiRef.current) {
      apiRef.current.dispose();
      apiRef.current = null;
    }
    setInCall(false);
  }, []);

  const startMeeting = useCallback(async (config: JitsiConfig) => {
    setLoading(true);
    setError(null);

    try {
      await loadJitsiScript();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const JitsiMeetExternalAPI = (window as any).JitsiMeetExternalAPI;
      if (!JitsiMeetExternalAPI) {
        throw new Error("JitsiMeetExternalAPI not found on window");
      }

      // Destroy previous instance if any
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }

      const api = new JitsiMeetExternalAPI(JAAS_DOMAIN, {
        roomName: `${JAAS_APP_ID}/${sanitizeRoomName(config.roomName)}`,
        parentNode: config.parentNode,
        jwt: JAAS_JWT || undefined,
        userInfo: {
          displayName: config.displayName,
        },
        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          toolbarButtons: [
            "microphone",
            "camera",
            "desktop",
            "chat",
            "raisehand",
            "tileview",
            "hangup",
            "fullscreen",
          ],
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DEFAULT_BACKGROUND: "#111111",
          TOOLBAR_ALWAYS_VISIBLE: true,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          FILM_STRIP_MAX_HEIGHT: 120,
        },
      });

      api.addListener("readyToClose", () => {
        config.onReadyToClose?.();
        endMeeting();
      });

      apiRef.current = api;
      setInCall(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start meeting");
    } finally {
      setLoading(false);
    }
  }, [endMeeting]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, []);

  return { startMeeting, endMeeting, loading, error, inCall };
}
