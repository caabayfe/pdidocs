(function() {
    var wfGR = new GlideRecord('wf_workflow');
    var isWorkflowExists = wfGR.get('7acb0a6e9fa022008780bde8132e7084');
    // Step 1: Check if the customer has customized the workflow
    var workflowGr = new GlideRecord('wf_workflow_version');
    workflowGr.addEncodedQuery('active=true^published=true');
    var workflowVersionId = '36fb000c73331300d406168d4ef6a74c';
    workflowGr.addQuery('sys_id', workflowVersionId);
    workflowGr.query();
    var workflowCustomized = (workflowGr.getRowCount() == 0);

    // Step 2: If the workflow exists and has not been customized, disable the workflow and leave the flow
    if (isWorkflowExists && !workflowCustomized) {
        while (workflowGr.next()) {
            workflowGr.active = false;
            workflowGr.update();
            gs.info("Workflow version disabled: " + workflowGr.sys_id);
        }
        gs.info("Workflow has not been customized. Flow remains active.");
    } else if (isWorkflowExists && workflowCustomized) {
        // Step 3: If the workflow exits and has been customized, disable the flow and leave the workflow
        var flowGr = new GlideRecord('sys_hub_flow');
        var hubFlowId = '9a2888e043f81a1097aac6ecbab8f236';
        flowGr.get(hubFlowId);
        if (flowGr.isValidRecord()) {
            flowGr.active = false;
            flowGr.update();
            gs.info("Flow disabled: " + flowGr.sys_id);
        }
        gs.info("Workflow has been customized. Workflow remains active.");
    }
})();
