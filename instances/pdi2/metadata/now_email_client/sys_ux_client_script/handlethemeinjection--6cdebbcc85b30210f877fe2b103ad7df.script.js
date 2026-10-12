/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 * @param {Window} params.window
 * @param {Document} params.document
 */
function handler({ api, event, helpers, imports }) {
    helpers.timing.setTimeout(function () {
        const parentWindow = this.window.opener?.parent || this.window.opener || this.window.parent;

        if (parentWindow && parentWindow.ux_globals && parentWindow.ux_globals.theme) {
            const parentThemeCSS = parentWindow.ux_globals.theme.theme;

            if (!parentThemeCSS) return;

            const updatedThemeHooks = {};
            Object.keys(parentThemeCSS).forEach((h) => {
                updatedThemeHooks[h] =
                    parentThemeCSS[h].indexOf('--') === 0
                        ? resolveThemeHooks(parentThemeCSS, h)
                        : parentThemeCSS[h];
            });

            const cssContent = typeof updatedThemeHooks === 'string'
                ? updatedThemeHooks
                : objectToCSSString(updatedThemeHooks);

            const styleTag = this.document.createElement('style');
            styleTag.type = 'text/css';
            styleTag.textContent = `:root { ${cssContent} }`;
            this.document.head.appendChild(styleTag);

            this.window.ux_globals.theme = { theme: updatedThemeHooks };

        } else if (parentWindow) {
            // Fallback: extract all CSS variables from parent window's :root
            try {
                const rootStyles = parentWindow.getComputedStyle(parentWindow.document.documentElement);
                const cssVariables = {};
                for (let i = 0; i < rootStyles.length; i++) {
                    const prop = rootStyles[i];
                    if (prop.startsWith('--')) {
                        cssVariables[prop] = rootStyles.getPropertyValue(prop).trim();
                    }
                }

                const cssContent = objectToCSSString(cssVariables);

                // Inject the CSS variables into this window's :root
                const styleTag = this.document.createElement('style');
                styleTag.type = 'text/css';
                styleTag.textContent = `:root { ${cssContent} }`;
                this.document.head.appendChild(styleTag);

                if (!this.window.ux_globals) {
                    Object.defineProperty(this.window, 'ux_globals', {
                        value: {},
                        writable: true,
                        configurable: true,
                        enumerable: true
                    });
                }

                this.window.ux_globals.theme = { theme: cssVariables };
            } catch (e) {
                // Handle cases where parent window is inaccessible (cross-origin)
                console.error('Failed to extract CSS variables from parent window:', e);
            }
        }

        /**
         * Convert an object of CSS variables into a CSS string.
         * @param {Object} cssObject
         * @returns {string}
         */
        function objectToCSSString(cssObject) {
            let cssString = '';
            for (const property in cssObject) {
                if (cssObject.hasOwnProperty(property)) {
                    cssString += `${property}: ${cssObject[property]}; `;
                }
            }
            return cssString.trim();
        }

        /**
         * Recursively resolves theme hook references.
         * @param {Object} object - Theme hook object.
         * @param {String} property - The property name to resolve.
         * @returns {String} - Resolved value.
         */
        function resolveThemeHooks(object, property) {
            const value = object[property];
            if (typeof value === 'string' && value.indexOf('--') === 0) {
                return resolveThemeHooks(object, value);
            }
            return value;
        }
    }, 0);
}
