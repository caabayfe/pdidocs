/**
 * @param {params} params
 * @param {api} params.api
 * @param {event} params.event
 * @param {imports} params.imports
 * @param {helpers} params.helpers
 */
function refreshOpenFrameAfterFetchCompleted({
    api, event, helpers, imports
}) {
    if (api.state.isOpenframeConfigValid) return;
 helpers.timing.setTimeout(() => {
        api.data.validate_openframe_configuration_1.refresh(); //Explicitly invoke the DB of Open Frame
    }, 5000);

}
