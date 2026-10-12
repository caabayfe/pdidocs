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
    const eventName = event.name;
    const {
        displayValue,
        fieldName,
        value
    } = event.payload;
    let { elementId } = event;
    let formSection = elementId.substring(0, elementId.indexOf('_'));
    var sowIncidentOverview = imports['sn_sow_inc.SowIncidentOverview']();
    
    switch (eventName) {
        case 'NOW_RECORD_FORM_SECTION_COLUMN_LAYOUT#SET_VALUE':
            sowIncidentOverview.onFieldChange(api, helpers, api.state.fieldsCopy, fieldName, value, displayValue);
            var dirtyFields = api.state.dirtyFields;
            if(dirtyFields[formSection]) {
                dirtyFields[formSection].push(fieldName);
            } else {
                dirtyFields[formSection] = [fieldName];
            }
            api.setState("dirtyFields",dirtyFields);
            break;
    }
}
