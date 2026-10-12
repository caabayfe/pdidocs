(function executeRule(current, previous /*null when async*/) {

	var CHG_MODEL  = "chg_model";
	var CHG_MODEL_TEMPLATE = "chg_model_template";

    var changeRequest = new ChangeRequest(current);
    var stateField = changeRequest.getStateFieldName();
	var isInsert = current.operation() === "insert";

    // Build the single list of read-only fields to check. Defaults to the current
    // state's read-only fields.
    var fieldsToCheck = changeRequest.getReadOnlyFields();

	// Remove check of preset read only fields on insert or on a model change
	if (isInsert || current[CHG_MODEL].changes()) {
		var presetFields = changeRequest._getAPI()._model.getRecordPresetFields();
		fieldsToCheck = fieldsToCheck.filter(function(field){
			return presetFields.indexOf(field) === -1;
		});
	}

	// Remove check of template read only fields on insert or on a template change
	if (isInsert || (current[CHG_MODEL_TEMPLATE].changes() && !current[CHG_MODEL_TEMPLATE].nil())) {
		var changeTemplate = new ChangeTemplate(current.getValue(CHG_MODEL_TEMPLATE));
		var templateReadOnlyFields = changeTemplate.getFieldPolicies().readOnlyFieldPolicies;
		fieldsToCheck = fieldsToCheck.filter(function(field){
			return templateReadOnlyFields.indexOf(field) === -1;
		});
	}

    /**
	 * On a state change, restrict to fields read-only in both previous and current states.
	 * Only if the model hasn't changed and it's not an insert.
	 */
    if (current[stateField].changes() && !current[CHG_MODEL].changes() && !isInsert) {
        var previousReadOnly = new ChangeRequest(previous).getReadOnlyFields();
        fieldsToCheck = fieldsToCheck.filter(function(field) {
            return previousReadOnly.indexOf(field) !== -1;
        });
    }

	/**
	 * We have a case where a field is both mandatory and read only.  If the field was blank, allow the update.
	 * This mirrors the form behaviour allowing you to set the field if it's blank, read only and mandatory.
	 */
	var mandatoryFields = changeRequest.getMandatoryFields();
    var changed = fieldsToCheck.filter(function(field) {
		var isMandatory = mandatoryFields.indexOf(field) !== -1;

		if (!current[field].changes())
			return false;

		// Cater for new records with mandatory read only fields on insert
		if (isInsert && isMandatory)
			return false;

		// Mandatory and previous blank value
		if (isMandatory && previous[field].nil())
			return false;

        return true;
    });

    if (changed.length) {
        var labels = changed.map(function(field) { return current[field].getLabel(); });
        gs.addErrorMessage(gs.getMessage("Read-only fields cannot be modified: {0}", [labels.join(', ')]));
        current.setAbortAction(true);
    }
})(current, previous);
