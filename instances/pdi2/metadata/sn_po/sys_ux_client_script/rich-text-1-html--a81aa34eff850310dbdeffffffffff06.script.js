/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({api, helpers}) {
    const recordsWithinPercentage = api.state.projectData.miningSummary?.errorContext?.entitlementNumbers?.recordsWithinPercentage ?? 0;
    return `<div class="records-within" style="width: ${recordsWithinPercentage}%;background-color: RGB(var(--now-datavis_color--blue-5)); flex-grow: 1; height: var(--now-scalable-space--lg);"></div>
    <div class="separator" style="background-color: RGB(var(--now-color--text-primary));height: var(--now-scalable-space--xl);">|</div>
    <div class="records-exceeding" style="width: ${100 - recordsWithinPercentage}%;background-color: RGB(var(--now-color_grouped--orange-1)); flex-grow: 1; height: var(--now-scalable-space--lg);"></div>`;

}
