// Service APIs must be defined in the "Services" namespace - leave the "Services." prefix on the class name and prototype

Services.Workflow = Class.create();
Services.Workflow.prototype = {
    initialize: function() {
        // Place any Service API initialization code here - runs each time an API is called on this Service

    },
        
    /**
     * lookup a Workflow ViewModel
     *
     * @param parms - object
     *			.workflow - name or sys_id of the workflow to lookup
     * @returns a workflow ViewModel
     */
    get: function(parms) {
    	var wf = {
    		name: null,
    		sys_id: null,
    		description: null,
			ui: null
    	};
		var gr = new GlideRecord('wf_workflow_version');
		gr.query(parms.workflow);
		if (!gr.hasNext()) {
			gr.query('name', parms.workflow);
		}
		if (gr.next()) {
			wf.sys_id = gr.getValue('sys_id');
			wf.name = gr.getValue('name');
			wf.description = gr.getValue('description');
		}
		this.data.workflow = wf;
	},
	
	/**
     * start a Workflow
     *
     * @param parms - object
     *			.workflow - name or sys_id of the workflow to start
     *
     */
	start: function(parms) {
		var context = new WorkflowChooser().runWorkflowForName(parms.workflow, null, {});
		this.data.workflow = {
			sys_id : context.workflow.sys_id.toString(),
			name : context.workflow.name.toString(),
			description: context.workflow.description.toString()
		}
		this.data.context = {
			sys_id : context.sys_id.toString(),
			started: context.started.toString(),
			stage: context.stage.getDisplayValue(),
			activity_index: new String(context.activity_index)
		}
	},
	
	submitUI: function(parms) {
		var activity = new GlideRecord('wf_executing');
		activity.get(parms.executing);
		//TODO: put in some error handling, this could hang workflows if it goes wrong
		activity.scratchpad = parms.model;
		activity.update();
		new Workflow().fireEvent(activity,'submit');
	},

    type: 'Workflow'
}
