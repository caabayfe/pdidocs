// Workflow activity definition handler class
//
// Implement activity definition handling in the onExecute method
//
// Implement any event handlers for the activity definition as a method named 'on[event_name]'
//     For example, to handle the 'cancel' event, implement an 'onCancel' method
//

var IfActivityHandler = Class.create();
IfActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {
   
   initialize: function() {
      WFActivityHandler.prototype.initialize.call(this);
   },
   
   onExecute: function() {
      if (this._checkQueryCondition() && this._checkScriptCondition())
         activity.result = 'yes';
      else
         activity.result = 'no';
   },
   
   // Filter condition matching
   _checkQueryCondition: function() {
      try {
         // is there a filter to match?
         var condition = activity.vars.condition + '';
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
      if (!activity.vars.advanced)
         return true;
      
      var script = activity.vars.script + '';
      if (!script)
         return true;

      var answer = this.runScript(script);
      return ((answer === true) || (answer === 'yes'));
   },
   
   type: 'IfActivityHandler'
});
