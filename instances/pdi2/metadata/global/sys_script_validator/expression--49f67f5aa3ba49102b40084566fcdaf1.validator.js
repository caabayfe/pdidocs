function validate(value) {
    var tableName = g_form.getElement('name').value;
    var scopeId = g_form.getElement('sys_scope').value;
    var ajax = new GlideAjax('FormulaValidator');
    ajax.addParam('sysparm_name','validate');
    ajax.addParam('sysparm_formula_expression',value);
    ajax.addParam('sysparm_table',tableName);
    ajax.addParam('sysparm_scope_id', scopeId);
    ajax.getXMLWait();
    var answer = ajax.getAnswer();
	if (JSON.parse(answer).valid === 'true') {
		return null;
	}
	var errors = JSON.parse(answer).errors;
	if (errors) {
		var error = JSON.parse(errors);
		var errorMsg = error[0].error;
		var errorPosition = error[0].position;
		if(errorPosition == null)
			answer = new GwtMessage().getMessage("Invalid Formula: {0}", errorMsg);
		else 
			answer = new GwtMessage().getMessage("Invalid Formula: {0} between positions ({1})", errorMsg, errorPosition);
		return answer;	
	}
}
