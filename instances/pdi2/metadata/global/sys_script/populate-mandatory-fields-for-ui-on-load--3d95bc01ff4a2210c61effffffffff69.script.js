var onLoadMandatory = [];
var mandatoryField = [];
if (!gs.nil(current.model_category) && (!gs.nil(current.ci) || current.substatus === 'pre_allocated')) {
	var modelCatgory = current.model_category;
	mandatoryField = AssetUtils.getMandatoryAttributes(modelCatgory);
	// initializing this array to false as this should be calculated by the script in the UI
	onLoadMandatory = Array(mandatoryField.length).fill(false);
}
g_scratchpad.formMandatoryFields = [mandatoryField, onLoadMandatory];
