/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const localHelpers = helpers;
    helpers.timing.setTimeout(function() {
        // Select the iframe element
        const iframe = this.document.querySelector('macroponent-f51912f4c700201072b211d4d8c26010')
            .shadowRoot.querySelector('sn-canvas-appshell-root')
            .shadowRoot.querySelector('seismic-hoist[src="/sys_upgrade_skipped_record_rule.do"]')
            .shadowRoot.querySelector('sn-canvas-iframe')
            .shadowRoot.querySelector('iframe');

        function onIframeLoad() {
            if (this.contentWindow.location.pathname !== '/sys_upgrade_skipped_record_rule.do') {
                localHelpers.modal.close('iframe_1');
                iframe.removeEventListener('load', onIframeLoad);
            }
        }

        if (iframe && iframe.addEventListener) {
            iframe.addEventListener('load', onIframeLoad);
        }
    }, 500);
}
