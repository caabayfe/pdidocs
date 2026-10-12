var table = current.table;
var appliesTo = current.identifier.applies_to;
var attributes = current.attributes;
var hybridAttributes = current.hybrid_entry_ci_criterion_attributes;

// validate attributes
var validatedFields = validateAttributes(table, attributes, "identifier entry on " + table);
current.attributes = validatedFields.join();

// now validate hybrid attributes
if (table != appliesTo && hybridAttributes) {

	var validHybridFields = validateAttributes(appliesTo, hybridAttributes,
					   "hybrid identifier entry on " + appliesTo);
	current.hybrid_entry_ci_criterion_attributes = validHybridFields.join();
}

function validateAttributes(table, attributes, ruleType) {
	var attrs = attributes.split(',');
	var gr = new GlideRecord(table);
	var left = [];
	for (var i in attrs) {
		if (attrs[i].indexOf('.')!=-1 ||
			gr.getElement(attrs[i])===null) {
			// skip invalid fields
		} else {
			left.push(attrs[i]);
		}
	}

	if (left.length != attrs.length) {
		gs.addInfoMessage(gs.getMessage("Invalid attributes have been skipped for {0} !", ruleType));
	}
	if (left.length === 0) {
		current.setAbortAction(true);
	}
	return left;
}
