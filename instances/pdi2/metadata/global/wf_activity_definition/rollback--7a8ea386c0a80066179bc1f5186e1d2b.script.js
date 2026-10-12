var RollbackActivityHandler = Class.create();
RollbackActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {

    initialize: function() {
        WFActivityHandler.prototype.initialize.call(this);
    },
    
    onExecute: function() {
        // Get the activities the rollback will transition to
        var ids = workflow.toActivities();
        this._getTransitionHistory();
        
        // Walk from the rollback points, cancelling any executing activities and resetting any approvals/tasks
        this.activityIds = [];
        this.visited = {};
        this.visited[activity.activity.sys_id.toString()] = true;
        if (previous_activity && previous_activity.activity.sys_id)
           this.activityIds.push(previous_activity.activity.sys_id + '');

        // set any rollback comment
        if (activity.vars.comment_field && activity.vars.comment) 
            current.getElement(activity.vars.comment_field.toString()).setDisplayValue(activity.vars.comment.toString());
        
        for (var i = 0; i < ids.size(); i++) 
            this._processActivity(ids.get(i));
        
        // now get any child activities in our list
        this._getChildren();
        // this just cancels Timers for now, easy to add other jobs, 
        this._cancelJobs();
        this._cancelExecuting();
        this._restartHistory();
        this._resetApprovalsAndTasks();
		
		// signal engine that roll-back finished.
		workflow.onRollbackComplete(activity);
    },
    
    _getTransitionHistory: function() {
        this.transitions = {};
        var gr = new GlideRecord('wf_transition_history');
        gr.addQuery('context', activity.context);
		gr.addQuery('rolled_back', false);
        gr.query();
        while (gr.next()) {
            var from = gr.transition.from.toString();
            var to = gr.transition.to.toString();
            if (!this.transitions[from]) 
                this.transitions[from] = [];
            
            this.transitions[from].push(to);
			gr.setValue('rolled_back', true);
			gr.update();
        }
    },
    
    _processActivity: function(id) {
        if (this.visited[id]) 
            return;
        
        this.visited[id] = true;
        this.activityIds.push(id);
        // follow the transitions
        if (!this.transitions[id]) 
            return;
        
        for (var i = 0; i < this.transitions[id].length; i++) 
            this._processActivity(this.transitions[id][i]);
    },
    
    _getChildren: function() {
        if (this.activityIds.length == 0) 
            return;
        
        // load up any child activities and associated them with their parent
        var gr = new GlideRecord('wf_activity');
        gr.addQuery('workflow_version', activity.workflow_version);
        gr.addQuery('parent', "IN", this.activityIds);
        gr.query();
        while (gr.next()) 
            this.activityIds.push(gr.sys_id.toString())
    },
    
    _cancelExecuting: function() {
        if (this.activityIds.length == 0) 
            return;
        
        var gr = new GlideRecord('wf_executing');
        gr.addQuery('context', activity.context);
        gr.addQuery('sys_id', '!=', activity.sys_id); // don't delete the rollback activity we are executing
        gr.addQuery('activity', "IN", this.activityIds);
        gr.deleteMultiple();
    },

    _cancelJobs: function() {
        if (this.activityIds.length == 0) 
            return;

        var jobNames = [];
        jobNames.push('Timer');
        var gr = new GlideRecord('wf_executing');
        gr.addQuery('context', activity.context);
        gr.addQuery('sys_id', '!=', activity.sys_id); // don't delete the rollback activity we are executing
        gr.addQuery('activity', "IN", this.activityIds);
        gr.addQuery('activity.activity_definition.name', "IN", jobNames);
        gr.query();
      
        while (gr.next()) {
          // cancel this timer so the schedule (trigger) item is no longer valid
          var s = new Schedule();
          s.setDocument(gr);
          s.setLabel("Workflow" + activity.context_id);
          s.cancel();
        }
    },
    
    _restartHistory: function() {
        if (this.activityIds.length == 0) 
            return;
        
        var mu = new GlideMultipleUpdate('wf_history');
        mu.addQuery('context', activity.context);
        mu.addQuery('activity', "IN", this.activityIds);
        mu.setValue('state', 'restart');
        mu.execute();
    },
    
    _resetApprovalsAndTasks: function() {
        if (this.activityIds.length == 0) 
            return;
        
        var gr = new GlideRecord('sysapproval_group');
        gr.addQuery('parent', current.sys_id);
        gr.addQuery('wf_activity', "IN", this.activityIds);
        gr.addQuery('approval', '!=', 'not requested');
        gr.query();
        while (gr.next()) {
            gr.setValue('approval', 'not requested');
            gr.update();
        }
        
        var mu = new GlideMultipleUpdate('sysapproval_approver');
        mu.addQuery('sysapproval', current.sys_id);
        mu.addQuery('wf_activity', "IN", this.activityIds);
        mu.addQuery('state', '!=', 'not requested');
        mu.setValue('state', 'not requested');
        mu.execute();
        
        mu = new GlideMultipleUpdate('task');
        mu.addQuery('parent', current.sys_id);
        mu.addQuery('wf_activity', "IN", this.activityIds);
        mu.addQuery('state', '!=', '-5');
        mu.setValue('state', '-5');
        mu.setValue('work_end', '');
        mu.setValue('active', 'true');
        mu.execute();
    },
    
    _getName: function(id) {
        var gr = new GlideRecord('wf_activity');
        if (gr.get(id)) 
            return gr.name.toString();
        
        return id;
    },
    
    type: 'RollbackActivityHandler'
});
