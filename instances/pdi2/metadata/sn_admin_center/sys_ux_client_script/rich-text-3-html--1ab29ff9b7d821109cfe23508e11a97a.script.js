/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let installedLabel = helpers.translateSync('Installed');
    let totalLabel = helpers.translateSync('Total');
    let appsInstalledVal = api.state.appsInstalled;
    let totalAppsVal = api.state.totalApps;
     let applicationsMsg = helpers.translateSync('Applications');
    let installedMessageLabel = `${appsInstalledVal}&#20;${installedLabel}&#20;${applicationsMsg}`;
    let totalMessageLabel = `${totalAppsVal}&#20;${totalLabel}&#20;${applicationsMsg}`;
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
    <div class='version-label'>${installedLabel}</div>
    <div class='version-label'>${totalLabel}</div>
    <div class='version-value'><a href='/now/app-manager/home/tab/installed/sort/recently_released/filter/applications' target='_blank' aria-label=${installedMessageLabel}>${appsInstalledVal}</a></div>
    <div class='version-value'><a href='/now/app-manager/home/tab/available_for_you/sort/recently_released/filter/applications' target='_blank' aria-label=${totalMessageLabel}>${totalAppsVal}</a></div>
  </div>
  `;
    return html;
}
