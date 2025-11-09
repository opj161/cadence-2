// Dark mode initialization script
// This ensures dark mode is applied immediately before the page renders

(function() {
  // Set dark mode as default if no preference exists
  if (!localStorage.theme) {
    localStorage.theme = 'dark';
  }
  
  // Apply dark class immediately
  if (localStorage.theme === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
})();
