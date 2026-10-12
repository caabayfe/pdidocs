/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const nextButtonLabel = api.context.props.isLastVerification? await helpers.translate("Accept & continue to reset") : await helpers.translate("Accept & continue");
    api.setState("nextButtonLabel", nextButtonLabel);

}
