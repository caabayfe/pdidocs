// Workflow activity definition handler class
//
// Implement activity definition handling in the onExecute method
//
// Implement any event handlers for the activity definition as a method named 'on[event_name]'
//     For example, to handle the 'cancel' event, implement an 'onCancel' method
//


var LockActivityHandler = Class.create();
LockActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {
   
   initialize: function() {
      WFActivityHandler.prototype.initialize.call(this);

      activity.scratchpad.key          = this.js(activity.vars.key).toString();
      var expiration   = activity.vars.expiration.getGlideObject().getNumericValue() / 1000; // ms -> s
      this.lock        = new GlideLock(activity.scratchpad.key, expiration, 1);
      activity.scratchpad.numTries = activity.scratchpad.numTries!==undefined?activity.scratchpad.numTries:activity.vars.try_count;
   },
   
   onExecute:function() {
   	this.onLock();
   },
   
   onLock:function() {
      if (this._getLock()) {
         activity.state = 'finished';
         activity.result = 'success';
         return;
      } else if (activity.scratchpad.numTries > 0) {
         activity.state = 'waiting';
      	 this._wait();			 
      } else {
         activity.state = 'timeout';
         activity.result = 'failed';
         return;
         
      }     
   },
   
   _wait: function() {
      var sched = new ScheduleOnce();
      sched.script = "var w = new Workflow(); w.fireEventById('" + activity.sys_id + "', 'lock');";
      sched.setAsSeconds(activity.vars.wait_duration.getGlideObject().getNumericValue() / 1000); // ms -> s
      sched.setDocument(activity);
      sched.setLabel("Lock" + activity.sys_id);
      sched.schedule();
   },
   
   _getLock: function() {
      activity.scratchpad.numTries--;
      return this.lock.get();
      
   },
   
   type: 'LockActivityHandler'
});
