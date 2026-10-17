/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let uvLabel = helpers.translateSync('Upgradability violations');
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
    .grid-container {
      display: grid;
      grid-template-columns: auto auto;
    }
    a {
      text-decoration: none;
      color: rgb(var(--now-color_text--primary));
    }
    a:hover {
      background-color: rgb(var(--now-color_background--secondary));
    }
</style>
  </style>
  <div class='grid-container'>
    <div class='version-label'>${uvLabel}</div>
  </div>
  `;
    return html;
}
