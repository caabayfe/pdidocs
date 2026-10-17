/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.timing.setTimeout(function () {
        var style = this.document.createElement('style');
	    style.innerHTML = `
            .will-truncate {
                font-size: 1.13rem;
                white-space: normal !important;
            }
            .now-form-field-legend .now-form-field-label {
                block-size: inherit;
            }
        `;
        this.window.document.querySelector("html body macroponent-f51912f4c700201072b211d4d8c26010").shadowRoot.querySelector("sn-canvas-appshell-root").shadowRoot.querySelector("sn-canvas-modal-hoist").querySelector("seismic-hoist now-uxf-page-simple-container#item-body_1 now-radio-buttons").shadowRoot.querySelector(".now-radio-buttons-fieldset.-field-vertical .now-form-field-legend .now-line-height-crop").appendChild(style);
    });
}
