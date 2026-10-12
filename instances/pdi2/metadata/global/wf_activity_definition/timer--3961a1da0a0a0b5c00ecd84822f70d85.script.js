/**
 * Timer Activity used to wait for some amount of time.  
 *  Takes into account the 'activity.scratchpad.timeLeft' (resuming after pause)
 */

var TimerActivityHandler = Class.create();
TimerActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {
   
    initialize: function() {
        WFActivityHandler.prototype.initialize.call(this);
        this._seconds = 0;
        this._now = new GlideDateTime();
    },
   
   onExecute: function() {
      var executeDateTime = this._now; // so that we can consistently calculate again, below
      activity.state = "waiting";

      // calculate our duration, from our (possibly) different "real" workflow base time rather than the current time
      // (a relative duration's start time is critical, for getting the correct duration)
      var timerStartTime = this._calcTimerStartTime(executeDateTime);
      var baseTime = this._calcDurationBaseTime(executeDateTime);
      var totalSecs = this._calcTotalDuration(baseTime);     // total (modified) duration time, not including any schedule
      var secs = this._seconds;                              // total (modified) duration time, within any schedule

      // now, although we have a "real" workflow start time to get the correct overall duration,
      // we actually need to consume that duration from the start time of this Timer
      var endTime = this._calcEndTime(timerStartTime, secs);
      var totalSecsLeft = this._getTotalSecsLeft();
      
      // set scheduled job (sys_trigger) to run at the end of the required timer duration
	   
	   if(totalSecsLeft === 0) {
		   // Refactored to return faster as we don't need to schedule anything here....
           this.onTimer();
		   return;
	   }
      var sched = this._getScheduleOnce(totalSecsLeft, endTime);
      sched.schedule();
   },
   
   onPause: function() {
      this.debug('Timer paused: ' + this._now);
      var pauseDateTime = this._now;
      var timerStartTime = this._calcTimerStartTime(pauseDateTime);
      
      // save for resume
      this._saveTimeLeft(timerStartTime); // store time remaining, (in schedule, if we have one)
      
      // cancel this timer so the schedule (trigger) item is no longer valid
      var s = new Schedule();
      s.setDocument(activity);
      s.setLabel(this._getLabel());
      s.cancel();
      // also consider that there may be a job pre upgrade
      s = new Schedule();
      s.setDocument(activity);
      s.setLabel(this._getLegacyLabel());
      s.cancel();
      this._saveEndTime();  // blank the end time
   },

   onResume: function() {
      this.debug('Timer resumed: ' + this._now);
      var resumeDateTime = this._now; // so that we can consistently calculate again, below

      // calculate our duration, from our (possibly) different "real" workflow start time rather than the current time
      // (a relative duration's start time is critical, for getting the correct duration)
      var timerStartTime = this._calcTimerStartTime(resumeDateTime);
      var baseTime = this._calcDurationBaseTime(resumeDateTime);
      var totalSecs = this._calcTotalDuration(baseTime);        // total duration time, not including any schedule
      var secs = this._seconds;                                 // total duration time, within any schedule

      var timeLeft = this._getTimeLeft(); // time that is remaining, within the schedule - value left over from ONPAUSE
      var timeUsed = (secs - timeLeft); // (time used within the schedule)

      // the Timer may have paused before it reached the real start time.
      // but the end time may be changed if we are resuming after the original real start time
      var start = resumeDateTime;
      if (resumeDateTime.compareTo(timerStartTime) < 0)
         start = timerStartTime;

      // we know how much time is left on the timer
      // - we need to add the time left onto the current time, or the (future) timer start time
      var endTime = this._calcEndTime(start, timeLeft);

	   if(timeLeft === 0) {
		   // Refactored to return faster as we don't need to schedule anything here....
           this.onTimer();
		   return;
	   }

      // create new scheduled job (trigger)
      var sch = this._getScheduleOnce(timeLeft, endTime);
      sch.schedule();
   },

   // Overridden by SLA Percentage Timer
   onTimer: function() {
      this.debug('Timer complete (endTime ' + activity.scratchpad.endTime + ') ' + this._getLabel());
      activity.state = 'finished';
      activity.result = 'complete';
   },

   onCancel: function() {
      var s = new Schedule();
      s.setDocument(activity);
      s.setLabel(this._getLabel());
      s.cancel();
      // also consider that there may be a job pre upgrade
      s = new Schedule();
      s.setDocument(activity);
      s.setLabel(this._getLegacyLabel());
      s.cancel();
      this.debug('Timer cancelled');
      activity.state = 'cancelled';
      activity.result = 'cancelled';
   },

// ---------- internal methods, below ----------

   _getScheduleOnce: function(secs, endTime) {
      // record when this activity is due to end
      this._saveEndTime(endTime);
      if (secs === 0) {
         this.onTimer();
         return;
      }
	   

	  var label = this._getLabel();
	  activity.scratchpad.label=label;

      var script = "var w = new Workflow(); w.fireEvent(current, 'timer');";
      var sched = new ScheduleOnce();
      sched.script = script;
      sched.setTime(endTime);
      sched.setDocument(activity);
      sched.setLabel(label);
	   if (this._runDuringUpgrade())
         sched.setUpgradeSafe(true);		  
      return sched;
   },

   _runDuringUpgrade: function() {
	   var rduVar = activity.vars.run_during_upgrade;
	   if (JSUtil.nil(rduVar) || rduVar.getValue()=="property") {
		   //activity var doesn't have a value (wf published before upgrade to version with the variable)
		   //or the var is set to None so the property is in charge
		   return GlideProperties.getBoolean('glide.workflow.timer.upgrade_safe', false);
	   } 
	   //else the activity var exists and should be in charge
	   return rduVar.getValue() == "always";
   },

   _getLabel: function() {
	   return "Workflow"+activity.context;
   },

   _getLegacyLabel: function() {
	   return "WFTimer"+activity.sys_id;
   },
      
   _getEndDate: function() {
      if (activity.scratchpad.endTime)
         return this._getEndTime();
      
      var sch = new GlideRecord('sys_trigger');
      sch.addQuery('document_key', activity.sys_id);
      sch.query();
      
      var endDate;
      if (sch.next()) {
         endDate = sch.next_action;
      }
      return endDate;
   },
   
   // Overridden by SLA Percentage Timer
   _getTotalSecsLeft: function() {
       return Math.max(0, this._totalSecs);
   },
   
   // store time remaining on the Timer
   _saveTimeLeft: function(starttime) {
      // (Relative Durations don't support pausing, so it doesn't matter
      //  that the start time is not "fixed" here)
      var now = this._now;
      if (starttime.compareTo(this._now) > 0)
         // start is in the future, so measure from there instead
         now = starttime;
      
      var totalTimeLeft = this._calcTotalTimeLeft(now, this._getEndDate());
      var timeLeft = this._remainingSecs;
      
      this.debug('_saveTimeLeft: ' + timeLeft);
      activity.scratchpad.timeLeft = timeLeft;
   },
   
   // get the stored time remaining for this Timer, on resume
   _getTimeLeft: function() {
      this.debug('_getTimeLeft: ' + activity.scratchpad.timeLeft);
      return parseInt(activity.scratchpad.timeLeft,10);
   },
   
   _saveEndTime: function(endtime) {
      var et = '';
      if (endtime)
         et = endtime.getValue();
      activity.scratchpad.endTime = et;
   },
   
   _getEndTime: function() {
      this.debug('_getEndTime (scratchpad)=' + activity.scratchpad.endTime);
      return new GlideDateTime(activity.scratchpad.endTime);
   },

   // deduce the "real" start time of the Timer
   // Overridden by SLA Percentage Timer
   _calcTimerStartTime: function(now) {
      var timerStartTime = new GlideDateTime(now);
      if (activity.scratchpad.timerStartTime) {
         timerStartTime = new GlideDateTime(activity.scratchpad.timerStartTime);
         this.debug('used timerStartTime ' + timerStartTime);
      }
      activity.scratchpad.timerStartTime = timerStartTime.getValue();
      this.debug('timerStartTime=' + timerStartTime);
      return timerStartTime;
   },
   
   // deduce the start time basis for the durations to be calculated
   // Overridden by SLA Percentage Timer
   _calcDurationBaseTime: function(now) {
       this.debug("now=" + now);
       var baseTime = new GlideDateTime(now);
       return baseTime;
   },

   // calculate the total time remaining
   // return total number of seconds, 
   // set this._remainingSecs, this._totalRemainingSecs
   _calcTotalTimeLeft: function(from, to) {
      var preWd = new WorkflowDuration();
      if (to.compareTo(from) < 0) {
         // from is in the future
         preWd.setStartDateTime(to);
         preWd.setEndDateTime(from);
      }
      else {
         preWd.setStartDateTime(from);
         preWd.setEndDateTime(to);
      }
      preWd.setWorkflow(context.schedule, context.timezone);
      preWd.setActivity(this);
      preWd.calculateTimeLeft(activity.vars.__var_record__);
      var totalRemainingSecs = preWd.getTotalSeconds();
      
      this._remainingSecs = preWd.getSeconds();
      this._totalRemainingSecs = preWd.getTotalSeconds();
      return totalRemainingSecs;
   },
   
   // add duration (within schedule) to start time
   // returns end time,
   // sets this._endTime, this._totalSecs
   _calcEndTime: function(start, duration) {
      var wd = new WorkflowDuration();
      wd.setStartDateTime(start);
      wd.setWorkflow(context.schedule, context.timezone);
      wd.setActivity(this);
      wd.addSeconds(activity.vars.__var_record__, duration);
      var totalSecs = wd.getTotalSeconds();
      var secs = duration;
      
      this._endTime = wd.getEndDateTime();
      this._totalSecs = totalSecs;
      return this._endTime;
   },
   
   // the whole duration of this Timer
   _calcTotalDuration: function(start) {
      var wd = new WorkflowDuration();
      wd.setStartDateTime(start);
      wd.setWorkflow(context.schedule, context.timezone);
      wd.setActivity(this);
      wd.calculate(activity.vars.__var_record__);
      var secs = wd.getSeconds();
      var totalSecs = wd.getTotalSeconds();
      
      this._seconds = secs;
      this._totalSeconds = totalSecs;
      this._endTime = wd.getEndDateTime();
      return totalSecs;
   },

   // for testing purposes only
   _setStartDateTime: function(start) {
      this.testing = true;
      this._now = start;
   },
   
   type: 'TimerActivityHandler'
});
