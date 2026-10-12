// Workflow activity definition handler class
//
// Implement activity definition handling in the onExecute method

// Implement any event handlers for the activity definition as a method named 'on[event_name]'
//     For example, to handle the 'cancel' event, implement an 'onCancel' method
//

var Wait_for_conditionActivityHandler = Class.create();
Wait_for_conditionActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {
   
   initialize: function() {
      WFActivityHandler.prototype.initialize.call(this);
   },
   
   onExecute: function() {
      // stay waiting until true or fault
      activity.state = "waiting";
      this.onUpdate();
   },
   
   onUpdate: function() {
      if (this._checkQueryCondition() && this._checkScriptCondition())
         activity.state = "finished";
   },
   
   // Filter condition matching
   _checkQueryCondition: function() {
      try {
         // is there a filter to match?
         var condition = activity.vars.wait_for_condition + '';
         if (!condition)
            return true;
         
         var match = GlideFilter.checkRecord(current, condition);
         return match === true;
         
      } catch (ex) {
         this.error(ex);
         activity.state = "faulted";
      }
      return false;
   },
   
   // Script condition matching
   _checkScriptCondition: function() {
      // is there a script?
      var condition = activity.vars.script_condition + '';
      if (!condition)
         return true;
      
      var answer = this.runScript(condition);
      return (answer === true);
   },
   
   type: 'Wait_for_conditionActivityHandler'
});
