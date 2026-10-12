/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (!event.payload.data?.output) {
        helpers.modal.open("change_provider_modal");
    } else {
        api.data.set_llm_provider_for_capabilities.execute({
            providerConfiguration: api.state.currentCapablityGroup
        });
    }
}
