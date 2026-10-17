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
    const formData = api.data.gform;

    // Attaching query filter to embedded help tab
    const embeddedHelpTab = getEmbeddedHelpTab(formData.nowRecordFormBlob);
    if (embeddedHelpTab) {
        embeddedHelpTab.fields.query = api.context.props.payload.props_details.query;
    }

    api.emit('ACE_ACTION_PERFORMED_RELAY_e527c89219410110f87733dbe4f9549f', {
        eventName: event.name,
        eventPayload: formData
    });

    const customComponentRoute = formData.nowRecordFormBlob && formData.nowRecordFormBlob.formFieldValues && formData.nowRecordFormBlob.formFieldValues.route && formData.nowRecordFormBlob.formFieldValues.route.value;
    if (customComponentRoute) {
        api.setState('customComponentRoute', customComponentRoute);
        api.data.ux_app_route_gliderecord.refresh();
    }

    function getEmbeddedHelpTab(nowRecordFormBlob) {
        if (!nowRecordFormBlob || !nowRecordFormBlob.tabRoutes)
            return null;

        return nowRecordFormBlob.tabRoutes.filter(tab => tab.fields.table == 'help_guidance')[0] || null;
    }
}
