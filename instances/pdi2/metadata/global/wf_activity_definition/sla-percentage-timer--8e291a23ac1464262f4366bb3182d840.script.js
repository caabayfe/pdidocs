/**
 * SLA Percent Timer Activity used to wait for some percentage amount of SLA time. Takes into account
 * 'workflow.scratchpad.retroactiveSecsLeft' for a "retroactive", or delayed, start.
 */

workflow.includeActivityDefinition("Timer");
var SLA_Percentage_TimerActivityHandler = Class.create();
SLA_Percentage_TimerActivityHandler.prototype = Object.extendsObject(TimerActivityHandler, {
	RESULT_NORMAL: 'normal',
	RESULT_REPAIR: 'repair',
	STATE_FINISHED: 'finished',

	initialize: function() {
		TimerActivityHandler.prototype.initialize.call(this);

		// remove any milliseconds from now time as granularity of all computation is seconds
		this._now = new GlideDateTime(this._now.getValue());

		// if the scratchpad already contains a JSON string with the SLA Definition field values use it
		if (!workflow.scratchpad.sla && workflow.scratchpad.slaDataJSON)
			workflow.scratchpad.sla = JSON.parse(workflow.scratchpad.slaDataJSON);

		if (!workflow.scratchpad.hasOwnProperty("timezoneForSchedule"))
			workflow.scratchpad.timezoneForSchedule = new SLAUtil().getTimezone(current);

		if (!workflow.scratchpad.repairedTaskSLA && workflow.scratchpad.repairedTaskSLADataJSON)
			workflow.scratchpad.repairedTaskSLA = JSON.parse(workflow.scratchpad.repairedTaskSLADataJSON);

		this.slaDefGr = this._getSLADefinition();
		if (!workflow.scratchpad.sla)
			this._populateScratchpad();

		if (workflow.scratchpad.sla.duration_type) {
			activity.vars.timer_type = 'relative_duration';
			activity.vars.relative_duration = workflow.scratchpad.sla.duration_type;
		} else {
			activity.vars.timer_type = 'duration';
			activity.vars.field = String(workflow.scratchpad.sla.duration / 1000);
		}

		activity.vars.modifier = 'percentage';
		activity.vars.timezone_type = 'user_specified_timezone';
		activity.vars.schedule_field = 'schedule';
		activity.vars.user_specified_timezone = workflow.scratchpad.timezoneForSchedule;
		activity.vars.schedule_type = 'from_field_schedule';

		if (!workflow.scratchpad.repairMode)
			workflow.scratchpad.repairMode = workflow.inputs.sla_repair_mode + '';

		// Need to check for the string 'undefined' too as that's what will get assigned with "workflow.inputs.sla_repair_mode + '';"
		// when workflow.inputs.sla_repair_mode does not exist
		if ((typeof workflow.scratchpad.repairMode === "undefined") || workflow.scratchpad.repairMode === "undefined")
			workflow.scratchpad.repairMode = workflow.inputs.u_sla_repair_mode + '';

		// If workflow is missing sla_repair_mode and u_sla_repair_mode inputs get the default value from the scratchpad
		if ((typeof workflow.scratchpad.repairMode === "undefined") || workflow.scratchpad.repairMode === "undefined")
			workflow.scratchpad.repairMode = workflow.scratchpad.sla_repair_mode_default + '';
	},

	// @Override
	onExecute: function () {
        /* if we're not repairing or we are repairing but the scratchpad doesn't contain the data we need
           then call the standard onExecute function for a Timer */
		if ("" + workflow.scratchpad.repairMode !== "true" || !workflow.scratchpad.hasOwnProperty("repairedTaskSLA") ||
			!workflow.scratchpad.repairedTaskSLA.startTime || !workflow.scratchpad.repairedTaskSLA.businessElapsed) {
			TimerActivityHandler.prototype.onExecute.call(this);
			return;
		}

		activity.state = "waiting";
		var startTime = new GlideDateTime(workflow.scratchpad.repairedTaskSLA.startTime);
		var totalSecs = this._calcTotalDuration(startTime); // total duration time, not including any schedule
		var secs = this._seconds; // total duration time, within any schedule
		var elapsedSecsLeft = parseInt(workflow.scratchpad.repairedTaskSLA.businessElapsed);

		this.debug("SLAPercentageTimer->onExecute: executing in repair mode  startTime={0}, duration of this activity={1}s, " +
					" remaining elapsed time to consume in repaired SLA={2}s", [startTime.getValue(), secs, elapsedSecsLeft]);
        /* if the total time that this activity timer represents is equal to or less than what has already 
           elapsed on the repaired Task SLA we can just subtract this from the total and end this timer */
		if (secs <= elapsedSecsLeft) {
			this.debug("SLAPercentageTimer->onExecute: timer duration has already elapsed in the repaired Task SLA so end it");
			elapsedSecsLeft -= secs;
			workflow.scratchpad.repairedTaskSLA.businessElapsed = elapsedSecsLeft;
			this.onTimer();
			return;
		}

        /* if we've got to here then we're still repairing but this timer is now going to finish after
           what has already elapsed so we need to calculate and end date for this timer less any elapsed
           time that we still haven't accounted for */
		var timerSecsLeft = secs - elapsedSecsLeft;

		var endTime = this._calcEndTime(this._now, timerSecsLeft);
		var totalSecsLeft = this._getTotalSecsLeft();

		this.debug("SLAPercentageTimer->onExecute: reached a timer activity that has time left before it can complete - remaining time={0}s, activity end time={1}", [timerSecsLeft, endTime.getValue()]);

		// this shouldn't happen but just in case we've got no time left on this timer end it now
		if (totalSecsLeft === 0) {
			// Refactored to return faster as we don't need to schedule anything here....
			this.onTimer();
			return;
		}

		var sched = this._getScheduleOnce(totalSecsLeft, endTime);
		sched.schedule();
	},

	// @Override
	onTimer: function() {
		activity.state = this.STATE_FINISHED;
		activity.result = workflow.scratchpad.repairMode === 'true' ? this.RESULT_REPAIR : this.RESULT_NORMAL;

		/* Refresh the timings in the Task SLA record when a timer expires (but only for non-repair mode)
		   and only if there are no unprocessed records in the "sla_async_queue" */
		if (workflow.scratchpad.repairMode !== 'true' && !(new SLAAsyncQueue().isTaskQueued(current.getValue("task"))))
			SLACalculatorNG.calculateSLA(current, true /* skip update */, undefined, this.slaDefGr);

		this.debug('SLA Percentage Timer complete (endTime ' + activity.scratchpad.endTime + ')');
		this.debug('SLA Percentage Timer exiting in ' + activity.result + " mode");

		var retroSecs = this._getRetroSecs();

		// if we had any trigger delay between our expected end time and now
		// add that to retroactive time to be used up by the next Timer
		if (retroSecs > 0)
			return;

		var triggerDelay = this._getTriggerDelay();
		if (triggerDelay > 0)
			retroSecs += triggerDelay;

		this._saveRetroSecs(retroSecs);
	},

	onRepairModeFalse: function() {
		this.debug('SLA Percentage Timer - turning off repair mode');
		workflow.scratchpad.repairMode = 'false';
	},
	
	// @Override
	_getTotalSecsLeft: function() {
		// see if there is any retroactive time we need to use up (can be +ve or -ve)
		// (the retroactive time to be consumed doesn't take any schedule into account)
		var usedSecs = this._getRetroSecs();

		// and subtract the actual total seconds from the retroactive seconds still to be used
		return this._updateRetroSecs(usedSecs, this._totalSecs);
	},

	_getRetroSecs: function() {
		var retroSecs = parseInt(workflow.scratchpad.retroactiveSecsLeft, 10);
		if (isNaN(retroSecs))
			retroSecs = 0;
		this.debug('workflow.scratchpad.retroactiveSecsLeft=' + retroSecs);
		return retroSecs;
	},

	_saveRetroSecs: function(secs) {
		this.debug('workflow.scratchpad.retroactiveSecsLeft -> ' + secs);
		workflow.scratchpad.retroactiveSecsLeft = secs;
		// stores the time the delay computations are based on
		workflow.scratchpad.baseDelayTime = this._now;
	},

	// calculate remaining time, after subtracting usedSecs from totalSecs
	// updates workflow.scratchpad.retroactiveSecsLeft, 
	// - which will be > 0 on return, if there is more time still to be used than was available
	//   and 0, if all the time has been used up
	_updateRetroSecs: function(usedSecs, totalSecs) {
		this.debug('usedSecs=' + usedSecs + ', totalSecs=' + totalSecs);
		var result = this._consumeSecs(usedSecs, totalSecs);
		var unusedSecs = result[0];
		var remainingSecs = result[1];
		this.debug("Remaining/retroactive time: " + unusedSecs + " seconds");

		this._saveRetroSecs(unusedSecs);
		return remainingSecs; // time remaining
	},

	// deduce the "real" start time of the Timer
	// based upon any retroactive seconds to be accomodated,
	// @Override
	_calcTimerStartTime: function(now) {
		var timerStartTime = TimerActivityHandler.prototype._calcTimerStartTime.call(this, now);
		var usedSecs = this._getRetroSecs();
		var startDelay = this._getStartDelay(now);
		if (usedSecs !== 0 || startDelay !== 0)
			timerStartTime.addSeconds(0 - (usedSecs + startDelay));

		activity.scratchpad.timerStartTime = timerStartTime.getValue();
		this.debug('timerStartTime=' + timerStartTime);
		return timerStartTime;
	},

	// deduce the start time basis for the durations to be calculated
	// (this may be the start time of the Workflow, or the start time of this Timer) 
	// based upon any retroactive seconds to be accomodated, 
	// and any previously stored real start time (essential for subsequent % of Relative Durations)
	// @Override
	_calcDurationBaseTime: function(now) {
		this.debug("now=" + now);
		this.debug("workflow.scratchpad.realStartTime=" + workflow.scratchpad.realStartTime);
		var usedSecs = this._getRetroSecs();
		var baseTime = new GlideDateTime(now);

		if (workflow.scratchpad.realStartTime)
			baseTime = new GlideDateTime(workflow.scratchpad.realStartTime);
		else if (activity.scratchpad.timerStartTime)
			baseTime = new GlideDateTime(activity.scratchpad.timerStartTime);
		else if (usedSecs !== 0)
			baseTime.addSeconds(0 - usedSecs);

		workflow.scratchpad.realStartTime = baseTime.getValue();
		this.debug('baseTime=' + baseTime);
		return baseTime;
	},

	// consume usedSecs, from secs
	// returns either:
	// - [ 0, secs ], if usedSecs == 0
	// - [ unused seconds, 0 ], if usedSecs > secs
	// - [ 0, time remaining ], if usedSecs <= secs
	_consumeSecs: function(usedSecs, secs) {
		var consumedSecs = 0;
		if (usedSecs !== 0) {
			if (usedSecs > secs) {
				usedSecs -= secs;
				consumedSecs += secs;
				secs = 0;
			} else {
				secs -= usedSecs;
				consumedSecs += usedSecs;
				usedSecs = 0;
			}
		}
		return [ usedSecs, secs ];
	},

	// deduce any trigger delay
	// (the time between when the trigger was meant to fire, and when it did fire)
	// returns the delay, in seconds
	_getTriggerDelay: function() {
		var triggerDelay = 0;
		if (activity.scratchpad.endTime)
			triggerDelay = Math.floor((this._now.getNumericValue() - this._getEndTime().getNumericValue()) / 1000);
		this.debug('triggerDelay=' + triggerDelay);
		return triggerDelay;
	},

	_getStartDelay: function(now) {
		var startDelay = 0;
		if (workflow.scratchpad.baseDelayTime)
			startDelay = Math.floor((now.getNumericValue() - new GlideDateTime(workflow.scratchpad.baseDelayTime).getNumericValue()) / 1000);
		this.debug('startDelay=' + startDelay);
		return startDelay;
	},

	// the whole duration of this Timer
	_calcTotalDuration: function(start) {
		var wd = new SLAWorkflowDuration();
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

	// @Override
	// for testing purposes only
	_setStartDateTime: function(start) {
		this.testing = true;
		this._now = new GlideDateTime(start.getValue());
		
		if (workflow.scratchpad.baseDelayTime)
			workflow.scratchpad.baseDelayTime = this._now;
	},

	_getSLADefinition: function() {
		// We need a GlideRecord for the SLA Definition as well to pass to SLACalculatorNG
		var slaDefGr = new GlideRecord("contract_sla");
		// If we haven't already got it on the scratchpad we'll need to fetch it from the database
		if (!workflow.scratchpad.sla) {
			slaDefGr.addDomainQuery(current);
			if (!slaDefGr.get(current.getValue("sla")))
				this.error('_getSLADefinition: failed to retrieve SLA Definition with sys_id ' + current.getValue("sla"));

		} else {
			// Otherwise we can just set the fields we need in our GlideRecord object to save a database query
			slaDefGr.setValue("name", workflow.scratchpad.sla.name);
			slaDefGr.setValue("duration_type", workflow.scratchpad.sla.duration_type);
			slaDefGr.duration.setDateNumericValue(workflow.scratchpad.sla.duration);
			slaDefGr.setValue("relative_duration_works_on", workflow.scratchpad.sla.relative_duration_works_on);
		}
		
		return slaDefGr;
	},

	_populateScratchpad: function() {
		workflow.scratchpad.sla = {
			name: this.slaDefGr.getValue("name"),
			duration: this.slaDefGr.duration.dateNumericValue(),
			duration_type: this.slaDefGr.getValue("duration_type"),
			relative_duration_works_on: this.slaDefGr.getValue("relative_duration_works_on")
		};
	},

	type: 'SLA_Percentage_TimerActivityHandler'
});
