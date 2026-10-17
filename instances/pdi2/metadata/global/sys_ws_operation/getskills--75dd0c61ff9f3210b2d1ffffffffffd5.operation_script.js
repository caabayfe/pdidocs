(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var workflowMap = {};   // Groups skills by workflow

    // Query active skill configurations
    var configGr = new GlideRecord("sn_nowassist_skill_config");
	if (!configGr.isValid()) {
		response.setBody({
			"error": "Now Assist Skill Config Table does not exist"
		});
		
		return;
	}
    configGr.addQuery("skill_table", "sys_one_extend_capability");
    configGr.orderBy("name");        
    configGr.query();

    while (configGr.next()) {
        var skillConfigId = configGr.getValue("sys_id");

        // Check if this skill is active
        var isActive = new sn_nowassist_admin.NowAssistSkillConfig().isSkillConfigurationActive(skillConfigId) || false;

        if (isActive) {
            // === Get workflow info (parent of skill_family) ===
            var workflowId   = configGr.skill_family.parent + "" || configGr.skill_family + "";
            var workflowName = configGr.skill_family.parent.name + "" || configGr.getDisplayValue("skill_family");

            // Create workflow group if it doesn't exist yet
            if (!workflowMap[workflowId]) {
                workflowMap[workflowId] = {
                    workflow_id:   workflowId,
                    workflow_name: workflowName,
                    skills: []                    // ← skills array starts here
                };
            }

            // Add this skill to the workflow
            workflowMap[workflowId].skills.push({
                label:       configGr.getValue("name") || "(No Name)",
                skill_Id:    skillConfigId,
                family_id:   configGr.getValue("skill_family"),
                family_name: configGr.getDisplayValue("skill_family"),
                description: configGr.getValue("description") || ""
            });
        }
    }

    // Convert map to array + sort everything nicely
    var data = [];
    for (var key in workflowMap) {
        // Sort skills inside each workflow alphabetically
        workflowMap[key].skills.sort(function(a, b) {
            return a.label.localeCompare(b.label);
        });
        data.push(workflowMap[key]);
    }

    // Sort workflows alphabetically
    data.sort(function(a, b) {
        return a.workflow_name.localeCompare(b.workflow_name);
    });

    // === SEND RESPONSE ===
    response.setStatus(200);
    response.setBody({
        "data": data
    });

})(request, response);
