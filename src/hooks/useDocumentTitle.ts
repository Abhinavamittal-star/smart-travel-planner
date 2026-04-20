import { useRef, useEffect } from "react";

export function useDocumentTitle(title: string, retainOnUnmount: boolean = false) {
  const defaultTitle = useRef(document.title);

  useEffect(() => {
    document.title = title ? `${title} | Smart Travel Planner` : "Smart Travel Planner";
  }, [title]);

  useEffect(() => {
    return () => {
      if (!retainOnUnmount) {
        document.title = defaultTitle.current;
      }
    };
  }, [retainOnUnmount]);
}
