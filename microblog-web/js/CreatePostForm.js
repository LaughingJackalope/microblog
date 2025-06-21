class CreatePostForm extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._authorId = "user_frontend_test"; // Hardcoded for now, as per original
        this._apiBaseUrl = "http://localhost:8080/v1"; // Configurable point for API
    }

    connectedCallback() {
        this.render();
        this.addEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                form {
                    padding: 1.5rem;
                    background-color: var(--card-bg, #FAFAFA); /* Using card variables for consistency */
                    border: 1px solid var(--card-border, #E0E0E0);
                    box-shadow: var(--card-shadow, 3px 3px 0px rgba(0,0,0,0.05));
                    border-radius: 0px;
                }
                .form-group {
                    margin-bottom: 1.25rem;
                }
                label {
                    display: block;
                    font-family: var(--font-family-heading, 'Arial Black', sans-serif);
                    font-size: 0.9rem;
                    color: var(--text-color, #1E1E1E);
                    margin-bottom: 0.4rem;
                    text-transform: uppercase;
                }
                input[type="text"], textarea {
                    font-family: var(--font-family-main, 'Courier New', monospace);
                    background-color: var(--input-bg, #FFFFFF);
                    border: 1px solid var(--input-border, #B0B0B0);
                    padding: 0.6rem 0.8rem;
                    font-size: 1rem;
                    color: var(--text-color, #1E1E1E);
                    border-radius: 0;
                    box-sizing: border-box;
                    width: 100%;
                    transition: border-color 0.2s ease-out, box-shadow 0.2s ease-out;
                }
                input[type="text"]:focus, textarea:focus {
                    outline: none;
                    border-color: var(--input-focus-border, #005A9C);
                    box-shadow: 0 0 0 2px rgba(0, 90, 156, 0.2); /* Primary color focus ring */
                }
                textarea {
                    min-height: 100px;
                    resize: vertical;
                }
                .char-counter {
                    font-size: 0.8rem;
                    text-align: right;
                    color: #777;
                    margin-top: -0.75rem; /* Pull it closer to textarea */
                    margin-bottom: 0.75rem;
                }
                button[type="submit"] {
                    font-family: var(--font-family-heading, 'Arial Black', sans-serif);
                    background-color: var(--button-bg, #005A9C);
                    color: var(--button-text, #FFFFFF);
                    border: none;
                    padding: 0.8rem 1.8rem;
                    font-size: 1.1rem;
                    cursor: pointer;
                    box-shadow: var(--button-shadow, 2px 2px 0px rgba(0,0,0,0.2));
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    transition: background-color 0.2s ease-out, transform 0.1s ease;
                    width: 100%; /* Full width button */
                }
                button[type="submit"]:hover, button[type="submit"]:focus {
                    background-color: var(--button-hover-bg, #00487A);
                    transform: translateY(-1px);
                    box-shadow: 3px 3px 0px rgba(0,0,0,0.25);
                }
                button[type="submit"]:active {
                    transform: translateY(1px);
                }
                button[type="submit"]:disabled {
                    background-color: #A0A0A0;
                    cursor: not-allowed;
                    box-shadow: none;
                    transform: none;
                }
                .feedback {
                    margin-top: 1rem;
                    padding: 0.75rem;
                    border-radius: 0;
                    font-size: 0.9rem;
                    text-align: center;
                }
                .feedback.success {
                    background-color: #DFF2BF; /* Light green */
                    color: #4F8A10; /* Dark green */
                    border: 1px solid #4F8A10;
                }
                .feedback.error {
                    background-color: #FFD2D2; /* Light red */
                    color: #D8000C; /* Dark red */
                    border: 1px solid #D8000C;
                }
                .feedback.loading {
                    background-color: #E0E0E0;
                    color: #333;
                    border: 1px solid #AAA;
                }

                /* CSS Variable Fallbacks (if not inheriting through Shadow DOM) */
                :host {
                    --font-family-main: ${getComputedStyle(document.documentElement).getPropertyValue('--font-family-main').trim() || "'Courier New', Courier, monospace"};
                    --font-family-heading: ${getComputedStyle(document.documentElement).getPropertyValue('--font-family-heading').trim() || "'Arial Black', Gadget, sans-serif"};
                    --text-color: ${getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim() || '#1E1E1E'};
                    --primary-color: ${getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#005A9C'};
                    --input-bg: ${getComputedStyle(document.documentElement).getPropertyValue('--input-bg').trim() || '#FFFFFF'};
                    --input-border: ${getComputedStyle(document.documentElement).getPropertyValue('--input-border').trim() || '#B0B0B0'};
                    --input-focus-border: ${getComputedStyle(document.documentElement).getPropertyValue('--input-focus-border').trim() || '#005A9C'};
                    --button-bg: ${getComputedStyle(document.documentElement).getPropertyValue('--button-bg').trim() || '#005A9C'};
                    --button-text: ${getComputedStyle(document.documentElement).getPropertyValue('--button-text').trim() || '#FFFFFF'};
                    --button-hover-bg: ${getComputedStyle(document.documentElement).getPropertyValue('--button-hover-bg').trim() || '#00487A'};
                    --button-shadow: ${getComputedStyle(document.documentElement).getPropertyValue('--button-shadow').trim() || '2px 2px 0px rgba(0,0,0,0.2)'};
                    --card-bg: ${getComputedStyle(document.documentElement).getPropertyValue('--card-bg').trim() || '#FAFAFA'};
                    --card-border: ${getComputedStyle(document.documentElement).getPropertyValue('--card-border').trim() || '#E0E0E0'};
                    --card-shadow: ${getComputedStyle(document.documentElement).getPropertyValue('--card-shadow').trim() || '3px 3px 0px rgba(0,0,0,0.05)'};
                }
            </style>
            <form>
                <div class="form-group">
                    <label for="authorId">Author ID:</label>
                    <input type="text" id="authorId" name="authorId" value="${this._authorId}" readonly>
                    <small style="font-size:0.8em; color: #555;">(Currently fixed. Will be automatic after login.)</small>
                </div>
                <div class="form-group">
                    <label for="content">Content (max 280 chars):</label>
                    <textarea id="content" name="content" rows="4" maxlength="280" required></textarea>
                    <div class="char-counter"><span id="char-count">0</span>/280</div>
                </div>
                <button type="submit" id="submit-button">Post It!</button>
                <div class="feedback" id="feedback-message" role="alert" aria-live="assertive" style="display:none;"></div>
            </form>
        `;
    }

    addEventListeners() {
        const form = this.shadowRoot.querySelector('form');
        const contentTextarea = this.shadowRoot.querySelector('#content');
        const charCountSpan = this.shadowRoot.querySelector('#char-count');
        const submitButton = this.shadowRoot.querySelector('#submit-button');
        const feedbackDiv = this.shadowRoot.querySelector('#feedback-message');

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            submitButton.disabled = true;
            this.showFeedback('Posting...', 'loading');

            const content = contentTextarea.value.trim();
            const authorId = this._authorId;

            if (!content) {
                this.showFeedback('Content cannot be empty.', 'error');
                contentTextarea.focus();
                submitButton.disabled = false;
                return;
            }
            if (content.length > 280) {
                this.showFeedback('Content exceeds 280 characters.', 'error');
                contentTextarea.focus();
                submitButton.disabled = false;
                return;
            }

            try {
                const response = await fetch(`${this._apiBaseUrl}/posts`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ authorId, content }),
                });

                if (!response.ok) {
                    let errorMsg = `Error: ${response.status} ${response.statusText}`;
                    try {
                        const errorData = await response.json();
                        errorMsg = errorData.message || errorData.error || errorMsg;
                    } catch (e) { /* Ignore if error response is not JSON */ }
                    throw new Error(errorMsg);
                }

                const newPost = await response.json();
                this.showFeedback('Post created successfully!', 'success');
                form.reset(); // Reset form fields
                charCountSpan.textContent = '0'; // Reset counter

                // Dispatch custom event with the new post data
                this.dispatchEvent(new CustomEvent('postcreated', {
                    bubbles: true, // Allow event to bubble up through the DOM
                    composed: true, // Allow event to cross shadow DOM boundaries
                    detail: { post: newPost },
                }));

                // Hide success message after a delay
                setTimeout(() => this.hideFeedback(), 3000);

            } catch (error) {
                this.showFeedback(error.message || 'Failed to create post. Please try again.', 'error');
                 setTimeout(() => this.hideFeedback(), 5000); // Keep error message a bit longer
            } finally {
                submitButton.disabled = false;
            }
        });

        contentTextarea.addEventListener('input', () => {
            const currentLength = contentTextarea.value.length;
            charCountSpan.textContent = currentLength.toString();
            if (currentLength > 280) {
                charCountSpan.style.color = 'var(--secondary-accent-color, red)';
                submitButton.disabled = true;
            } else {
                charCountSpan.style.color = '#777';
                submitButton.disabled = false;
            }
            // Basic check to prevent submission if over limit, even if form validation is bypassed by disabling JS
            if (currentLength === 0 && !submitButton.disabled) { // Disable if empty
                 // Enable only if not empty and not over limit
            } else if (currentLength > 280) {
                submitButton.disabled = true;
            } else {
                 submitButton.disabled = false;
            }
        });
    }

    showFeedback(message, type = 'info') {
        const feedbackDiv = this.shadowRoot.querySelector('#feedback-message');
        if (feedbackDiv) {
            feedbackDiv.textContent = message;
            feedbackDiv.className = `feedback ${type}`; // Reset classes and add new type
            feedbackDiv.style.display = 'block';
        }
    }

    hideFeedback() {
        const feedbackDiv = this.shadowRoot.querySelector('#feedback-message');
        if (feedbackDiv) {
            feedbackDiv.style.display = 'none';
            feedbackDiv.textContent = '';
            feedbackDiv.className = 'feedback';
        }
    }
}

customElements.define('create-post-form', CreatePostForm);
