current.name = current.workflow_version.name;
current.started_by.setValue(gs.userID());

if (gs.nil(current.id)) {
    var gr = new GlideRecord('wf_workflow_execution');
    gr.name = current.name;
    gr.insert();

    current.table = 'wf_workflow_execution';
    current.id = gr.sys_id;
}
