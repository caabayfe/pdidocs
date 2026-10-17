var gr = new GlideRecord('wf_activity');
gr.workflow_version = current.workflow_version;

var actDefGR = getWorkflowActivity();

gr.activity_definition = actDefGR.sys_id;
gr.name = current.workflow.name;
gr.vars.workflow_instance = current.sys_id;

var activityId = gr.insert();

current.activity = activityId;

function getWorkflowActivity() {
    var grwfa = new GlideRecord('wf_activity_definition');
    grwfa.addQuery('name', 'Workflow');
    grwfa.query();
    grwfa.next();
    return grwfa;
}
