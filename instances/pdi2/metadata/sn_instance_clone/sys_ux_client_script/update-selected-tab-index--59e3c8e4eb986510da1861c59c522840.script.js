/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    //selected tab is 'details' -> default forms tab
    if (event.payload.selectedTabIndex == 0) {
        api.setState('hideAllCustomFields', false);
    } else {
        api.setState('hideAllCustomFields', true);
    }

    const gFormData = api.data.gform.nowRecordFormBlob;
    if (gFormData.isNewRecord)
        return;

    const {
        selectedTabIndex,
        isInitialPageLoad
    } = event.payload;

    if (isInitialPageLoad === false) { // Not emit CONTENT_UPDATED when isInitialPageLoad is undefined or true
        api.emit('CONTENT_UPDATED', {
            params: {
                selectedTabIndex: selectedTabIndex,
                query: api.context.props.query,
                views: api.context.props.views,
                extraParams: api.context.props.extraParams
            }
        });
    }
}
