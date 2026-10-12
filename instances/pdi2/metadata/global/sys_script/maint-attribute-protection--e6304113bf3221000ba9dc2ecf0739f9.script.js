var currentAttributes = new GlideAttributes(current.attributes);
var previousAttributes = new GlideAttributes(previous.attributes);
var maintAttributesStr = GlideProperties.get('glide.maint.dictionary_attributes', '').trim();
var maintAttributes = maintAttributesStr.length() > 0 ? maintAttributesStr.split(',') : [];
var l = maintAttributes.length;
for(var i = 0;  i < l; i++) {
	var maintAttribute = maintAttributes[i];
	var currentContainsAttribute = currentAttributes.containsAttribute(maintAttribute.trim());
	var previousContainsAttribute = previousAttributes.containsAttribute(maintAttribute.trim());
	var errorMessage = null;
	if (currentContainsAttribute && !previousContainsAttribute)
		errorMessage = gs.getMessage("The attribute '{0}' cannot be added to a system {1} record unless maint", [maintAttribute, new GlideRecord('sys_dictionary').getLabel()]);
	else if (!currentContainsAttribute && previousContainsAttribute)
		errorMessage = gs.getMessage("The attribute '{0}' cannot be removed from a system {1} record unless maint", [maintAttribute, new GlideRecord('sys_dictionary').getLabel()]);
	else if(currentContainsAttribute && previousContainsAttribute) {
		var currentMaintAttributeValue = currentAttributes.getAttribute(maintAttribute);
		var previousMaintAttributeValue = previousAttributes.getAttribute(maintAttribute);
		if(currentMaintAttributeValue != previousMaintAttributeValue)
			errorMessage = gs.getMessage("The attribute '{0}' cannot be edited on a system {1} record unless maint", [maintAttribute, new GlideRecord('sys_dictionary').getLabel()]);
	}
	if(errorMessage != null) {
		gs.addErrorMessage(errorMessage);
		current.attributes.setError(errorMessage);
		current.setAbortAction(true);
		current.attributes = previous.attributes;
		break;
	}
}
