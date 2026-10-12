/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({ api, helpers }) {
    return api.state.sessionType === 'bulk_app_update' ? helpers.translateSync(
        "An upgrade plan has been created for you. You can review what you plan to install in the next environment."
    ) : helpers.translateSync(
        "An upgrade plan has been created for you. Select View upgrade plan to review what you plan to install in the next environment."
    );
}
