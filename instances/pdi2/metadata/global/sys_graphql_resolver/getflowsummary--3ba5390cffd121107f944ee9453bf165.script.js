(function process(/*ResolverEnvironment*/ env) {

    // implement data resolver here
	function createError(title, details) {
		var error = {};
		error.apiErrorTitle = title;
		error.apiErrorDetails = details;
		return error;
	}

    var flowSysId = env.getArguments().flowSysId;
	if (!flowSysId) {
		return createError("Input empty", "Flow sys_id is empty");
	} 
	// return error if flowSysId does not have 32 in length or not in hex
	try {
		if (!(flowSysId.length == 32 && /[0-9A-F]{32}$/i.test(flowSysId))) {
			return createError("Incorrect Format", "Flow sys_id is not in the correct sys_id format");
		}
	} catch (e) {
		return createError("Incorrect Format", "Flow sys_id is not in the correct sys_id format and error has been thrown");
	}

    var flow = sn_flow.FlowDesigner.getCompleteFlow(flowSysId);
	if (!flow) {
		return createError("Match Not Found", "Cannot find a flow match for input sys_id");
	}
    var jsonFlow = JSON.parse(flow);
	if (jsonFlow) {
		var key;
		if (jsonFlow.stages) {
			var newStages = [];
			for (key in jsonFlow.stages) {
				if (Object.prototype.hasOwnProperty.call(jsonFlow.stages, key)) {
					newStages.push(jsonFlow.stages[key]);
				}
			}
			jsonFlow.stages = newStages;
		}
		if (jsonFlow.pharmacy && jsonFlow.pharmacy.pharmacyCompound) {
			var newPharmacies = [];
			for (key in jsonFlow.pharmacy.pharmacyCompound) {
				if (Object.prototype.hasOwnProperty.call(jsonFlow.pharmacy.pharmacyCompound, key)) {
					newPharmacies.push(jsonFlow.pharmacy.pharmacyCompound[key]);
				}
			}
			jsonFlow.pharmacy.pharmacyCompound = newPharmacies;
		}
	} 
    return jsonFlow;

})(env);
