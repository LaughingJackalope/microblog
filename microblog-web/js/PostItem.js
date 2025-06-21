class PostItem extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['author-display-name', 'author-username', 'content', 'created-at', 'post-id'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        const postId = this.getAttribute('post-id') || 'N/A';
        const authorDisplayName = this.getAttribute('author-display-name') || 'Anonymous';
        const authorUsername = this.getAttribute('author-username') || 'anonymous';
        const content = this.getAttribute('content') || 'No content.';
        const createdAtStr = this.getAttribute('created-at');

        let displayDate = 'Invalid date';
        if (createdAtStr) {
            const date = new Date(createdAtStr);
            if (!isNaN(date)) {
                displayDate = date.toLocaleString();
            }
        }

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin-bottom: 1.5rem;
                    background-color: var(--card-bg, #FAFAFA);
                    border: 1px solid var(--card-border, #E0E0E0);
                    box-shadow: var(--card-shadow, 3px 3px 0px rgba(0,0,0,0.05));
                    padding: 1rem 1.5rem;
                    border-radius: 0px; /* Sharp corners */
                }
                h3 {
                    font-family: var(--font-family-heading, 'Arial Black', sans-serif);
                    font-size: 1.25rem;
                    color: var(--primary-color, #005A9C);
                    margin: 0 0 0.5rem 0;
                }
                .author-info {
                    font-size: 0.9rem;
                    color: var(--text-color, #1E1E1E);
                    margin-bottom: 0.75rem;
                }
                .author-info .username {
                    color: var(--link-color, #005A9C);
                    font-style: italic;
                }
                .content {
                    font-size: 1rem;
                    line-height: 1.5;
                    white-space: pre-wrap; /* Preserve line breaks from textarea */
                    word-wrap: break-word; /* Break long words */
                    margin-bottom: 1rem;
                }
                .date {
                    font-size: 0.8rem;
                    color: #777;
                    text-align: right;
                }
                /* Define fallback variables if global CSS isn't loaded into shadow DOM by default */
                :host {
                    --font-family-heading: ${getComputedStyle(document.documentElement).getPropertyValue('--font-family-heading').trim() || "'Arial Black', Gadget, sans-serif"};
                    --primary-color: ${getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#005A9C'};
                    --text-color: ${getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim() || '#1E1E1E'};
                    --link-color: ${getComputedStyle(document.documentElement).getPropertyValue('--link-color').trim() || '#005A9C'};
                    --card-bg: ${getComputedStyle(document.documentElement).getPropertyValue('--card-bg').trim() || '#FAFAFA'};
                    --card-border: ${getComputedStyle(document.documentElement).getPropertyValue('--card-border').trim() || '#E0E0E0'};
                    --card-shadow: ${getComputedStyle(document.documentElement).getPropertyValue('--card-shadow').trim() || '3px 3px 0px rgba(0,0,0,0.05)'};
                }
            </style>
            <article data-id="${postId}">
                <h3>${authorDisplayName}</h3>
                <div class="author-info">
                    (<span class="username">@${authorUsername}</span>)
                </div>
                <p class="content">${content.replace(/\\n/g, '<br>')}</p>
                <p class="date">${displayDate}</p>
            </article>
        `;
    }
}

customElements.define('post-item', PostItem);
