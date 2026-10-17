/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    // Create copy of coverageClasses array. Required to force update of repeater.
    const { ERROR_NOTIFICATION_PROPS} = imports["sn_cmdb_ws.cmdbMultisourceUtil"]();
    var coverageClasses = api.state.coverageClasses.map((x) => x);
    var newTable = String(api.state.selectedCoverageClass); // Convert to string to avoid referece
    const duplicate = coverageClasses.find(item => item.table === newTable);
    if(!duplicate) {
        const classObj = api.data.get_all_multisource_ci_classes_composite__rest_1.ciClassesWithSublabel.find(item => item.id === newTable);
        var tableLabel = classObj.label;
        const excludedReasonInfo = api.data.ms_get_class_exclusion_reason_info.output;
        coverageClasses.unshift({
            'table' : newTable, 
            'table_label' : tableLabel,
            'ci_count_percent' : '0',
            'exclude': excludedReasonInfo.length > 0,
            'table_excluded_info': excludedReasonInfo
        });
        api.setState('coverageClasses', coverageClasses);
        api.setState('selectedCoverageClass', null);
        api.setState('isDirty',true);
    } else {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [
                {
                    ...ERROR_NOTIFICATION_PROPS,
                    content: await helpers.translate('This coverage class has already been added')
                }
            ]
        }); 
    }
}
