import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to enable smooth scrolling for anchor links, especially when
 * navigating from other pages or clicking links on the same page.
 */
export function useSmoothScroll() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Check if there's a hash in the URL (e.g., #how-it-works)
    if (hash) {
      // Small timeout to ensure the DOM is ready, especially after page navigation
      const timeoutId = setTimeout(() => {
        const element = document.getElementById(hash.slice(1));
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [pathname, hash]);

  useEffect(() => {
    // Intercept clicks on anchor links that start with #
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor) {
        const href = anchor.getAttribute('href');
        
        // If it's a same-page anchor link
        if (href && href.startsWith('#')) {
          const id = href.slice(1);
          const element = document.getElementById(id);
          
          if (element) {
            e.preventDefault();
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
            // Update the URL without jumping
            window.history.pushState(null, '', href);
          }
        } 
        // If it's a cross-page anchor link (e.g., /#how-it-works) and we are already on home
        else if (href && href.startsWith('/#') && pathname === '/') {
          const id = href.slice(2);
          const element = document.getElementById(id);
          
          if (element) {
            e.preventDefault();
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
            window.history.pushState(null, '', href.slice(1));
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, [pathname]);
}
