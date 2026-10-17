var isValid = SNC.TableEditor.validateDefaultValue(current.name,current.element,current.default_value,current.internal_type,current.reference,current.use_dynamic_default);
if(!isValid) {
	current.setAbortAction(true);
    current.default_value.setError('Invalid default value');
    gs.addErrorMessage(gs.getMessage('Invalid default value'));
}
