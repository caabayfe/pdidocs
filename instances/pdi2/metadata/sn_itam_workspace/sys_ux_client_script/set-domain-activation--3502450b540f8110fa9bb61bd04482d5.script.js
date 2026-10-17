/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    
    var active  = api.data.domain_details_1.output.active;
    var domain = api.data.domain_details_1.output.domain;
    var currency = {};
    if(active == true){
        api.setState('domainActive', true);
        for(var i = 0; i < domain.length; i++)
        {
            var obj = JSON.parse(domain[i]);
            var key = Object.getOwnPropertyNames(obj);
            currency[key] = obj[key];
        }
    }
     api.setState('domainValues', currency);
}
