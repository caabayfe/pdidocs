var table = current.table;
var appliesTo = current.identifier.applies_to;
var hybridAttributes = current.hybrid_entry_ci_criterion_attributes;
var attributes = current.attributes;

// if hybrid rule with > 0 hybrid attributes, append to attributes
if (table != appliesTo && hybridAttributes) {
	attributes = attributes + ',' + hybridAttributes;
}

var invalid = SNC.IdentificationEngineScriptableApi.validateExcludedFields(
	attributes,
	current.identifier.independent);

if (!invalid.isEmpty()) {
	var invalidFields = invalid.toString();
	gs.addInfoMessage(gs.getMessage("Usage of {0} not allowed for identification rules!", invalidFields));
	current.setAbortAction(true);	
}
