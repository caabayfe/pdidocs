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
    /* Update prop value when opp details notes preview is clicked.
       This will invoke COMPONENT_PROPERTY_CHANGED event in the component.
    */
    api.setState('selected_finding_id', event.payload.id);
    api.emit("CONTENT_UPDATED", {
        params: {
            selectedTab: api.state.TAB_ITEMS.OPPORTUNITY_DETAILS,
            findingId: event.payload.id,
        }
    });
}
