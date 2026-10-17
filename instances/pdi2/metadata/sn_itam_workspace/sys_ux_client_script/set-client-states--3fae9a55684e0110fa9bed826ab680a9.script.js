/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var value = event.payload.value;
 
    if(event.elementId === 'payment'){
        api.setState('adjAmount',value);
    }else if(event.elementId === 'adj_start_date'){
        api.setState('adjStartDate',value);
    }else if(event.elementId === 'adj_end_date'){
        api.setState('adjEndDate',value);
    }

    if(api.state.rateCard) {
        var rate = api.state.updateValues;
        var sysId = event.context.item.value.sysId;
        var empty = Object.keys(rate).length === 0 && rate.constructor === Object;
        var data = event.context.item.value;
        if(!empty && rate[sysId] != undefined)
            data = rate[sysId];

        if(event.elementId === 'rate_start_date'){
            api.setState('rateStartDate',value);
            data.start_date = value;
        }else if(event.elementId === 'rate_end_date'){
            api.setState('rateEndDate',value);
            data.end_date = value;
        }else if(event.elementId === 'base_cost'){
            api.setState('cost',value);
            data.base_cost = value;
        }else if(event.elementId === 'card_name'){
            api.setState('name',value);
            data.name = value;
        }
        rate[sysId] = data;
        api.setState("updateValues", rate);
    }
}
