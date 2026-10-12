/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const elementIdsToIsEmittingPageDataMap = {'details_content_block': false, 'business_objective_cards': false, 'app_details_block': false};
    if (elementIdsToIsEmittingPageDataMap[event.elementId]) {
        api.emit('ACE_ACTION_PERFORMED', {eventName: 'PAGE_DATA_LOADED', eventPayload: api.context.props.payload.pageParams.pageData});
    }
}
