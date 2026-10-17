/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var value = event.payload.value;
    if(event.elementId === 'approver'){
        api.setState('approver', value);
    }else if(event.elementId === 'cost_adjust_type'){
        api.setState('costAdjustType',value);
    }else if(event.elementId === 'options'){
        api.setState('options',value);
    }else if(event.elementId === 'cost_adjust_percent'){
        if(value != 0){
         api.setState('costAdjustAmount',0);  
        }
        api.setState('costAdjustPercent',value);
    }else if(event.elementId === 'cost_adj_amount'){
        if(value != 0){
         api.setState('costAdjustPercent',0);  
        }
        api.setState('costAdjustAmount',value);
    } else if (event.elementId === 'start_date_picker') {
        api.setState('renStartDate',value);
    } else if (event.elementId === 'end_date_picker') {
        api.setState('renEndDate',value);
    }
}
