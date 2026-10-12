// check for existing rules for attributes
// if one or more attributes are part of an existing rule already, abort action
checkForExistingRules('attributes', current.attributes.split(','));

// validate attributes for largest/smallest value
// any invalid attributes will be removed from the attribute list with info message pop up
if (current.rule_type == 'largest_value' || current.rule_type == 'smallest_value') {
	current.attributes = removeInvalidFields(current.attributes.split(','));
	
	if (!current.attributes) {
		gs.addInfoMessage(gs.getMessage("Attributes cannot be empty"));
		current.setAbortAction(true);
	}
}

function checkForExistingRules(column, attrs) {
	for (var i in attrs) {
		var gr = new GlideRecord('cmdb_dynamic_reconciliation_definition');
		gr.addQuery('applies_to', current.applies_to);
		gr.addEncodedQuery(column + 'CONTAINS'+ attrs[i]);
		gr.query();

		if(gr.next()) {
			if (gr.sys_id != current.sys_id) {
				gs.addInfoMessage(gs.getMessage("One or more attributes are already part of an existing rule."));
				current.setAbortAction(true);
			}
		}
	}
}

function removeInvalidFields(attrs) {
	var scanned = [];
	for (var i in attrs) {
		var field = attrs[i];
		var gr = new GlideRecord(current.applies_to);
		var fieldElement = gr.getElement(field);
		var ed = fieldElement.getED();
		if (ed == null) {
			gs.addInfoMessage(gs.getMessage("Error with the field {0}. Aborting action", field));
			current.setAbortAction(true);
		} else {
			if (!ed.isTrulyNumber()) {
				gs.addInfoMessage(gs.getMessage("{0} is not a numeric field. Removed from attribute list", field));
			} else {
				scanned.push(field);
			}
		}
	}
	return scanned.join(',');
}
