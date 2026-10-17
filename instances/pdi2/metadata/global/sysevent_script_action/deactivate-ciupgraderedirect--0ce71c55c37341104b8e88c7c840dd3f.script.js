var processorSysId = '2dea64a1c3a301104b8e88c7c840ddf8';

var before = gs.getSession().getWorkflow();
gs.getSession().setWorkflow(false);

var gr = new GlideRecord('sys_processor');
if (gr.get('2dea64a1c3a301104b8e88c7c840ddf8')) {
    gr.setValue('active', false);
    gr.update();
}

gs.getSession().setWorkflow(before);
