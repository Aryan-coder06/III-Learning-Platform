"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const JITSI_SCRIPT_URL = "https://meet.jit.si/external_api.js";
const JITSI_DOMAIN = "meet.jit.si";

type JitsiConfig = {
  roomName: string;
  displayName: string;
  parentNode: HTMLElement;
  onReadyToClose?: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JitsiAPI = any;

function loadJitsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById("jitsi-external-api")) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = "jitsi-external-api";
    script.src = JITSI_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Jitsi API script"));
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

      const api = new JitsiMeetExternalAPI(JITSI_DOMAIN, {
        roomName: `StudySync_${config.roomName}`,
        parentNode: config.parentNode,
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
