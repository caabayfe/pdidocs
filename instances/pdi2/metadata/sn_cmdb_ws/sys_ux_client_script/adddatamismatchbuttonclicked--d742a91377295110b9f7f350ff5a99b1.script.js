/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
     const { ERROR_NOTIFICATION_PROPS} = imports["sn_cmdb_ws.cmdbMultisourceUtil"]();
     // Create copy of data mismatch array. Required to force update of repeater.
    var dataMismatchClasses = api.state.dataMismatchClasses.map((x) => x);
    var newTable = String(api.state.selectedDataMismatchClass); // Convert to string to avoid referece
    const duplicate = dataMismatchClasses.find(item => item.table === newTable);
    if(!duplicate) {
        const classObj = api.data.get_all_multisource_ci_classes_composite__rest_1.ciClassesWithSublabel.find(item => item.id === newTable);
        var tableLabel = classObj.label;
        dataMismatchClasses.unshift({
            'table' : newTable, 
            'table_label' : tableLabel,
            'ci_count_percent' : '',
            'attributes' : [],
            'attributes_list' : api.data.ms_get_attributes.output,
            'condition_type' : 1,
            'attr_type_options' : api.state.attrTypeOptions,
            'expand_accordion' : true
        });
        api.setState('dataMismatchClasses', dataMismatchClasses);
        api.setState('selectedDataMismatchClass', null);
        api.setState('isDirty',true);
    } else {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [
                {
                    ...ERROR_NOTIFICATION_PROPS,
                    content: await helpers.translate('This data mismatch class has already been added')
                }
            ]
        }); 
    }
}
