"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A detail view inside a page, kept in the address (`?param=id`) so refresh works — and opened with a
 * history entry, so the phone's / browser's Back button returns to the list instead of leaving the page.
 */
export function useUrlSubView(param: string, listUrl: () => string, valid: (id: string) => boolean = () => true) {
  const [id, setId] = useState<string | null>(null);
  const pushed = useRef(false);
  const validRef = useRef(valid);
  useEffect(() => {
    validRef.current = valid;
  });

  useEffect(() => {
    const read = () => {
      const v = new URLSearchParams(window.location.search).get(param);
      return v && validRef.current(v) ? v : null;
    };
    setId(read());
    const onPop = () => {
      const v = read();
      if (!v) pushed.current = false;
      setId(v);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [param]);

  const open = useCallback(
    (next: string | null) => {
      if (next) {
        const url = `${window.location.pathname}?${param}=${encodeURIComponent(next)}`;
        if (pushed.current) window.history.replaceState(window.history.state, "", url);
        else window.history.pushState(window.history.state, "", url);
        pushed.current = true;
        setId(next);
      } else if (pushed.current) {
        // Back to the list through history, so the entry we added is consumed.
        pushed.current = false;
        window.history.back();
      } else {
        setId(null);
        window.history.replaceState(window.history.state, "", listUrl());
      }
      window.scrollTo({ top: 0 });
    },
    [param, listUrl],
  );

  return [id, open] as const;
}
