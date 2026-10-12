//Workflowactivitydefinitionhandler class
//
// Implement activity definition handling in the onExecute method
//
// Implement any event handlers for the activity definition as a method named 'on[event_name]'
//     For example, to handle the 'cancel' event, implement an 'onCancel' method
//


var UnlockActivityHandler = Class.create();
UnlockActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {

   initialize: function() {
      WFActivityHandler.prototype.initialize.call(this);
   },

   onExecute: function() {

      var key = this.js(activity.vars.key).toString();     
      var lock = new GlideLock(key);
      lock.release();

   },

   type: 'LockActivityHandler'
});
