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
    var eventsMapping = {
        'expertsoncall':'SOW Experts On Call Accessed',
        'action-library': 'Click dex action library',
        'playbooks': 'Click playbook'
    };
    if (event.name == 'UXF_TAB_SET#TAB_SELECTED') {
        var tabName = '';
        const SELECTED_TAB = event.payload.selectedTab;
        if (SELECTED_TAB.includes("^route=")) {
            tabName = SELECTED_TAB.split("^route=")[1];
        }
        if (eventsMapping[tabName]) {
            api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
                event: eventsMapping[tabName],
                value: {
                    type: api.context.props.table
                }
            });
        }
    }
}
