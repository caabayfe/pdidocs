/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let fieldsCopy = {
        ...api.context.props.fields
    };
    var sowIncidentOverview = imports['sn_sow_inc.SowIncidentOverview']();
    sowIncidentOverview.setFocusOnClick(event.elementId, helpers,fieldsCopy);
}
