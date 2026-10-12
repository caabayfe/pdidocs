/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    // Check if Now LLM is available
    api.setState("switchNowLLMcheck", event.payload?.data?.output);

    //Open Modal
    var message = await helpers.translate("This will enable the skill with {0}", api.state.skillProvider);
    api.setState('agreeConsentMessage', message);
    api.setState('changeScope', true);
    api.setState('switchToNowLLM', false);
    helpers.modal.open('select_llm');

}
