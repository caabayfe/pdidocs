// Workflow activity definition handler class
//
// Implement activity definition handling in the onExecute method
//
// Implement any event handlers for the activity definition as a method named 'on[event_name]'
//     For example, to handle the 'cancel' event, implement an 'onCancel' method
//

var TurnstileActivityHandler = Class.create();
TurnstileActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {

   initialize: function() {
   var schpdName = 'iterations_' + activity.activity.sys_id;
      WFActivityHandler.prototype.initialize.call(this);
      if (!workflow.scratchpad[schpdName]) {
         workflow.scratchpad[schpdName] = 1;
      }
   },

   onExecute: function() {
      // implement activity definition code here
      var schpdName = 'iterations_' + activity.activity.sys_id;

      var iterCountVar = parseInt(workflow.scratchpad[schpdName], 10);
      var iterAllowedVar = parseInt(activity.vars.iterations, 10);

      if (iterCountVar > iterAllowedVar) {
         //Youve iterated too many times...stop iterating
         activity.result = 'cancel';

      } else {
         //Still iterating
         iterCountVar ++;

         workflow.scratchpad[schpdName] = iterCountVar;

         activity.result = 'continue';
      }
   },

   type: 'TurnstileActivityHandler'
});
