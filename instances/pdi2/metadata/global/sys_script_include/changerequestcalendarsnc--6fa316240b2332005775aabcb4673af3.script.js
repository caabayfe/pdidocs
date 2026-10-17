var ChangeRequestCalendarSNC = Class.create();
ChangeRequestCalendarSNC.CHANGE = 'change_request';
ChangeRequestCalendarSNC.LOG_PROP = "com.snc.change_request.calendar_view.log";
ChangeRequestCalendarSNC.prototype = {
    initialize: function(gr) {
		this._gr = gr;
		this._ciDataCache = {};
		this._log = new global.GSLog(ChangeRequestCalendarSNC.LOG_PROP, this.type).setLog4J();
    },
	_addDateRangeQuery: function (gr, startDate, endDate) {
		// Astute readers will notice that we leave out Change requests with null start &
		// end dates if startDate & endDate are provided. In reality both of them are actually
		// always provided.
		//
		// This is intentional. Change Calendar supports displaying events with null bounds,
		// there it sets the null end way far far so that users don't navigate there, and the
		// event texts show "unbounded" instead of actual date value.
		//
		// However, tests show the longer the event bar (even if we just show a 24hr length of it)
		// slows down the dhtmlx calendar considerably. Also this might query many Change requests
		// on customer instances; and for what purpose? Unbounded Change requests mean they are not
		// yet scheduled and are not really useful when making a decision regarding scheduling current
		// Change. So, because of no strong functional requirement and performance consideration, we
		// leave out unbounded Change requests.
		if (startDate)
			gr.addQuery('end_date', '>', startDate);
		if (endDate)
			gr.addQuery('start_date', '<', endDate);
	},

	getRelatedSchedules: function (startDate, endDate) {
		var conf = {
			date_range: [startDate, endDate],
			dry_run: true,
			collect_window_data: true,
			allow_partially_overlapping_windows: true,
			show_timing_info: false
		};
		var conflictChecker = new global.ChangeCheckConflicts(this._gr, conf);
		if (!conflictChecker.getWindowData) {
			this._log.error("ChangeCheckConflicts does not have \"getWindowData\" defined. That is probably customized. Cannot continue.");
			return {maintenance:[], blackout:[], is_invalid_conflict_checker_si: true};
		}
		conflictChecker.check();
		return conflictChecker.getWindowData();
	},

	getChangesWithSameAssignedTo: function (startDate, endDate) {
		if (!this._gr.getValue('assigned_to'))
			return null;
		var gr = new GlideRecordSecure(ChangeRequestCalendarSNC.CHANGE);
		gr.addActiveQuery();
		gr.addQuery('sys_id', '!=', this._gr.getUniqueValue());
		this._addDateRangeQuery(gr, startDate, endDate);
		var c = gr.addJoinQuery(ChangeRequestCalendarSNC.CHANGE, 'assigned_to', 'assigned_to');
		c.addCondition('sys_id', this._gr.getUniqueValue());
		return gr;
	},

	getChangesWithSameAssignmentGroup: function (startDate, endDate) {
		if (!this._gr.getValue('assignment_group'))
			return null;
		var gr = new GlideRecordSecure(ChangeRequestCalendarSNC.CHANGE);
		gr.addActiveQuery();
		gr.addQuery('sys_id', '!=', this._gr.getUniqueValue());
		this._addDateRangeQuery(gr, startDate, endDate);
		var c = gr.addJoinQuery(ChangeRequestCalendarSNC.CHANGE, 'assignment_group', 'assignment_group');
		c.addCondition('sys_id', this._gr.getUniqueValue());
		return gr;
	},

	getChangesAffectingSamePrimaryCI: function (startDate, endDate) {
		if (!this._gr.getValue('cmdb_ci'))
			return null;
		var gr = new GlideRecordSecure(ChangeRequestCalendarSNC.CHANGE);
		gr.addActiveQuery();
		gr.addQuery('sys_id', '!=', this._gr.getUniqueValue());
		this._addDateRangeQuery(gr, startDate, endDate);
		var c = gr.addJoinQuery(ChangeRequestCalendarSNC.CHANGE, 'cmdb_ci', 'cmdb_ci');
		c.addCondition('sys_id', this._gr.getUniqueValue());
		return gr;
	},

	getScheduleInformation: function (windowArr, startDate, endDate) {
		var schedules = {};
		for (var ci in windowArr) {
			var wArr = windowArr[ci];
			for (var i = 0; i < wArr.length; i++) {
				var w = wArr[i];
				var sh = schedules[w.scheduleId];
				if (sh) {
					this._addCiToRelated(sh.related_cis, ci, w);
					continue;
				}

				sh = {
					sys_id: w.scheduleId,
					date_ranges: [],
					related_cis: []
				};
				this._addCiToRelated(sh.related_cis, ci, w);

				var sp = new GlideSchedule(w.scheduleId);
				sh.title = sp.getName();
				sh.time_zone = sp.getTimeZone();
				var it = sp.fetchTimeMap(startDate, endDate, sh.time_zone , false);
				while (it.hasNext()) {
					var stp = it.next();
					var startGDT = stp.getStart().getGlideDateTime();
					var endGDT = stp.getEnd().getGlideDateTime();
					var range = {
						start: startGDT.getValue(),
						startDisplay: startGDT.getDisplayValueInternal(),
						end: endGDT.getValue(),
						endDisplay: endGDT.getDisplayValueInternal()
					};
					var span = new GlideRecord('cmn_schedule_span');
					if (span.get(stp.getOriginTimeSpan().getID())) {
						range.origin_span = {
							sys_id: span.getUniqueValue(),
							name: span.getDisplayValue('name')
						};
					}
					sh.date_ranges.push(range);
				}
				schedules[w.scheduleId] = sh;
			}
		}
		var res = [];
		for (var k in schedules) {
			res.push(schedules[k]);
		}
		return res;
	},

	_addCiToRelated: function(arr, ci, w) {
		// For maintenance/blackout schedules that apply to a Change Request the ci value will be null.
		if (!ci || "null" === ci)
			return;

		if (w && w.relatedCiId)
			this._addCiToRelated(arr, w.relatedCiId);
		else if (arr.every(function (c) {
			return c.sys_id !== ci;
		})) {
			var ciData = this._ciDataCache[ci];
			if (!ciData) {
				ciData = {};
				var c = new GlideRecord('cmdb_ci');
				if (c.get(ci)) {
					ciData.name = c.getDisplayValue('name');
					ciData.ci_class = c.getDisplayValue('sys_class_name');
				}
				this._ciDataCache[ci] = ciData;
			}
			arr.push({
				sys_id: ci,
				name: ciData.name,
				ci_class: ciData.ci_class
			});
		}
	},

    type: 'ChangeRequestCalendarSNC'
};
