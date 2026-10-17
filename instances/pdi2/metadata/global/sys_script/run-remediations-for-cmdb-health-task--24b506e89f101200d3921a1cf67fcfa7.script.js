var remediations = SNC.RemediationUtil.getRemediationsForTask(current.sys_id, true);
for (var i = 0; i < remediations.length; i++) {
    var remed = remediations[i];

    var id = remed.sys_id;
    var name = remed.name;
    var workflow = remed.workflow;
    var wfName = remed.workflow_name;

    var cntx = new Workflow().startFlow(workflow, current, null, null);

    var msg = buildMessage(id, name, workflow, wfName, cntx);
    
	current.work_notes = msg;
    current.setWorkflow(false);
    current.update();
    current.setWorkflow(true);

}

function buildMessage(id, name, workflow, wfName, wfContext) {
    return 'Workflow \"' + wfName + '\" (' + workflow + ') started ' +
        'per remediation rule \"' + name + '\" (' + id + '). ';
    // 'Check Workflow Context ' + wfContext + 'for progress.';
}
