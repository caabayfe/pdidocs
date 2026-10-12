(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var tableName = 'diagnostics_result';
	var fieldName = 'score';

	var green = current.green_threshold;
	var yellow = current.yellow_threshold;
	var red = current.red_threshold;

	createUIStyle(current.sys_id, 'current.score >= ' + green + ' && current.score < ' + yellow, '#71e279');
	createUIStyle(current.sys_id, 'current.score >= ' + yellow + ' && current.score < ' + red, '#ffe366');
	createUIStyle(current.sys_id, 'current.score >= ' + red, '#ff7b65');

	function createUIStyle(applicationSysId, condition, color) {
		var value = "javascript:current.application == '" + applicationSysId + "' && " + condition;
		var style = "background-color:" + color;

		var gr = new GlideRecord('sys_ui_style');
		gr.addQuery('name', tableName);
		gr.addQuery('element', fieldName);
		gr.addQuery('value', 'CONTAINS', applicationSysId);
		gr.addQuery('style', 'CONTAINS', color);
		gr.query();

		var recordExists = gr.next();

		if (!recordExists) {
			gr.name = tableName;
			gr.element = fieldName;
		}
		gr.value = value;
		gr.style = style;

		if (recordExists)
			gr.update();
		else
			gr.insert();
	}

})(current, previous);
