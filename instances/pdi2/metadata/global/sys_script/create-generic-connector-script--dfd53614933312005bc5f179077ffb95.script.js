(function executeRule(current, previous /*null when async*/) {

	var gr  = new GlideRecord("ecc_agent_script_include");
	gr.get("sys_id", "4d34b214933312005bc5f179077ffb79");
	var script = "";
	if (gr.isValid())
		script = gr.getValue("script");
	
	gr.initialize();
	var scriptName = current.name;
	scriptName = scriptName.replace(/[^a-zA-Z0-9]/g, '');
	scriptName = scriptName + "_JS";
	gr.setValue("name", scriptName);
	script = script.replaceAll('ConnectorJS', scriptName);
	gr.setValue("script", script);
	var id = gr.insert();
		
	current.javascript_to_run = id;
	current.update();

})(current, previous);
