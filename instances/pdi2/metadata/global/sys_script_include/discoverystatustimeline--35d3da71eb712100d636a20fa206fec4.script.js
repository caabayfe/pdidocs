// Discovery

/**
 * This script include parses discovery_status and displays all the discovery runs in a timeline fashion.
 *
 */

// Class Imports
var TimelineItem = GlideTimelineItem;
gs.include("j2js");

var DiscoveryStatusTimeline = Class.create();
DiscoveryStatusTimeline.prototype = Object.extendsObject(AbstractTimelineSchedulePage, {
	// Constants
	DISCOVERY_SCHEDULE : 'discovery_schedule',
	DISCOVERY_STATUS : 'discovery_status',
	SYS_TRIGGER : 'sys_trigger',
	WEEK : 7, // 1 week = 7 days
	DAY : 86400000, // 1 Day = 86400000 ms

	spanCount: 0,
	
	//////////////////////////////////////////////////////////////////////////////////////////////////
	// GET_ITEMS       																			 //
	//////////////////////////////////////////////////////////////////////////////////////////////////
	
	getItems: function() {
		this.max = new GlideDateTime();
		this.max.addMonthsUTC(1); // Limit on the number of months to display
		this.currentDT = new GlideDateTime();
		
		// Get the active discovery schedules to span on the timeline
		var gr = new GlideRecord(this.DISCOVERY_SCHEDULE);
		gr.addActiveQuery();
		gr.addQuery('disco_run_type', '!=', 'after_discovery');
		gr.query();
		if (gr.hasNext())
			this.insertItems(gr, 0, null);
	},
	
	// Add item and spans to the timeline
	insertItems: function(gr, maxRunTime, precedingItem) {
		while(gr.next()) {
			var item = new TimelineItem(this.DISCOVERY_SCHEDULE, gr.sys_id);
			var spanProperties = this.setSpanProperties(gr, item);
			this.insertSpans(gr, spanProperties, maxRunTime, precedingItem);
		}
	},
	
	// Setting the span properties
	setSpanProperties: function(gr, item) {
		var span = {};
		span.item = item;
		span.sys_id = gr.sys_id;
		span.text = gr.name;
		span.tooltip = this.getTooltip(gr.sys_id);
		span.duration = this.getPreviousDuration(gr.sys_id);
		span.maxRunTime = gr.max_run.getGlideObject().getNumericValue();
		
		return span;
	},
		
	// Calculate the spans for each type of the discovery schedule
	insertSpans: function(gr, span, precedingMaxRunTime, precedingItem) {
		if (JSUtil.notNil(this.getStartDateTime(gr)))
			span.dt = new GlideDateTime(this.getStartDateTime(gr));
		else {
				gs.warn('Upcoming Discovery Schedules - The corresponding trigger job for schedule ' + gr.name + ' was not found in sys_trigger');
				return;
		}
		
		// Take the appropriate action based on the type of the discovery schedule
		switch (gr.disco_run_type + '') {
			case 'daily':
				this.spanDailySchedule(span);
				break;
			
			case 'weekly':
				this.spanWeeklySchedule(span);
				break;
			
			case 'monthly':
				this.spanMonthlySchedule(span);
				break;
			
			case 'periodically':
				this.spanPeriodicSchedule(span, gr.run_period.getGlideObject().getNumericValue());
				break;
			
			case 'once':
				this.spanOnceSchedule(span);
				break;
			
			case 'weekdays':
				this.spanWeekdaysSchedule(span);
				break;
			
			case 'weekends':
				this.spanWeekendsSchedule(span);
				break;
			
			case 'month_last_day':
				this.spanMonthLastDaySchedule(span);
				break;
			
			case 'calendar_quarter_end':
				this.spanCalenderQuarterEndSchedule(span);
				break;
				
			case 'after_discovery':
				this.spanAfterSchedule(gr, span, precedingMaxRunTime, precedingItem);
				break;
				
			default:
				break;
		}
		
		this.add(span.item);
		this.spanFollowerSchedules(gr, span.item);
	},
	
	// Gets the next start time from sys_trigger table
	getStartDateTime: function(g) {
		var gr = new GlideRecord(this.SYS_TRIGGER);
		gr.addQuery('document', this.DISCOVERY_SCHEDULE);
		gr.addQuery('document_key', g.sys_id);
		gr.query();
		
		if (gr.next())
			return gr.next_action;
	},
	
	// Check for the followers schedule
	spanFollowerSchedules: function(preceding, previousItem) {
		var followers = this.getFollowers(preceding.sys_id);
		if (followers.hasNext())
			this.insertItems(followers, preceding.max_run.getGlideObject().getNumericValue(), previousItem);
	},
	
	// Create an item and span the schedule
	spanAfterSchedule: function(follower, spanProperties, precedingMaxRunTime, previousItem) {
		var jsArray = j2js(previousItem.getTimelineSpans());
		for (var i = 0; i < jsArray.length; i++)
			if (precedingMaxRunTime)
				this.addSpan(spanProperties, jsArray[i].getInnerSegmentEndTimeMs());
			else
				this.addSpan(spanProperties, jsArray[i].getEndTimeMs());
	},

	// Get all the followers of a schedule if there are any
	getFollowers: function(schedule) {
		var gr = new GlideRecord(this.DISCOVERY_SCHEDULE);
		gr.addActiveQuery();
		gr.addQuery('run_after', schedule);
		gr.query();
		
		return gr;
	},	
	
	// Get the duration of the previous successful discovery.
	getPreviousDuration: function(schedule) {
		var status = new GlideRecord(this.DISCOVERY_STATUS);
		status.addQuery('dscheduler', schedule);
		status.addQuery('state', 'completed');
		status.addQuery('description', '!=', 'Discover CI');
		status.orderByDesc('sys_created_on');
		status.setLimit(1);
		status.query();
		if (status.next())
			return status.duration.getGlideObject();
		else
			return -1;
	},
	
	getTooltip: function(sys_id) {
		var tooltip = "";
		var gr = new GlideRecord(this.DISCOVERY_SCHEDULE);
		if (sys_id)
			gr.get('sys_id', sys_id);
		var behName = gr.behavior.getDisplayValue();
		var midName = gr.mid_server.getDisplayValue();
		var duration = this.getPreviousDuration(sys_id);
		var projectedDuration =  duration != -1 ? duration.getDisplayValue() : 'No Estimation';
			
		// if Behavior and MID name are both nil, just omit
		if (JSUtil.notNil(behName))
			tooltip += "<strong>" + "Behavior: " + "</strong>" + behName + "<br/>";
		else if (JSUtil.notNil(midName))
			tooltip += "<strong>" + "MID Server: " + "</strong>" + midName + "<br/>";
		tooltip += "<strong>" + "Projected Duration: " + "</strong>" + projectedDuration + "<br/>";
		
		return tooltip;
	},
	
	addSpan: function(parm, startTime) {
		this.spanCount++;
		// Add unique ID to each span. The double click event on the span for the Discovery Schedule
		// it references will still work since 'boolIsWorkManagementPage' is 'true'. This causes
		// the click handler to split on '-' and obtain the valid sys_id for lookup. See TimelineUtils.js
		var spanId = parm.sys_id + "-" + this.spanCount;
		var span = parm.item.createTimelineSpan(this.DISCOVERY_SCHEDULE, spanId, false);
		// If the discovery schedule has the max run time, display/span in inner segment fashion
		var duration = parm.duration != -1 ? parm.duration.getNumericValue() : 0;
		if (parm.maxRunTime) {
			span.setTimeSpan(startTime, startTime + parm.maxRunTime);
			span.setInnerSegmentTimeSpan(startTime, startTime + duration);
			span.setInnerSegmentClass('darkcyan');
			span.setSpanColor('black');
		}
		else {
			span.setTimeSpan(startTime, startTime + duration);
			span.setSpanColor('darkcyan');
		}
		span.setSpanText(parm.text);
		span.setTooltip(parm.tooltip);
		
		return span;
	},
	
	spanDailySchedule: function(span) {
		var gdt = span.dt;
		while (gdt.getNumericValue() < this.max.getNumericValue()) {
			this.addSpan(span, gdt.getNumericValue());
			gdt.addDaysUTC(1);
		}
	},
	
	spanWeeklySchedule: function(span) {
		var gdt = span.dt;
		while (gdt.getNumericValue() < this.max.getNumericValue()) {
			this.addSpan(span, gdt.getNumericValue());
			gdt.addWeeksUTC(1);
		}
	},
	
	spanMonthlySchedule: function(span) {
		var gdt = span.dt;
		while (gdt.getNumericValue() < this.max.getNumericValue()) {
			this.addSpan(span, gdt.getNumericValue());
			gdt.addMonthsUTC(1);
		}
	},
	
	spanPeriodicSchedule: function(span, period) {
		var gdt = span.dt;
		while (gdt.getNumericValue() < this.max.getNumericValue()) {
			this.addSpan(span, gdt.getNumericValue());
			gdt.add(period);
		}
	},
	
	spanOnceSchedule: function(span) {
		var gdt = span.dt;
		if (gdt.getNumericValue() < this.max.getNumericValue())
			this.addSpan(span, gdt.getNumericValue());
	},
	
	spanWeekdaysSchedule: function(span) {
		var gdt = span.dt;
		while (gdt.getNumericValue() < this.max.getNumericValue()) {
			if (gdt.getDayOfWeekUTC() != 6 && gdt.getDayOfWeekUTC() != 7)
				this.addSpan(span, gdt.getNumericValue());
			gdt.addDaysUTC(1);
		}
	},
	
	spanWeekendsSchedule: function(span) {
		var gdt = span.dt;
		while (gdt.getNumericValue() < this.max.getNumericValue()) {
			if (gdt.getDayOfWeekUTC() == 6 || gdt.getDayOfWeekUTC() == 7)
				this.addSpan(span, gdt.getNumericValue());
			gdt.addDaysUTC(1);
		}
	},
	
	spanMonthLastDaySchedule: function(span) {
		var gdt = span.dt;
		while (gdt.getNumericValue() < this.max.getNumericValue()) {
			if (gs.isLastDayOfMonth(gdt))
				this.addSpan(span, gdt.getNumericValue());
			gdt.addDaysUTC(1);
		}
	},
	
	// Quarter end schedules are spanned just once because the timeline shows data worth 1 month only
	// Hence there is no need to go further beyond the first occurrence
	spanCalenderQuarterEndSchedule: function(span) {
		var gdt = span.dt;
		var quarterEnd = new GlideDateTime(gs.endOfThisQuarter());
		quarterEnd.subtract(this.DAY);
		var diffSeconds = gs.dateDiff(gdt.getDate(), quarterEnd.getDate(), true);
		gdt.addSeconds(diffSeconds);
		if (gdt.getNumericValue() < this.max.getNumericValue())
			this.addSpan(span, gdt.getNumericValue());
	},
	
	type: 'DiscoveryStatusTimeline'
});
