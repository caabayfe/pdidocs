/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const { ERROR_NOTIFICATION_PROPS} = imports["sn_cmdb_ws.cmdbMultisourceUtil"]();
    // Create copy of coverageClasses array. Required to forece update of repeater.
    let coverageClasses = api.state.coverageClasses.map((x) => x);
    var inputWeight = event.payload.fieldValue;
    var inputWeightFloat = parseFloat(inputWeight);
    if(inputWeightFloat < 0 || inputWeightFloat > 100 || inputWeight === '') {
        //emit an error notification
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                ...ERROR_NOTIFICATION_PROPS,
                "content": await helpers.translate("invalid Coverage weight % value entered for {0}",coverageClasses[event.context.item.index].table_label)
            }]
        });
    } else {
        coverageClasses[event.context.item.index].ci_count_percent = event.payload.fieldValue;
        api.setState('coverageClasses', coverageClasses);   
        api.setState('isDirty',true); 
    }
     
}
