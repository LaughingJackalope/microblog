class PostsList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._userId = "user_frontend_test"; // Hardcoded for now
        this._apiBaseUrl = "http://localhost:8080/v1";
        this._posts = []; // Internal state for posts
    }

    connectedCallback() {
        this.renderInitialStructure();
        this.fetchPosts();

        // Listen for new posts being created
        // Assuming the event bubbles up to the document or a common ancestor
        document.addEventListener('postcreated', (event) => {
            this.addNewPost(event.detail.post);
        });
    }

    renderInitialStructure() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                .loading, .error, .empty {
                    padding: 1.5rem;
                    text-align: center;
                    font-family: var(--font-family-main, 'Courier New', monospace);
                    font-size: 1.1rem;
                    border-radius: 0;
                }
                .loading {
                    color: var(--text-color, #1E1E1E);
                    background-color: var(--container-bg, #FFFFFF);
                }
                .error {
                    color: var(--secondary-accent-color, #D9534F);
                    background-color: #fdd; /* Light red */
                    border: 1px solid var(--secondary-accent-color, #D9534F);
                }
                .empty {
                    color: #555;
                    background-color: var(--container-bg, #FFFFFF);
                }
                #posts-container {
                    /* Styles for the container itself, if any, beyond host styles */
                }

                /* CSS Variable Fallbacks */
                :host {
                    --font-family-main: ${getComputedStyle(document.documentElement).getPropertyValue('--font-family-main').trim() || "'Courier New', Courier, monospace"};
                    --text-color: ${getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim() || '#1E1E1E'};
                    --secondary-accent-color: ${getComputedStyle(document.documentElement).getPropertyValue('--secondary-accent-color').trim() || '#D9534F'};
                    --container-bg: ${getComputedStyle(document.documentElement).getPropertyValue('--container-bg').trim() || '#FFFFFF'};
                }
            </style>
            <div id="status-message"></div>
            <div id="posts-container">
                <!-- Post items will be appended here -->
            </div>
        `;
    }

    showStatus(message, type = 'loading') {
        const statusDiv = this.shadowRoot.querySelector('#status-message');
        const postsContainer = this.shadowRoot.querySelector('#posts-container');
        if (statusDiv) {
            statusDiv.textContent = message;
            statusDiv.className = type; // 'loading', 'error', or 'empty'
            if (type === 'loading' || type === 'error' || type === 'empty') {
                postsContainer.innerHTML = ''; // Clear posts if showing a full-block status
            }
        }
    }

    clearStatus() {
        const statusDiv = this.shadowRoot.querySelector('#status-message');
        if (statusDiv) {
            statusDiv.textContent = '';
            statusDiv.className = '';
        }
    }

    async fetchPosts() {
        this.showStatus('Loading posts...', 'loading');
        try {
            const response = await fetch(`${this._apiBaseUrl}/posts/user/${this._userId}`);
            if (!response.ok) {
                let errorMsg = `Error: ${response.status} ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorData.error || errorMsg;
                } catch (e) { /* Ignore */ }
                throw new Error(errorMsg);
            }
            const posts = await response.json();
            this._posts = posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort newest first
            this.renderPosts();
        } catch (error) {
            this.showStatus(error.message || 'Failed to load posts.', 'error');
        }
    }

    renderPosts() {
        const postsContainer = this.shadowRoot.querySelector('#posts-container');
        postsContainer.innerHTML = ''; // Clear existing posts before rendering

        if (!this._posts || this._posts.length === 0) {
            this.showStatus('No posts found for this user, or user does not exist.', 'empty');
            return;
        }

        this.clearStatus(); // Clear loading/error messages

        this._posts.forEach(post => {
            const postItem = document.createElement('post-item');
            postItem.setAttribute('post-id', post.id);
            // API returns author object with username and displayName
            postItem.setAttribute('author-display-name', post.author && post.author.displayName ? post.author.displayName : (post.author && post.author.username ? post.author.username : 'Unknown'));
            postItem.setAttribute('author-username', post.author && post.author.username ? post.author.username : 'unknown');
            postItem.setAttribute('content', post.content);
            postItem.setAttribute('created-at', post.createdAt);
            postsContainer.appendChild(postItem);
        });
    }

    addNewPost(post) {
        // Add to internal state and re-render (or prepend directly for optimization)
        if (post && post.author && post.author.username === this._userId) { // Check if post belongs to current user view
            this._posts.unshift(post); // Add to the beginning of the array

            const postsContainer = this.shadowRoot.querySelector('#posts-container');
            const statusDiv = this.shadowRoot.querySelector('#status-message');

            // If it was previously empty, clear the "empty" message
            if (statusDiv && (statusDiv.classList.contains('empty') || statusDiv.classList.contains('error'))) {
                 this.clearStatus();
            }
             if (this._posts.length === 1 && statusDiv && statusDiv.classList.contains('empty')) {
                this.clearStatus();
            }


            const postItem = document.createElement('post-item');
            postItem.setAttribute('post-id', post.id);
            postItem.setAttribute('author-display-name', post.author.displayName || post.author.username);
            postItem.setAttribute('author-username', post.author.username);
            postItem.setAttribute('content', post.content);
            postItem.setAttribute('created-at', post.createdAt);

            if (postsContainer.firstChild) {
                postsContainer.insertBefore(postItem, postsContainer.firstChild);
            } else {
                postsContainer.appendChild(postItem); // If container was empty
            }
        } else if (post && post.author && post.author.username !== this._userId) {
            // This post is not for the currently displayed user_id, so we don't add it to this list.
            // This can happen if the create form's authorId is different from the list's userId.
            // For this app, they are the same ("user_frontend_test"), but good to be aware.
        }
    }
}

customElements.define('posts-list', PostsList);
