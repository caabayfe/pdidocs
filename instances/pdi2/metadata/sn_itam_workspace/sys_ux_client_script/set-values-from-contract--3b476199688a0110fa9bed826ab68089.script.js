/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    var adjStartDate = api.data.contract_record_1.result.starts.displayValue;
    var adjEndDate = api.data.contract_record_1.result.ends.displayValue;
    var rateCard = api.data.contract_record_1.result.ratecard.value;
    var amount = api.context.props.paymentAmount;

    api.setState('adjAmount', amount);
    api.setState('adjStartDate', adjStartDate);
    api.setState('adjEndDate', adjEndDate);
    api.setState('rateCard', rateCard);
}
