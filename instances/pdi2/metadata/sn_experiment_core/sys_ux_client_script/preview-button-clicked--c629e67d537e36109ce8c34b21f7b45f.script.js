/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const experiment = event.context.item.value.key;
    const selectedvariants = api.state.selectedvariant;
    const currentVariant = selectedvariants[experiment];

    if(!currentVariant) {
        api.setState('validationError', true);
        return;
    }

    api.setState('validationError', false);
    api.data.experiment_admin_preview_variant_1.execute({
        expKey: experiment,
        variantID: currentVariant
    });
}
