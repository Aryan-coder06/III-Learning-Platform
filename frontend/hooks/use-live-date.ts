"use client";

import { useEffect, useState } from "react";

export function useLiveDate() {
  const [value, setValue] = useState(() =>
    new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(new Date()),
  );

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    const interval = window.setInterval(() => {
      setValue(formatter.format(new Date()));
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  return value;
}
