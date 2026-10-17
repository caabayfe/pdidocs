var AvailabilityCalculator = Class.create();

AvailabilityCalculator.prototype = {
    SCHEDULES: new GlideLRUCache(50),
	UTILS: new global.AvailabilityUtils(),

    initialize: function() {
        this.cmdb_ci = null;
        this.commitment = null;
    },

    calculate: function(start, end, type) {
        type = type || 'daily';
        var commits = this._getCommits();
        while (commits.next()) {
            // Check legacy edge case where "service_offering_commitment.service_offering" is a reference to "cmdb_ci"
            // AND service_offering is state = draft
            var commitmentOffering = commits.service_offering;
            if (commitmentOffering) {
                var commitmentCiClass = commitmentOffering.sys_class_name;
                if (commitmentCiClass == 'service_offering' && commitmentOffering.state == 'draft')
                    continue;
            }

            var schedule = commits.service_commitment.schedule + '';
            var tz = commits.service_commitment.timezone + '';
            var cmdb_ci = this.UTILS.getCiFromCommitment(commits);

            var outages = this._getOutages(start, end, cmdb_ci);

            this.sumCount = 0;
            var absolute = this._sumOutages(outages, null);
            var absolute_count = this.sumCount;

            this.sumCount = 0;
            var scheduled = this._sumOutages(outages, this._getSchedule(schedule, tz, cmdb_ci));
            var scheduled_count = this.sumCount;

            var delta = new Array();
            var dp = new Object();
            dp.start = start.getNumericValue();
            dp.end = end.getNumericValue();
            delta.push(dp);

            var absolute_total = this._sumOutages(delta, null);
            var scheduled_total = this._sumOutages(delta, this._getSchedule(schedule, tz, cmdb_ci));

            var absolute_avail = 100 * ((absolute_total.getNumericValue() - absolute.getNumericValue()) / absolute_total.getNumericValue());

            var scheduled_avail = 100;
            if (scheduled_total.getNumericValue() != 0)
                scheduled_avail = 100 * ((scheduled_total.getNumericValue() - scheduled.getNumericValue()) / scheduled_total.getNumericValue());

			var mtbf = scheduled_total.getNumericValue();
            var mtrs = 0;
            if (scheduled_count != 0) {
                mtbf = (scheduled_total.getNumericValue() - scheduled.getNumericValue()) / scheduled_count;
                mtrs = scheduled.getNumericValue() / scheduled_count;
            }

            // allowed downtime is downtime that we're allowed under this schedule (might be zero)
            var allowed_downtime = scheduled_total.getNumericValue() * ((100 - commits.service_commitment.availability) / 100);

            mtbf = new GlideDuration(mtbf);
            mtrs = new GlideDuration(mtrs);
            allowed_downtime = new GlideDuration(allowed_downtime);

            var met = scheduled.getNumericValue() <= allowed_downtime.getNumericValue();

            // actually log it
            var ar = new AvailabilityRecord(cmdb_ci, start, end);
		    ar.setCiClass(this.UTILS.getCiClassFromCommitment(commits));
            ar.setType(type);
            ar.post(commits.service_commitment, absolute, scheduled, absolute_avail, scheduled_avail, absolute_count, scheduled_count, scheduled_total, mtbf, mtrs, allowed_downtime, met);
        }
    },

    _getSchedule: function(s, tz, cmdb_ci) {
        var schedule = this._getSchedule0(s, tz);
        var maint = this._getMaint(cmdb_ci);
        if (!maint)
            return schedule;

        if (!schedule)
            schedule = this._getFullDay(tz);

        for (var i = 0; i < maint.length; i++)
            schedule.addOtherSchedule0(maint[i], false);

        return schedule;
    },

    _getSchedule0: function(s, tz) {
        if (!s)
            return null;

        var answer = this.SCHEDULES.get(s);
        if (!answer) {
            answer = new GlideSchedule(s);
            this.SCHEDULES.put(s, answer);
        }

        // copy this in case we add a maintenance schedule later (munges the schedule itself)
        answer = new GlideSchedule(answer);
		if (tz)
			answer.setTimeZone(tz);
        return answer;
    },

    _getMaint: function(cmdb_ci) {
        var commits = new GlideRecord('service_offering_commitment');
        commits.addQuery('service_commitment.type', 'maintenance_window');
        commits.addQuery('service_offering', cmdb_ci).addOrCondition('cmdb_ci', cmdb_ci);
        commits.addNotNullQuery('service_commitment.schedule');
        commits.query();
        if (!commits.hasNext())
            return null;

        var answer = new Array();
        while (commits.next()) {
            var sched = commits.service_commitment.schedule;
            var tz = commits.service_commitment.timezone;
            answer.push(this._getSchedule0(sched, tz));
        }
        return answer;
    },

    _sumOutages: function(outages, schedule) {
        var sum = 0;
        if (schedule) {
            var start = new GlideDateTime();
            var end = new GlideDateTime();
        }

        for (var i = 0; i < outages.length; i++) {
            var dur = 0;
			// ONLY COUNT OUTAGES WITHOUT TYPE OR TYPE IS OUTAGE, IGNORE OTHER TYPES
			if (!outages[i].type || outages[i].type == 'outage') {
				if (schedule) {
					start.setNumericValue(outages[i].start);
					end.setNumericValue(outages[i].end);
					dur = schedule.duration(start, end).getNumericValue();
				} else
					dur = (outages[i].end - outages[i].start);
			}
            sum += dur;
            if (dur > 0)
                this.sumCount++;
        }

        var answer = new GlideDuration();
        answer.setNumericValue(sum);
        return answer;
    },

    _getCommits: function() {
        var commits = new GlideRecord('service_offering_commitment');
        commits.addQuery('service_commitment.type', 'availability');

		// ensure that there is either a configuration item populated, or a service offering that is in published state
		if (this._hasOfferingReference())
			commits.addEncodedQuery('cmdb_ciISNOTEMPTY^ORservice_offering.state=published^ORservice_offering.state=');		

        if (this.cmdb_ci != null)
            commits.addQuery('service_offering', this.cmdb_ci).addOrCondition('cmdb_ci', this.cmdb_ci);
        if (this.commitment != null)
            commits.addQuery('service_commitment', this.commitment);  
		commits.query();
        return commits;
    },

	_hasOfferingReference: function() {
		var gr = new GlideRecord("sys_dictionary"); 
		gr.addQuery("name", "service_offering_commitment");
		gr.addQuery("element", "service_offering");
		gr.addQuery("reference", "service_offering");
		gr.query();
		
		//Check to see if reference is already set to service_offering
		if (gr.hasNext())
			return true;

		return false;
	},

    _getOutages: function(start /* GlideDateTime */ , end /* GlideDateTime */ , cmdb_ci /* String */ ) {
		var outages = new Array();
		var sd = start.getNumericValue();
		var ed = end.getNumericValue();

		// QUERY FOR OUTAGES WITH MATCHING CI FROM OUTAGE TABLE
		// this is for historical data that did not use the cmdb_outage_ci_mtom table
		var gr = new GlideRecord('cmdb_ci_outage');
		gr.addQuery('cmdb_ci', cmdb_ci);
		gr.addQuery('type', 'outage')
			.addOrCondition('type', 'planned');
		gr.addQuery('begin', '<', end);
		gr.addQuery('end', '>', start)
			.addOrCondition('end', '=', 'NULL');
		gr.orderBy('begin');
		gr.query();

		// get the beginning and end timespands for all outages
		// found, so that overlapping outages can be collapsed later.
		var beginMS;
		var endMS;
		while (gr.next()) {
			var type = gr.getValue('type');
			beginMS = gr.begin.getGlideObject().getNumericValue();
			endMS = gr.end.getGlideObject().getNumericValue();
			if (endMS == 0) { endMS = ed; } // if endMS ==0, then outage is ongoing. use end param for outage end value.
			if (beginMS < sd) { beginMS = sd; }
			if (endMS < beginMS) { continue; } // disregard outages of negative duration
			if (endMS > ed) { endMS = ed; }
			this._processOutage(outages, type, beginMS, endMS);
		}

		// QUERY FOR OUTAGES FROM MTOM TABLE
		// new outage data will reference the cmdb_ci in the cmdb_outage_ci_mtom table
		// and not necessarily directly on the cmdb_ci_outage table.
		relatedOutages = new GlideRecord('cmdb_ci_outage');
		relatedOutages.addQuery('cmdb_ci', '!=', cmdb_ci) // ADDED TO AVOID DUPLICATES
			.addOrCondition('cmdb_ci', null); 

		relatedOutages.addQuery('type', 'outage')
			.addOrCondition('type', 'planned');
		relatedOutages.addQuery('begin', '<', end);
		relatedOutages.addQuery('end', '>', start)
			.addOrCondition('end', '=', 'NULL');

		var grJoin = relatedOutages.addJoinQuery('cmdb_outage_ci_mtom', 'sys_id', 'outage');
		grJoin.addCondition('ci_item', cmdb_ci);

		relatedOutages.orderBy('begin');
		relatedOutages.query();

		// get the beginning and end timespands for all related outages
		// found, so that overlapping outages can be collapsed later.
		while (relatedOutages.next()) {
			var type = relatedOutages.getValue('type');
			beginMS = relatedOutages.begin.getGlideObject().getNumericValue();
			endMS = relatedOutages.end.getGlideObject().getNumericValue();
			if (endMS == 0) { endMS = ed; }
			if (endMS < beginMS) { continue; }
			if (beginMS < sd) { beginMS = sd; }
			if (endMS > ed) { endMS = ed; }
			this._processOutage(outages, type, beginMS, endMS);
		}
		
		return outages;
	},
	
	/**
	 * A helper function used by _getOutages to process and consolidate the outage spans
	 * This function differs from collapseOverlaps in that the outages are not required
	 * to be ordered initially.
	 *
	 * Also, it is meant to be used to continuously collapse the outages as it iterates
	 * through the results so that we can reduce heap memory utilization.
	 *
	 * @see DEF0083238 for more details
	 * @param outages an array of outage span objects. Passed in and updated by reference.
	 * @beginMS start time as a timestamp
	 * @endMS end time as a timestamp
	 * @return void
	 */
	_processOutage : function(outages, type, beginMS, endMS) {
		// IF LIST IS EMPTY THEN SIMPLY ADD OUTAGE
		if (outages.length == 0) {
			outages.push({start: beginMS, end: endMS, type: type});
			return;
		}
		for (var i = 0; i < outages.length; i++) {
			// 	IF CURRENT OUTAGE STARTS BEFORE AND END AFTER EXISTING OUTAGE
			if (type != outages[i].type && beginMS < outages[i].start && endMS > outages[i].end) {
				// PLANNED OUTAGE OVERWRITES EXISTING OUTAGE
				if (type == 'planned') {
					outages.splice(i, 1, {start: beginMS, end: endMS, type: type});
					return;
				}
				// OUTAGE IS SPLIT BY EXISTING PLANNED OUTAGE
				else if (type == 'outage') {
					outages.splice((i+1), 0, {start: outages[i].end, end: endMS, type: type});
					outages.splice(i, 0, {start: beginMS, end: outages[i].start, type: type});
					return;
				}
			}
			// IF CURRENT ENTIRELY BEFORE NEXT THEN ADD
			if (endMS < outages[i].start) {
				if (i == 0) {
					outages.unshift({start: beginMS, end: endMS, type: type});
				} else {
					outages.splice(i, 0, {start: beginMS, end: endMS, type: type});
				}
				return;
			}
			// IF CURRENT COMPLETELY AFTER NEXT THEN SKIP UNLESS THIS IS ALREADY LAST ITEM IN THE LIST
			if (beginMS > outages[i].end) {
				if (i == (outages.length - 1)) {
					outages.push({start: beginMS, end: endMS, type: type});
					return;
				} else {
					continue;
				}
			}
			// CHECK IF WE NEED TO EXTEND NEXT ENTRY IN EIHER DIRECTION
			if ((beginMS < outages[i].start) || (endMS > outages[i].end)) {
				if (beginMS < outages[i].start) {
					// EXTEND BACKWARDS IF OUTAGE TYPE IS THE SAME
					if (type == outages[i].type)
						outages[i].start = beginMS;
					else { // IF TYPE IS DIFFERENT
						// IF CURRENT TYPE IS PLANNED, INSERT AND OVERWRITE EXISTING OUTAGE
						if (type == 'planned') {
							outages[i].start = endMS;
							outages.splice((i), 0, {start: beginMS, end: endMS, type: type});
						} else {
							// INSERT CURRENT OUTAGE BEFORE, OVERWRITE CURRENT OUTAGE WITH EXISTING PLANNED OUTAGE TIME
							outages.splice((i-1), 0, {start: beginMS, end: outages[i].start, type: type});
						}
					}
					// NEED COUNTER TO PROCESS OUTAGES BEFORE CURRENT
					var prev = (i - 1);
					while (prev >= 0) {
						// NEED TO HANDLE PREVIOUS OUTAGES IF THEY OVERLAPS WITH THE CURRENT OUTAGE
						// CONTINUE TO ITERATE THROUGH PREVIOUS OUTAGES AS LONG AS THERE IS OVERLAP
						if (outages[prev].type == 'outage') {
							if ((outages[prev].start >= outages[i].start) && (outages[prev].end <= outages[i].end)) {
								// CHECK FOR PREVIOUS ENTRIES WE CAN REMOVE
								outages.splice(prev, 1);
								prev--;
							} else if (outages[prev].end > outages[i].start) {
								// ADJUST PREVIOUS ADJACENT ENTRY END DATE IF START OVERLAPS
								outages[prev].end = outages[i].start;
								prev--;
							} else {
								break;
							}
						} else {
							break;
						}
					}

					// MERGE ANY PREVIOUS OUTAGES THAT OVERLAP
					prev = (i - 1);	// reset previous
					this._mergeBefore(prev, outages);
				} else if (endMS > outages[i].end) {
					// EXTEND FORWARDS IF OUTAGE TYPE IS THE SAME
					if (type == outages[i].type)
						outages[i].end = endMS;
					else { // IF TYPE IS DIFFERNT
						// IF CURRENT TYPE IS PLANNED, INSERT AND OVERWRITE EXISTING OUTAGE
						if (type == 'planned') {
							outages.splice((i+1), 0, {start: beginMS, end: endMS, type: type});
							outages[i].end = beginMS;
						} else {
							// INSERT CURRENT OUTAGE AFTER, OVERWRITE CURRENT OUTAGE WITH EXISTING PLANNED OUTAGE TIME
							outages.splice((i+1), 0, {start: outages[i].end, end: endMS, type: type});
						}
					}
					// NEED TO HAVE COUNTER TO PROCESS OUTAGES AFTER CURRENT
					var next = (i + 1);
					while (next < outages.length) {
						// NEED TO HANDLE NEXT OUTAGES IF THEY OVERLAPS WITH THE CURRENT OUTAGE
						// CONTINUE TO ITERATE THROUGH NEXT OUTAGES AS LONG AS THERE IS OVERLAP
						if (outages[next].type == 'outage') {
							if ((outages[next].start >= outages[i].start) && (outages[next].end <= outages[i].end)) {
								// CHECK FOR FUTURE ENTRIES WE CAN REMOVE
								outages.splice(next, 1);
								next++;
							} else if (outages[next].start < outages[i].end) {
								// ADJUST NEXT ADJACENT ENTRY START DATE IF END OVERLAPS
								outages[next].start = outages[i].end;
								next++;
							} else {
								break;
							}
						} else {
							break;
						}
					}

					// MERGE ANY SUBSEQUENT OUTAGES THAT OVERLAP
					next = (i + 1); // reset next
					this._mergeAfter(next, outages);
				}
				return;
			}
			// IF CURRENT PLANNED OUTAGE IS COMPLETELY DURING AN EXISTING OUTAGE 
			if (type == 'planned' && outages[i].type == 'outage' && beginMS >= outages[i].start && endMS <= outages[i].end) {
				// INSERT PLANNED OUTAGE AFTER EXSTING OUTAGE
				outages.splice((i+1), 0, {start: beginMS, end: endMS, type: type});
				// SPLIT EXISTING OUTAGE IN SECOND OUTAGE THAT BEGINS AFTER CURRENT PLANNED OUTAGE
				if (endMS != outages[i].end)
					outages.splice((i+2), 0, {start: endMS, end: outages[i].end, type: outages[i].type});
				// EXISTING OUTAGE END WHERE PLANNED OUTAGE BEGINS
				outages[i].end = beginMS;
				// REMOVE OUTAGES WITH SAME START/END	
				if (outages[i].end == outages[i].start)
					outages.splice(i,1);
			}
			// IF WE FALL THROUGH TO HERE THEN NO ACTION REQUIRED
			return;
		}
	},

	/**
	 * Merge subsequent outages of the same type together if they overlap 
	 * @param {Number} index 
	 * @param {Array<Object>} outages 
	 * @returns number 
	 */
	_mergeAfter: function (index, outages) {
		if ((typeof index != 'number') || !outages || !outages.length)
			return -1;

		var current = index;
		while (current < outages.length) {
			var next = (current + 1);
			if (next < outages.length && (outages[current].end > outages[next].start) && (outages[current].type == outages[next].type)) {
				outages[current].end = Math.max(outages[current].end, outages[next].end);
				outages.splice(next, 1);
				current++;
			} else
				return current;
		}
		return current;
	},

	/**
	 * Merge previous outages of the same type together if they overlap 
	 * @param {Number} index 
	 * @param {Array<Object>} outages 
	 * @returns Number 
	 */
	_mergeBefore: function (index, outages) {
		if ((typeof index != 'number') || !outages || !outages.length)
			return -1;

		var current = index;
		while (current >= 0) {
			var prev = (current - 1);
			if (prev >= 0 && (outages[current].start < outages[prev].end) && (outages[current].type == outages[prev].type)) {
				outages[current].start = Math.min(outages[current].start, outages[prev].start);
				outages.splice(prev, 1);
				current--;
			} else
				return current;
		}
		return current;
	},
		
	_getFullDay: function(tz) {
        var answer = new GlideSchedule();
        var gr = new GlideRecord('cmn_schedule_span');
        gr.initialize(); // necessary to force in a guid
        gr.setValue('start_date_time', '20100101T000000');
        gr.setValue('end_date_time', '20100102T000000');
        gr.setValue('repeat_type', 'daily');
        answer.addTimeSpan(gr); // gr must have a guid at this point
		if (tz)
			answer.setTimeZone(tz);
        return answer;
    },

    _collapseOverlaps: function(outages) {
        var answer = new Array();
        var work = null;
        for (var i = 0; i < outages.length; i++) {
            var o = outages[i];
            if (work == null) {
                work = o;
                continue;
            }
            // overlap
            if (o.start <= work.end)
                work.end = Math.max(o.end, work.end);
            else {
                answer.push(work);
                work = o;
            }
        }
        if (work)
            answer.push(work);

        return answer;
    },

    setCommitment: function(id) {
        this.commitment = id;
    },

    setCI: function(cmdb_ci) {
        this.cmdb_ci = cmdb_ci;
    }

};
