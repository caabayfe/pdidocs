// Wait for all predecessor activities to complete before we continue

var JoinActivityHandler = Class.create();
JoinActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {
   
   initialize: function() {
      WFActivityHandler.prototype.initialize.call(this);
   },
   
   onExecute: function() {
      this._getTransitionsToMe();
      this._determineJoinActivity();
   },
   
   onCancel: function(eventName) {
      // We need an onCancel here so that our onOtherEvent does not run and reset our cancelled state
      activity.state = 'cancelled';
      activity.result = 'cancelled';
   },
   
   onActivityComplete: function() {
      this._checkComplete();
   },
   
   onOtherEvent: function() {
      this._determineJoinActivity();
   },
   
   // See if there is already a Join activity running that we should let handle things
   // If not, then set ourselves up to handle the Join
   _determineJoinActivity: function() {

      var gr = new GlideRecord('wf_executing');
      gr.addQuery('activity', activity.activity);
      gr.addQuery('context', activity.context);
      gr.addQuery('sys_id', '!=', activity.sys_id);
      gr.query();
      if (gr.next()) {
         // there is one - use it (deleting this activity will generate an activityComplete event to the real Join activity)
         activity.state = 'delete';
      } else {
         // we are the one - check to see if we are complete before returning
         if (!this._checkComplete()) {
            // set to waiting state and indicate that we want to be notified of activity completions
            activity.state = 'waiting';
            activity.notify_termination = true;
         }
      }
   },
   
   // See if any predecessor activites are active - if any are active, we have to wait on it
   _checkComplete: function() {
      var ids = workflow.getPredecessors();
      ids.add(activity.activity.sys_id);   // check for a transition to us, but with a 'new' join that will be deleted in _checkComplete when it runs
 
      var gr = new GlideRecord('wf_executing');
      gr.addQuery('context', activity.context);
      gr.addQuery('activity', ids);
      gr.addQuery('sys_id', '!=', activity.sys_id);  // skip me!
      gr.query();
      if (gr.hasNext()) {
         return false;
      }

      activity.state = 'finished';
      this._setResult();
      return true;
   },
   
   _getTransitionsToMe: function() {
      var transIds = [];
      var transGR = new GlideRecord('wf_transition');
      transGR.addQuery('to', activity.activity.sys_id);
      transGR.query();
      while (transGR.next())
         transIds.push(transGR.sys_id.toString());

      activity.scratchpad.transIds = transIds;
   },
   
   // Determine if all predecessor activities transitioned to us (complete) or not (incomplete)
   _setResult: function() {
      var transIds = activity.scratchpad.transIds;
      var transToMe = transIds.length;
      
      // now see who transitioned to us
      var transTaken = 0;
      var transTakenIds = {};
      transGR = new GlideRecord('wf_transition_history');
      transGR.addQuery('context', activity.context);
      transGR.addQuery('transition', transIds);
      transGR.addQuery('rolled_back', 'false');
      transGR.query();
      while (transGR.next()) {
         var id = transGR.sys_id.toString();
         if (!transTakenIds[id]) {
            transTakenIds[id] = true;
            transTaken++;
         }
      }

      if (transTaken >= transToMe)
         activity.result = "complete";
      else
         activity.result = "incomplete";
   },
   
   type: 'JoinActivityHandler'
});
