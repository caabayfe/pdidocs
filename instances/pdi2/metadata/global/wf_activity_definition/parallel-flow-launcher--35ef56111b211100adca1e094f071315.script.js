// Launch multiple flows in parallel.
//
var Parallel_Flow_LauncherActivityHandler = Class.create();
Parallel_Flow_LauncherActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {

	initialize: function() {
		WFActivityHandler.prototype.initialize.call(this);
	},

	onExecute: function() {
		// If we were passed a workflow coordinator as inputs, then just use that.
		//
		var data = this.js(activity.vars.inputs+'');
		
	
		// If the user selects a workflow by reference, then use it
		// otherwise use by name-or-id
		//
		data = interpretInputs(this, data);
		if (data == null)
			return fault("Inputs must be a valid array");

		var coordinator = usingWorkflowByReference()
								? this._getCoordinatorByReference(data) 
								: this._getCoordinatorFromInput(data);

		setMaxValues(coordinator);
		
		// We require inputs in a WorkflowCoordinator object as the 'input' var 
		//
		// Alternatively if inputs is an array or a script function that generates 
		// an array or a workflow coordinator then that is used. 
		//
		if (coordinator == null) {
		    workflow.debug('Parallel_Flow_LauncherActivity: cound not create coordinator');
			return;
		}

		if (coordinator.getError() != '')
            return fault(coordinator.getError());

		// attempt to start first batch of 'poolsize' workflows
		var status = coordinator.start(activity);

		switch (status) {
				case 'finished':
					activity.state  = 'waiting';
					activity.result = 'finished';
					workflow.debug('last flow has completed');
					break;
			
				case 'continuing':
					activity.state  = 'waiting';
					activity.result = 'continue';
					workflow.debug('waiting for more flows to complete');
					break;
			
				case 'waiting':
					activity.state  = 'waiting';
					activity.result = 'continue';
					workflow.debug('waiting for more flows to complete');
					break;
			
				case 'error':
					workflow.fault(coordinator.getError());  //faulting sets the state and result
					break;

				default:
					activity.result = 'failure';
					activity.state = 'finished';
					workflow.debug('ERROR unexpected onFinish state:' + status);
					break;
		}

		
        function usingWorkflowByReference() {
			return !activity.vars.workflow_scripted;
	    }
		

		function interpretInputs(self, data) {

            var ary = data;

			// if its an array in string form parse and use it
			if (typeof(ary) == 'string') {
				data = data.trim();

                if (data.length == 0)
                    return [];

                try {
                    // try pure eval
                    ary = self.runScript(data);
                } catch (ex) {
                    // try decode
                    ary = new JSON().decode(data); // this.js(data);
                }

				//workflow.debug('vars.inputs is:' + JSUtil.describeObject(ary));
			}

			// Is it an array?  If so assume an array of inputs for the child
			// flows and the flow to run MUST be provided in the 'workflow'
			// input variable.
			if ( !(ary instanceof Array) ) {
			    // no good!
				this.setResultFailed('Inputs must be a valid array of inputs or a reference to one');
                return null;
            }

			return ary;
		}
		
		function setMaxValues(coordinator) {
			if (isNumber(activity.vars.max_flows))
				coordinator.setMax(activity.vars.max_flows);
			
			if (isNumber(activity.vars.max_simultaneous))
				coordinator.setPoolsize(activity.vars.max_simultaneous);
		}
		
		function isNumber(n) {
			return n && n.hasValue() && !isNaN(n+'');
		}

        function fault(msg) {
            workflow.error(msg);
			activity.fault_description = msg;
            activity.result = 'error';
            activity.state = 'faulted';
        }
	},

	onFinal: function(eventName, eventParms) {
		activity.state  = 'finished';
		activity.result = 'success';
		workflow.debug('onFinal() - All flows have completed');
	},
	
	onListener: function(eventName, eventParms) {
		workflow.debug('onListener eventName=' + eventName + ' - ' + JSUtil.describeObject(eventParms, 'eventParms'));
		
		// workflow state changed - are we done?
		if (eventParms.isComplete) {
			// workflow.debug('Loading WorkflowCoordinator for activity:' + activity.sys_id);
		
		    var coordinator = WorkflowCoordinator.load(activity.activity.sys_id+'');

			// Have the workflow coordinator process the results and return the status that determines
			// what do do next (wait, continut, finish).  
			//
			// Also puts the global variables 'flow' and 'coordinator' for the advanced scripts. These 
			// are available on the 'onFlowCompleted' path too.
			//
			var status = coordinator.onFinish(eventParms);
			
			switch (status) {
				
				case 'finished':
					activity.state  = 'waiting';   // run transitions
					activity.result = 'continue';
					workflow.debug('last flow has completed');

				    this._doFlowComplete(coordinator, 'flow',  eventParms.index);
				    this._doFlowComplete(coordinator, 'final', eventParms.index);
					
					// queue the exit event.
					new Workflow().fireEvent(activity, 'final'); 
					break;
			
				case 'continuing':
					activity.state  = 'waiting';    // run transitions
					activity.result = 'continue';
					workflow.debug('waiting for more flows to complete');
				    
					this._doFlowComplete(coordinator, 'flow', eventParms.index);
					break;
			
				case 'waiting':
					activity.state  = 'waiting';
					activity.result = 'continue';
					workflow.debug('waiting for more flows to complete');
					break;
			
				case 'error':
					activity.state  = 'finished';
					activity.result = 'failure';
					workflow.fault(coordinator.getError());
					break;
			
				default:
					activity.result = 'failure';
					activity.state = 'finished';
					workflow.debug('ERROR unexpected onFinish state:' + status);
					break;
			}
		}
	},
	
	onCancel: function(eventName, eventParms) {
		activity.state = 'cancelled';
		activity.result = 'cancelled';
		
		// cancel the subflows
		var coord = WorkflowCoordinator.load(activity.activity.sys_id + '');
		coord.cancel();
	},

	
	_doFlowComplete: function(coordinator, completion, index) {
		var completion_type = completion + '_completion';
		
		// is there a script?
		if (!activity.vars['use_' + completion_type + '_script'] )
			return true;
      
		var script = activity.vars[completion_type + '_script'];
		if (!script)
			return true;
		
		var result = this._runCompletionScript(coordinator, script, index);
		return result+'';
	},

	_runCompletionScript: function(coordinator, script, index) {
		if (!script)
			return null;

		return this.runScript(script);
	},
	
	_getCoordinatorByReference: function(data) {
		workflow.debug('_getCoordinatorByReference w='+ activity.vars.workflow);
		return new WorkflowCoordinator({
						workflow: activity.vars.workflow+'',
						  inputs: data,
						   owner: activity.workflow_version.workflow+'',
						   count: activity.vars.count+'',
			                 max: activity.vars.max_flows+'',
			            poolsize: activity.vars.max_simultaneous+''
				});
	},
	
	_getCoordinatorFromInput: function(data) {
		workflow.debug('_getCoordinatorFromInput w='+ activity.vars.workflowId);

        var wfs = (activity.vars.workflowId+'').trim();

        var wf = this.runScript(wfs);

		// If it is a global and already a WorkflowCoordinator just use it.
        if (wf instanceof WorkflowCoordinator)
            return wf;

        // If it is a scratchpad variable and a serialized WorkflowCoordinator, use that!
        if (workflow.scratchpad.coordinator && workflow.scratchpad.coordinator[wf])
            return WorkflowCoordinator.load(wf);

        // create a new one.
		return new WorkflowCoordinator({
					   workflow: wf,
						 inputs: data,
						  owner: activity.workflow_version.workflow+'',
						  count: activity.vars.count+'',
			                max: activity.vars.max_flows+'',
			           poolsize: activity.vars.max_simultaneous+''
				});
	},

	
   type: 'Parallel_Flow_LauncherActivityHandler'
});
