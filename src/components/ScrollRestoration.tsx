// src/components/ScrollRestoration.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollRestoration = () => {
  const { pathname } = useLocation();

  // Reset scroll position whenever the route changes
  useEffect(() => {
    // Use requestAnimationFrame to ensure this happens after the DOM update
    window.requestAnimationFrame(() => {
      // Instantly scroll to top with no animation
      window.scrollTo(0, 0);
    });
  }, [pathname]);

  return null; // This component doesn't render anything
};

export default ScrollRestoration;