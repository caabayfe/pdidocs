/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var approver = api.data.look_up_record_contract.result.approver.value;
    var options = api.data.look_up_record_contract.result.renewal_options.value;
    var renStartDate = api.data.look_up_record_contract.result.renewal_date.displayValue;
    var renEndDate = api.data.look_up_record_contract.result.renewal_end_date.displayValue;
    var costAdjPercent = api.data.look_up_record_contract.result.cost_adjustment_percentage.value;
    var costAdjType = api.data.look_up_record_contract.result.cost_adjustment_type.value;
    var costAdjAmount = api.data.look_up_record_contract.result.cost_adjustment.value;
    var startDate = api.data.look_up_record_contract.result.starts.displayValue;
    api.setState('approver', approver);
    api.setState('renStartDate', renStartDate);
    api.setState('renEndDate', renEndDate);
    api.setState('costAdjustPercent', costAdjPercent);
    api.setState('costAdjustAmount', costAdjAmount);
    api.setState('starts', startDate);
    if (options != null) {
        api.setState('options', options);
    }
    if (costAdjType != null) {
        api.setState('costAdjustType', costAdjType);
    }
    if (approver) {
        var dropdownvalues = [];
        dropdownvalues.push({
				id: approver,
				label: api.data.look_up_record_contract.result.approver.displayValue,
                sublabel: api.data.look_up_record_contract.result.approver._reference.email.displayValue,
			});
        api.setState('dropDownValues', dropdownvalues);
    }

}
