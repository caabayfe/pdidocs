/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return `
  <script>
    function setFullViewWidth() {
    const polarisShellMacroponentElement = document.querySelector('macroponent-f51912f4c700201072b211d4d8c26010');
    const canvasAppShellMainElement = polarisShellMacroponentElement && polarisShellMacroponentElement.shadowRoot.querySelector('sn-canvas-appshell-main');
    const visibleAceUnifiedNavAppShellMacroponentElement = canvasAppShellMainElement && canvasAppShellMainElement.shadowRoot.querySelector("sn-canvas-experience-shell:not([style*='display: none;']) > macroponent-7045b717532d411033cdddeeff7b1275");
    const layoutElement = visibleAceUnifiedNavAppShellMacroponentElement && visibleAceUnifiedNavAppShellMacroponentElement.shadowRoot.querySelector('sn-layout');
    const gridElement = layoutElement && layoutElement.shadowRoot.querySelector('div');

    if (gridElement)
      gridElement.style.setProperty('max-width', '100vw');
      gridElement.style.setProperty('height', '100%');
    }
    setFullViewWidth();
  </script>`;
}
