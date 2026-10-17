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
    const {
        fields,
        modifiedFields
    } = api.state || {};
    const {
        trackUsage
    } = imports["sn_oe_sfs.CITelemetry"](api);
    const {
        table,
        sysId
    } = api.context.props;
    let tableName =  api.data.page_props.output.heading || table;
    switch(table) {
        case 'open_nlu_driver_language':
        case 'sys_cs_nlu_language':
            tableName = 'Open NLU Driver Language';
            break;
        case 'sys_language':
            tableName = 'Dynamic Translation Language';
            break;
    }

    if (event.name == 'SN_FORM_DATA_CONNECTED#FETCH_SUCCESS' && sysId != -1) {
        const eventName = 'CI - Frequently modified fields - ' + tableName;
        Object.keys(modifiedFields).forEach(function(field) {
            if (fields[field] != modifiedFields[field]) {
                trackUsage(eventName, {
                    fields: field
                });
            }
        });
        const recordValues = event.payload.data.GlideViewQuery_Query.uiView.glideLayoutItem._query.GlideLayout_Query.formLayout.recordValues;
        for (var i = 0; i < recordValues.length; i++) {
            fields[recordValues[i].name] = recordValues[i].value;
        }
        api.setState('fields', fields);
    }




}
