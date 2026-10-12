// Workflow activity definition handler class
//
// Implement activity definition handling in the onExecute method
//
// Implement any event handlers for the activity definition as a method named 'on[event_name]'
//     For example, to handle the 'cancel' event, implement an 'onCancel' method
//

var NotificationActivityHandler = Class.create();
NotificationActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {
   
   initialize: function() {
      WFActivityHandler.prototype.initialize.call(this);
   },
   
   onExecute: function() {
      var to = this._getToIds();
      gs.eventQueue("workflow.notification", current, activity.activity + "," + activity.context, to.join(','));
   },
   
   _getToIds: function() {
      return this._getIds(activity.vars.email_to, activity.vars.email_to_group, activity.vars.email_to_script);
   },
   
   _getIds: function(users, groups, script) {
      var users = users + '';
      var groups = groups + '';
      var script = script + '';
      var ids = {};
      
      // users
      if (users) {
         var users = (users + "").split(',');
         for (var i = 0; i < users.length; i++)
            ids[users[i]] = true;
      }
      
      // groups
      if (groups) {
         var groups = (groups + "").split(',');
         for (var i = 0; i < groups.length; i++)
            ids[groups[i]] = true;
      }
      
      // is there a script?
      this._addScriptedUsers(ids);
      
      // return an array
      var ret = [];
      for (var id in ids)
         ret.push(id);
      
      return ret;
   },
   
   _addScriptedUsers: function(ids) {
      if (!activity.vars.advanced)
         return;
      
      var script = activity.vars.email_to_script + '';
      if (!script)
         return;
      
      var answer = this.runScript(script);
      if (answer) {
      	 answer = answer.toString();
         var users = answer.split(',');
         for (var i = 0; i < users.length; i++)
            ids[users[i]] = true;
      }
   },
   
   type: 'NotificationActivityHandler'
});
