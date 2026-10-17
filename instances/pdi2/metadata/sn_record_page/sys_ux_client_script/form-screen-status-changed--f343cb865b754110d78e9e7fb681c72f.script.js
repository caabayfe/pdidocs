/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
      title,
      tooltipPreview,
      primaryItem,
      secondaryItems,
      hasUpdate,
      isDirty,
      status,
      skipNextScreenActivation,
      screenParams
    } = event.payload;
    api.emit("SCREEN_STATUS_CHANGED", {
        title,
        tooltipPreview,
        primaryItem,
        secondaryItems,
        hasUpdate,
        isDirty,
        status,
        skipNextScreenActivation,
        screenParams: screenParams ? { table: screenParams.table, sysId: screenParams.sys_id || screenParams.sysId} : null
    });
}
