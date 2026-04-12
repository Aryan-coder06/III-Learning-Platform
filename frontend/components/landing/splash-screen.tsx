"use client";

import React, { useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      <div className="h-64 w-64 md:h-96 md:w-96">
        <DotLottieReact
          src="https://lottie.host/93eff41d-5447-482f-9762-c8f720739826/VKDssXdIl7.lottie"
          loop
          autoplay
        />
      </div>
    </div>
  );
}
