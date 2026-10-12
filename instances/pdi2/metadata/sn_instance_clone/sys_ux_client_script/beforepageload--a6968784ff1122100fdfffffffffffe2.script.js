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
    debugger;
    let blockcontext = {};
    blockcontext.hideMIF=!JSON.parse(api.data.fetch_system_properties_1.output.properties["sn_instance_clone.configuration.hide.mif"]);
    helpers.translate('overview')
        .then((translatedText) => {
            blockcontext.overviewLabel = translatedText;
            api.setState('blockcontext', blockcontext);
        });
}
