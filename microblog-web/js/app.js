// Main Application Logic

// Theme toggle logic - should run early to set theme
import './theme-toggle.js';

// Import Web Components to ensure they are registered
// PostItem component - used by PostsList
import './PostItem.js';

// CreatePostForm component - for creating new posts
import './CreatePostForm.js';

// PostsList component - for displaying the list of posts
import './PostsList.js';

// console.log('MicroBlog NeoRetro App Initialized');

// No specific app-wide logic needed here for now,
// as components are self-contained or interact via DOM events.
// Components will be used directly in index.html.

// Potential future additions here:
// - Global event listeners if needed for more complex coordination
// - Centralized state management if the app grows significantly
// - Routing logic if multiple views were to be added
// - Feature detection or polyfills
