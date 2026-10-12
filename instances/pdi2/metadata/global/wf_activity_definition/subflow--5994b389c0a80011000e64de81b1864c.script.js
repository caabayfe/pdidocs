// Workflow activity definition handler class
//
// Implement activity definition handling in the onExecute method

// Implement any event handlers for the activity definition as a method named 'on[event_name]'
//     For example, to handle the 'cancel' event, implement an 'onCancel' method
//

var SubflowActivityHandler = Class.create();
SubflowActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {
   
   initialize: function() {
      WFActivityHandler.prototype.initialize.call(this);
   },
   
   onExecute: function() {
      // Start the subflow
      var id = this._getSubflowID();
      var subflow = workflow.startSubflow(id, current);
      if (!subflow) {
         activity.state = 'faulted';
         activity.fault_description = gs.getMessage('Subflow not found');
         activity.result = 'finished';
      } else {
         // register a listener to wait on the subflow
         workflow.registerListener(subflow, 'state');
         activity.scratchpad.subflowId = subflow.sys_id.toString();
         activity.state = 'waiting';
         
         if (activity.vars.script) {
            // put the subflow into the global context so it can be referenced
            // by the preprocessing script used to set subflow scratchpad variables
            workflow.setVariable('subflow', subflow);
            workflow.eval(activity.vars.script);
            subflow.update();
         }
      }
   },
   
   onCancel: function() {
      activity.state = 'cancelled';
      activity.result = 'cancelled';

      // cancel the subflow
      if (!activity.scratchpad.subflowId)
         return;

      var gr = new GlideRecord('wf_context');
      if (gr.get(activity.scratchpad.subflowId))
         new Workflow().cancelContext(gr);
   },

   onListener: function() {
      // workflow state changed - are we done?
      if (workflow.isComplete(listenedTo)) {
         activity.state = 'finished';
         activity.result = listenedTo.result;
         if (!activity.result)
            activity.result = 'success';
            
         // run the post processing script
         if (activity.vars.script_post) {
            workflow.setVariable('subflow', listenedTo);
            workflow.eval(activity.vars.script_post);
         }
      }
   },
   
   _getSubflowID: function() {
      return activity.vars.workflow.toString();
   },
   
   type: 'SubflowActivityHandler'
});
