if ((!current.table.nil()) && !isTableBlacklisted(current.table)
	&& (current.operation() == 'insert' || current.table.changes() || current.condition.changes())) {
	var updateCurrent = false;
    updateCurrent = createBusinessRule(current);
    updateCurrent = createDeleteBusinessRule(current) || updateCurrent;
	if (updateCurrent) {
		current.setWorkflow(false);
		current.update();
		current.setWorkflow(true);
	}
}

function createBusinessRule(current) {
	var gr = new GlideRecord("sys_script");
	if (!current.business_rule.nil() && ((!gr.get(current.business_rule)) || (current.operation() == "insert")))
			current.business_rule = "";
	
	if ((current.table.changes()) || current.condition.changes() || (current.operation() == "insert")) {
		gr.collection = current.table;
		gr.script = buildScript(current);
		gr.execute_function = true;
		gr.condition = "";
	}
	if (current.business_rule.nil()) {
		gr.name = "Auto business rule for Assessments";
		gr.action_insert = true;
		gr.action_update = true;
		gr.active = true;
		gr.when = "after";
		var br = gr.insert();
		current.business_rule = br;
		return true;
	} else
		gr.update();
	return false;
}

function createDeleteBusinessRule(current) {
	var gr = new GlideRecord("sys_script");
		
	if (!current.delete_business_rule.nil() && ((!gr.get(current.delete_business_rule)) || (current.operation() == "insert")))
			current.delete_business_rule = "";
	if ((current.table.changes()) || (current.operation() == "insert")) {
		gr.collection = current.table;
		gr.script = buildDeletionScript(current);
		gr.execute_function = true;
	}
	if (current.delete_business_rule.nil()) {
		gr.name = "Auto deletion rule for Assessments";
		gr.action_delete = true;
		gr.active = true;
		gr.when = "before";
		gr.script = buildDeletionScript(current);
		var br = gr.insert();
		current.delete_business_rule = br;
		return true;
	} else 
		gr.update();
	return false;
}

function buildScript(current) {
	var escapeCondition = current.condition.toString();
	escapeCondition = escapeCondition.replace(/[\'\"]/g, "\\'");
	var brCondition = "AssessmentUtils.conditionCheck(current, '" + escapeCondition + "')";
	var script = "function onAfter(current, previous) {\n var AssessmentUtils = new global.AssessmentUtils(); \n if (" + brCondition + ") { \n ";
	script += "    AssessmentUtils.checkRecord(current, '" + current.sys_id + "', true);\n";
	script += "}}";
	return script;
}

function buildDeletionScript(current) {
	var script = "function onBefore(current, previous) { \n";
	script += "   new global.AssessmentUtils().checkDeleteRecord(current, '" + current.sys_id + "', true);\n";
	script += "}";
	return script;

}

function isTableBlacklisted(table) {
	var isBlackListTable = false;
	var blackListTables = gs.getProperty("com.snc.assessment.tables.blacklist");
	if (!blackListTables) return false;
	blackListTables = blackListTables.toString().split(',');
	for (var i = 0; i < blackListTables.length; i++) {
		if (blackListTables[i] == table) return true;
	}
	return false;
}
