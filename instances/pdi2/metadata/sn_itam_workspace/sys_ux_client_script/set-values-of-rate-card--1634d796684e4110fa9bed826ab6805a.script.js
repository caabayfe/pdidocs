/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    
    var curr = api.data.rate_card_1.output.curr;
    var rate = api.data.rate_card_1.output.adjTypes; 
    var data = []; 
    for(var i = 0; i < rate.length; i++)
    {
        data[i] = JSON.parse(rate[i]);
    }
    api.setState('rateArray', data);

    var currency = {};
    for(var i = 0; i < curr.length; i++)
    {
        var obj = JSON.parse(curr[i]);
        var key = Object.getOwnPropertyNames(obj);
        var value = obj[key];
        currency[value] = key;
    }
    api.setState('currencyValues', currency);
    var temp = {};
    api.setState('updateValues', temp);
}
