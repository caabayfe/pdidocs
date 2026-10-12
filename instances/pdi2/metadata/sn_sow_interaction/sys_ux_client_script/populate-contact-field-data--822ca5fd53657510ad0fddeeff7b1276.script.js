/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
const { NowDateTime } = imports['sn_uxf.core_libraries']();
var timezone = api.data.now_timezone.output;
var timeFormat = api.context.session.user.timeFormat;
var response = '';
    if (api.data.lp_record.result 
    && api.data.lp_record.result.location 
    && api.data.lp_record.result.location._reference 
    && api.data.lp_record.result.location._reference.city
    && api.data.lp_record.result.location._reference.city.displayValue) {
        response = api.data.lp_record.result.location._reference.city.displayValue;
    }
    if (timezone) {
    	if (response)
    		response += ' • ';
        response += NowDateTime().tz(timezone).format(timeFormat) + ' ' + timezone;
    }
    api.setState('contactField', response);
}
