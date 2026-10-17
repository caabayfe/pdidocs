/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({ api, helpers }) {  
    return api.state.sessionType === 'bulk_app_update' ? helpers.translateSync(
        "Export update sets and deployment plans to your next sub-production environment. Ensure that all necessary modifications are applied to the next sub-production instance."
    ) : helpers.translateSync(
        "In this step, you export update sets and deployment plans to your next sub-production environment. This step is crucial for ensuring that all necessary modifications are applied to the next sub-production instance."
    );
}
