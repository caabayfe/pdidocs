// Workflow activity definition handler class
//
// Implement activity definition handling in the onExecute method
//
// Implement any event handlers for the activity definition as a method named 'on[event_name]'
//     For example, to handle the 'cancel' event, implement an 'onCancel' method
//

var Set_ValuesActivityHandler = Class.create();
Set_ValuesActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {

   initialize: function() {
      WFActivityHandler.prototype.initialize.call(this);
   },

   onExecute: function() {
      var values = this.js(activity.vars.values + '');
      if (values)
         current.applyEncodedQuery(values);      
   },

   type: 'Set_ValuesActivityHandler'
});
