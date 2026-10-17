// Run Workflow activity definition handler class 
workflow.includeActivityDefinition("Workflow");

var Run_WorkflowActivityHandler = Class.create();
Run_WorkflowActivityHandler.prototype = Object.extendsObject(WorkflowActivityHandler, {
    initialize: function() {
       WorkflowActivityHandler.prototype.initialize.call(this);
    },

    onExecute: function() {
        // Start the subflow
        var wfSysId, subflow;
        var workflowHelper = new Workflow();

        if (activity.vars.advanced && activity.vars.advanced_script) {
            try {
				var ans = this.runScript(activity.vars.advanced_script);
			} catch (ex) {
                this._setError(gs.getMessage('Return value "answer" not set correctly'));
				throw ex;  // propagate exception up to WorkflowScopedScriptRunner
			}
            if (!ans.workflow) {
                this._setError(gs.getMessage('Return value "answer" not set correctly'));
                return;
            }
            wfSysId = workflowHelper.getWorkflowFromName(ans.workflow);
            if (!wfSysId) {
                this._setError(gs.getMessage("Can't find workflow '" + ans.workflow + "'"));
                return;
            }
            subflow = workflow.startSubflow(wfSysId, current, ans.inputs, activity.sys_id+'');

        } else {
            // process subflows based on condition matrix
            this._setError(gs.getMessage("Non-advanced launching of workflow not implemented yet."));
            return;
        }
      
      
        if (!subflow) {
            this._setError(gs.getMessage('Subflow did not launch (wf_workflow.sys_id=' + wfSysId + ')'));
        } else {
            activity.scratchpad.subflowId = subflow.sys_id.toString();
            activity.state = 'waiting';
        }
    },

  	_getMapTo: function() {
  		return new String(activity.vars.return_value);
  	},
   
   _getSubflowVariables: function() {
       var vars = {};

       var wfi = activity.vars.workflow_instance;
       var varNames = wfi.workflow.vars.getVariableNames();

       for(var i = 0; i < varNames.length; i++) {
           var name = varNames[i];
           var value = wfi.workflow.vars.getVariableValue(name);
           value = this.js(value);
           vars[name] = value;
       }

       return vars;
   },
   
    _setError: function(reason) {
       workflow.error(reason);
       activity.state = 'faulted';
       activity.fault_description = reason;
       activity.result = 'finished';

    },

    type: 'Run_WorkflowActivityHandler'
});
