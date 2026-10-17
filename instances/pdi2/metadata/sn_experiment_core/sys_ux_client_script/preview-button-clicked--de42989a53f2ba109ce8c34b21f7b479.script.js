/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const expKey = api.state.experimentKey;
    const variantID = api.state.selectedVariant;

    api.data.experiment_admin_preview_variant_1.execute({ expKey, variantID });
}
