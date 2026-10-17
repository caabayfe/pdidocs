/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let currentVersionLabel = helpers.translateSync('Current version');
    let scheduledVersionLabel = helpers.translateSync('Scheduled version');
    let scheduledVersion = api.state.scheduledVersion === 'N/A' ? helpers.translateSync('Latest version') : api.state.scheduledVersion;
    let scheduledOn = api.state.scheduledOn === 'N/A' ? '' : helpers.translateSync('Scheduled on {0}', new Date(api.state.scheduledOn).toDateString());
    let eolVal = api.state.eolVal === 'Yes' ? helpers.translateSync('End of Life') : '';
    let html = `
    <style>
    .version-label {
      font-family: var(--now-font-family, 'Lato');
      font-style: normal;
      font-weight: 400;
      font-size: var(--now-global-font-size--md, 16px);
      color: rgb(var(--now-color_text--primary, 21, 25, 32));
      padding-bottom: 0.8rem
    }
    .version-value {
      font-family: var(--now-font-family, 'Lato');
      font-style: normal;
      font-weight: 300;
      font-size: var(--now-global-font-size--xl, 24px);
      color: rgb(var(--now-color_text--primary, 21, 25, 32));
      padding-bottom: 0.8rem
    }
    .grid-container {
      display: grid;
      grid-template-columns: auto auto;
      column-gap: 2rem;
    }
</style>
  </style>
  <div class='grid-container'>
    <div class='version-label'>${currentVersionLabel}</div>
    <div class='version-label'>${scheduledVersion}</div>
    <div class='version-value'>${helpers.translateSync(api.state.currentReleaseVersion)}</div>
    <div class='version-value'>${scheduledVersion}</div>
    <div class='version-label'>${eolVal}</div>
    <div class='version-label'>${scheduledOn}</div>
  </div>
  `;
    return html;
}
