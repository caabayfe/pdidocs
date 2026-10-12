var maintAttributes = GlideProperties.get('glide.maint.dictionary_attributes', '').trim();
var currentAttribute = new GlideRecord('sys_schema_attribute');
var currentAttributeIsMaint = false;
var previousAttribute = new GlideRecord('sys_schema_attribute');
var previousAttributeIsMaint = false;
if(maintAttributes.length() > 0) {
	var currentAttributeId = current.attribute.toString();
	if(GlideStringUtil.isEligibleSysID(currentAttributeId)) {
		currentAttribute.addQuery('sys_id', currentAttributeId);
		currentAttribute.addQuery('name', 'IN', maintAttributes);
		currentAttribute.query();
		currentAttributeIsMaint = currentAttribute.next();
	}
	var previousAttributeId = previous.attribute.toString();
	if(GlideStringUtil.isEligibleSysID(previousAttributeId)) {
		previousAttribute.addQuery('sys_id', previousAttributeId);
		previousAttribute.addQuery('name', 'IN', maintAttributes);
		previousAttribute.query();
		previousAttributeIsMaint = previousAttribute.next();
	}
}

var errorMessage = null;
var op = current.operation();
if(op == 'insert' && currentAttributeIsMaint)
	errorMessage = gs.getMessage("The attribute '{0}' cannot be added to a system {1} record unless maint", [currentAttribute.label, new GlideRecord('sys_dictionary').getLabel()]);
else if(op == 'delete' && previousAttributeIsMaint)
	errorMessage = gs.getMessage("The attribute '{0}' cannot be removed from a system {1} record unless maint", [previousAttribute.label, new GlideRecord('sys_dictionary').getLabel()]);
else if(op == 'update' && (currentAttributeIsMaint || previousAttributeIsMaint)) {
	var label = previousAttributeIsMaint ? previousAttribute.label : currentAttribute.label;
	errorMessage = gs.getMessage("The attribute '{0}' cannot be edited on a system {1} record unless maint", [label, new GlideRecord('sys_dictionary').getLabel()]);
}

if(errorMessage != null) {
	gs.addErrorMessage(errorMessage);
	current.setAbortAction(true);
}
