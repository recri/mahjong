import { html, svg } from 'lit-html/lib/lit-extended.js';

export class Icons {
    static get newGame() { 
	return Icons.wrap(svg`<path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>`);
    }
    static get restartGame() {
	return Icons.wrap(svg`<path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>`);
    }
    static get undoMove() {
	return Icons.wrap(svg`<path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>`);
    }
    static get redoMove() {
	return Icons.wrap(svg`<path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>`);
    }
    static wrap(icon) {
	return html`<svg class="icon" viewBox="0 0 24 24"><g>${icon}</g></svg>`;
    }
};
