function validateWorkflow() {
    var gdw = new GlidePaneForm("Workflow Validation Report", "validate_workflow");
	var id = $F('sys_uniqueValue');
    gdw.addParm("sysparm_sys_id", id);
    gdw.render();
}
