(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	current.addQuery('cmn_rota_escalation_set', parent.getUniqueValue());
	current.addQuery('cmn_rota', parent.getValue('cmn_rota'));
	current.addQuery('type', 'escalation_set');

})(current, parent);
