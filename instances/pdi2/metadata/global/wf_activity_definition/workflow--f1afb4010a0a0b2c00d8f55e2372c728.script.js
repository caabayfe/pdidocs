// Workflow activity definition handler class
//
// Implement activity definition handling in the onExecute method

// Implement any event handlers for the activity definition as a method named 'on[event_name]'
//     For example, to handle the 'cancel' event, implement an 'onCancel' method
//

var WorkflowActivityHandler = Class.create();
WorkflowActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {
   initialize: function() {
      WFActivityHandler.prototype.initialize.call(this);
   },
   
   onExecute: function() {
      // Start the subflow
      var subflow = workflow.startSubflow(this._getSubflowID(), current, this._getSubflowVariables(), activity.sys_id+'');
      if (!subflow) {
         activity.state = 'faulted';
         activity.fault_description = gs.getMessage('Subflow not found');
         activity.result = 'finished';
      } else {
         activity.scratchpad.subflowId = subflow.sys_id.toString();
         activity.state = 'waiting';         
      }
   },

   onCancel: function(eventName, eventParms) {
      activity.state = 'cancelled';
      activity.result = 'cancelled';

      // cancel the subflow
      if (!activity.scratchpad.subflowId)
         return;

      var gr = new GlideRecord('wf_context');
      if (gr.get(activity.scratchpad.subflowId))
         new Workflow().cancelContext(gr);
   },
   
   onListener: function(eventName, eventParms) {
      // workflow state changed - are we done?
      if (eventParms.isComplete) {
		 if(eventParms.status == 'faulted')
			 activity.state = eventParms.status;
		 else
			 activity.state = 'finished';
         activity.result = eventParms.result;
         if (!activity.result)
            activity.result = 'success';

         var returnVar = this._getMapTo();
         if (returnVar.startsWith("${") && returnVar.endsWith("}"))
             returnVar = returnVar.substring(2, returnVar.length - 1);

         if (returnVar.startsWith("workflow.scratchpad."))
             returnVar = returnVar.substring(20);

         if (!gs.nil(returnVar)) {
             workflow.scratchpad[returnVar] = eventParms.returnValue;
         }
      }
   },
   
   	_getMapTo: function() {
  		return new String(activity.vars.workflow_instance.return_map);
  	},
   
   
   	_getSubflowID: function() {
    	return activity.vars.workflow_instance.workflow.sys_id;
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
   
   type: 'WorkflowActivityHandler'
});
