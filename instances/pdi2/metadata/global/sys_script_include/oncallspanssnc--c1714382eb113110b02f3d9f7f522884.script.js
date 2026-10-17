var OnCallSpansSNC = Class.create();
OnCallSpansSNC.prototype = {

    initialize: function(shift, checkAccess, formatter, cache) {
        cache = cache || {};
        this._log = new GSLog("com.snc.on_call_rotation.log.level", this.type);
        if (this._log.atLevel(GSLog.DEBUG))
            this.timer = new OCTimer(this.type);
        if (typeof shift === 'string') {
            var shiftGr = new GlideRecord("cmn_rota");
            if (!shiftGr.get(shift))
                throw new Error("No such shift defined");
            this.shiftGr = shiftGr;
        } else {
            if (shift.isValidRecord())
                this.shiftGr = shift;
            else
                throw new Error("Not a valid shift GlideRecord");
        }

        this.checkAccess = checkAccess;
        this.formatter = formatter;
        this.oncallRoster = new OnCallRoster();

        this.excludeTimeOff = true;

        var ajaxSchedulePage = new GlideAJAXSchedulePage();
        var changeRotaColors = new ChangeRotaColors();
        this.colors = {};
        this.colors['rota'] = {};
        this.colors['rota'].color = this._getEventBgColor(this.shiftGr.getUniqueValue(), 'rota');
        this.colors['rota'].textColor = changeRotaColors.getContrast(this.colors['rota'].color);
        this.colors['roster'] = {};
        this.colors['roster'].color = this._getEventBgColor(this.shiftGr.getUniqueValue(), 'roster');
        this.colors['roster'].textColor = changeRotaColors.getContrast(this.colors['roster'].color);
        this.colors['time_off'] = {};
        this.colors['time_off'].color = ajaxSchedulePage.getColor(1);
        this.colors['time_off'].textColor = changeRotaColors.getContrast(this.colors['time_off'].color);
        this.colors['time_off_in_approval'] = {};
        this.colors['time_off_in_approval'].color = 'transparent';
        this.colors['time_off_in_approval'] = changeRotaColors.getContrast(this.colors['time_off_in_approval'].color);
        this.colors['override'] = {};
        this.colors['override'].color = ajaxSchedulePage.getColor(2);
        this.colors['override'].textColor = changeRotaColors.getContrast(this.colors['override'].color);
        this.colors['exclude'] = {};
        this.colors['exclude'].color = 'darkgray';
        this.colors['exclude'].textColor = changeRotaColors.getContrast(this.colors['exclude'].color);
        this.excludeUserDetails = false;
        this.groupMembers = this._getGroupMembers(cache);
        this.cache = cache;
        this._localCache = {};
    },

    START_EPOCH: -1,
    END_EPOCH: 99999999999999,
    ROTATION_PAYLOAD_VERSION: 4,
    INTERNAL_FORMAT: "YYYY-MM-dd hh:mm:ss",

    getShiftScheduleId: function() {
        return this.shiftGr.schedule + '';
    },

    getShiftGroupId: function() {
        return this.shiftGr.group + '';
    },

    setInCacheIfEmpty: function(cache, field) {
        if (!cache[field]) {
            cache[field] = {};
        }
    },

    _getGroupMembers: function(cache) {

        this.setInCacheIfEmpty(cache, "_groupMembers");
        var groupId = this.getShiftGroupId();
        if (cache._groupMembers[groupId]) {
            return cache._groupMembers[groupId];
        }

        var members = [];
        var gr = new GlideRecord("sys_user_grmember");
        gr.addQuery('group', groupId);
        gr.query();
        while (gr.next()) {
            members.push(gr.user + '');
        }

        cache._groupMembers[groupId] = members;

        return members;
    },

    _getShiftScheduleTimezone: function() {

        this.setInCacheIfEmpty(this.cache, "_scheduleTimeZone");
        var timeZone;
        var scheduleSysId = this.shiftGr.getValue("schedule");
        if (this.cache._scheduleTimeZone[scheduleSysId]) {
            timeZone = this.cache._scheduleTimeZone[scheduleSysId];
        } else {
            timeZone = this.shiftGr.schedule.time_zone + '';
            this.cache._scheduleTimeZone[scheduleSysId] = timeZone;
        }
        if (!JSUtil.nil(timeZone))
            return timeZone;
        return new GlideUser().getSysTimeZone();
    },

    getExcludeTimeOff: function() {
        return this.excludeTimeOff;
    },

    getMemberSpansBeforeExclude: function() {
        return this.memberSpansBeforeExclude || [];
    },

    setMemberSpansBeforeExclude: function(memberSpansBeforeExclude) {
        this.memberSpansBeforeExclude = memberSpansBeforeExclude;
        return this;
    },

    setExcludeTimeOff: function(excludeTimeOff) {
        this.excludeTimeOff = excludeTimeOff;
        return this;
    },

    setExcludeUserDetails: function(excludeUserDetails) {
        this.excludeUserDetails = excludeUserDetails;
        return this;
    },

    getRosterIds: function() {
        return this.rosterIds;
    },

    /* Set the Roster IDs used when building rotas
     *
     * rosterIds [String]: A comma seperated list of cmn_rota_roster
     * sys_ids to filter the returned spans
     */
    setRosterIds: function(rosterIds) {
        this.rosterIds = rosterIds;
        return this;
    },

    setMemberIds: function(memberIds) {
        this.memberIds = memberIds;
        return this;
    },

    getMemberIds: function() {
        return this.memberIds;
    },

    getSpans: function(calendarStartGDT, calendarEndGDT, processedUserTimeOffs) {
        if (!processedUserTimeOffs)
            processedUserTimeOffs = {};
        var spans = this.getShiftSpans(calendarStartGDT, calendarEndGDT);
        spans = spans.concat(this.getAllRosterSpans(calendarStartGDT, calendarEndGDT, processedUserTimeOffs));
        return spans;
    },

    getShiftSpans: function(calendarStartGDT, calendarEndGDT) {
        var calendarStartSDT = new GlideScheduleDateTime(calendarStartGDT);
        var calendarEndSDT = new GlideScheduleDateTime(calendarEndGDT);
        calendarStartSDT.setTimeZone(this._getShiftScheduleTimezone());
        calendarEndSDT.setTimeZone(this._getShiftScheduleTimezone());
        if (!this._localCache._scheduleItems) {
            this._localCache._scheduleItems = {};
        }
        var canWrite = this.shiftGr.canWrite();
        var cacheKey = calendarStartSDT.getValue() + calendarEndSDT.getValue() + this._getShiftScheduleTimezone() + this.getShiftScheduleId() + canWrite.toString();
        var items;
        if (this._localCache._scheduleItems[cacheKey]) {
            items = this._localCache._scheduleItems[cacheKey];
        } else {
            var page = new GlideAJAXSchedulePage(calendarStartSDT, calendarEndSDT, this._getShiftScheduleTimezone());
            items = page.addSchedule(this.getShiftScheduleId(), null, null, this.shiftGr.canWrite());
            this._localCache._scheduleItems[cacheKey] = items;
        }

        var shiftSpans = [];
        for (var i = 0; i < items.size(); i++) {
            var item = items.get(i);
            var spans = item.getTimeSpans();
            for (var j = 0; j < spans.size(); j++) {
                shiftSpans.push({
                    span: spans.get(j),
                    item: item
                });
            }
        }

        shiftSpans.sort(function(shiftSpanA, shiftSpanB) {
            return shiftSpanA.span.compareTo(shiftSpanB.span);
        });

        return this._formatShiftSpans(shiftSpans);
    },

    _formatShiftSpans: function(shiftSpans) {
        var that = this;
        return shiftSpans.map(function(shiftSpan) {
            var type = shiftSpan.item.getType() ? shiftSpan.item.getType() : "rota";
            var actualStart = shiftSpan.span.getActualStart() || shiftSpan.span.getStart();
            var actualEnd = shiftSpan.span.getActualEnd() || shiftSpan.span.getEnd();
            var shift = {
                "title": SNC.GlideHTMLSanitizer.sanitize(shiftSpan.item.getName() + ""),
                "color": that.colors[type].color,
                "textColor": that.colors[type].textColor,
                "start": shiftSpan.span.getStart().getGlideDateTime().getDisplayValueInternal() + "",
                "end": shiftSpan.span.getEnd().getGlideDateTime().getDisplayValueInternal() + "",
                "sys_id": shiftSpan.item.getSysId() + "",
                "table": shiftSpan.item.getTable() + "",
                "rota_id": that.shiftGr.getUniqueValue() + "",
                "roster_id": "", // to make output backward compatible with old schedule engine
                "group_id": that.shiftGr.group + "",
                "user_id": shiftSpan.item.getUserId() + "",
                "user_name": shiftSpan.item.getUserName() + "",
                "user_email": shiftSpan.item.getUserEmail() + "",
                "user_contact_number": shiftSpan.item.getUserContactNumber() + "",
                "user_active": shiftSpan.item.getUserActive(),
                "startNumeric": shiftSpan.span.getStart().getGlideDateTime().getNumericValue() + "",
                "endNumeric": shiftSpan.span.getEnd().getGlideDateTime().getNumericValue() + "",
                "roster_name": shiftSpan.item.getRosterName() + "",
                "description": shiftSpan.item.getDescription() + "",
                "type": type,
                "order": shiftSpan.item.getOrder() + "",
                "actual_start_date": actualStart.getGlideDateTime().getDisplayValueInternal() + "",
                "actual_end_date": actualEnd.getGlideDateTime().getDisplayValueInternal() + ""
            };
            that.formatter.formatEvent(shift);
            return shift;
        });
    },

    getAllRosterSpans: function(calendarStartGDT, calendarEndGDT, processedUserTimeOffs) {
        var gr = new GlideRecord("cmn_rota_roster");
        if (this.rosterIds)
            gr.addQuery("sys_id", "IN", this.rosterIds);
        gr.addQuery("rota", this.shiftGr.getUniqueValue());
        gr.addActiveQuery();
        gr.orderBy("order");
        gr.query();
        var spans = [];
        while (gr.next()) {
            spans = spans.concat(this.getRosterSpans(gr, calendarStartGDT, calendarEndGDT, processedUserTimeOffs));
        }
        return spans;
    },

    getRosterSpans: function(rosterGr, calendarStartGDT, calendarEndGDT, processedUserTimeOffs) {
        var that = this;

        var rotationPayload;
        try {
            rotationPayload = JSON.parse(rosterGr.getValue('rotation_payload'));
        } catch (ex) {
            gs.info("[getRosterSpans]: invalid rotationPayload roster id : " + rosterGr.getUniqueValue());
        }

        // Clears off rotation payload, if structure changed in new release
        if (!rotationPayload || rotationPayload.version != this.ROTATION_PAYLOAD_VERSION) {
            rotationPayload = {};
            rotationPayload.version = this.ROTATION_PAYLOAD_VERSION;
        }
        if (!rotationPayload.memberPlans) {
            rotationPayload.memberPlans = this.oncallRoster.computeMemberPlans(rosterGr);
        }

        var rosterSpans = [];

        // Coverage spans handling
        var rosterSpanGr = new GlideRecord("roster_schedule_span");
        var encQuery = this._getDateLimitedEncQuery("roster=" + rosterGr.getUniqueValue() + "^type=" + "on_call", calendarStartGDT, calendarEndGDT);
        rosterSpanGr.addEncodedQuery(encQuery);
        rosterSpanGr.query();

        var coverages = [];
        while (rosterSpanGr.next()) {
            var coverageDateSpans = this._getScheduleSpans(calendarStartGDT, calendarEndGDT, rosterSpanGr);
            coverages = coverages.concat(coverageDateSpans);

            var coverageTitle;
            if (!this.excludeUserDetails) {
                var userGr = this._getUser(rosterSpanGr.user + '');
                coverageTitle = gs.getMessage("{0} ({1} Coverage)", [userGr.name + "", rosterGr.name + ""]);
                coverageTitle = SNC.GlideHTMLSanitizer.sanitize(coverageTitle);
            }

            coverageDateSpans.forEach(function(coverage) {
                var coverageSpan = {
                    "title": coverageTitle,
                    "color": that.colors['override'].color,
                    "textColor": that.colors['override'].textColor,
                    "group_id": that.shiftGr.group + '',
                    "start": coverage.start.getDisplayValueInternal() + "",
                    "end": coverage.end.getDisplayValueInternal() + "",
                    "type": 'override',
                    "roster_id": rosterGr.getUniqueValue() + "",
                    "roster_name": rosterGr.name + "",
                    "order": rosterGr.order + "",
                    "table": rosterSpanGr.getTableName(),
                    "sys_id": rosterSpanGr.sys_id + "",
                    "rota_id": that.shiftGr.sys_id + "",
                    "actual_start_date": coverage.start.getDisplayValueInternal() + "",
                    "actual_end_date": coverage.end.getDisplayValueInternal() + "",
                    "startNumeric": coverage.start.getNumericValue() + "",
                    "endNumeric": coverage.end.getNumericValue() + "",
                    "all_day": false
                };
                that._populateUserDetails(coverageSpan, rosterSpanGr.user + '');
                that.formatter.formatEvent(coverageSpan);
                rosterSpans.push(coverageSpan);
            });

        }

        // Timeoff span handling
        var timeOffs = {};
        var cacheKey = calendarStartGDT.getValue() + calendarEndGDT.getValue();
        if (processedUserTimeOffs[cacheKey] && processedUserTimeOffs[cacheKey][this.getShiftGroupId()]) {
            timeOffs = processedUserTimeOffs[cacheKey][this.getShiftGroupId()];
        } else if (this.groupMembers.length) {
            if (!processedUserTimeOffs[cacheKey])
                processedUserTimeOffs[cacheKey] = {};

            rosterSpanGr = new GlideRecord("roster_schedule_span");
            var query = "group=" + this.getShiftGroupId();
            encQuery = this._getDateLimitedEncQuery(query + "^type=time_off^ORtype=time_off_in_approval", calendarStartGDT, calendarEndGDT);
            rosterSpanGr.addEncodedQuery(encQuery);
            rosterSpanGr.query();

            while (rosterSpanGr.next()) {
                if (this.groupMembers.indexOf(rosterSpanGr.user + '') == -1)
                    continue;
                if (!timeOffs[rosterSpanGr.user + '']) {
                    timeOffs[rosterSpanGr.user + ''] = [];
                }

                var userGr = this._getUser(rosterSpanGr.user + '');
                var userGr;
                if (!that.excludeUserDetails) {
                    userGr = this._getUser(rosterSpanGr.user + '');
                }
                var timeoffDateSpans = that._getScheduleSpans(calendarStartGDT, calendarEndGDT, rosterSpanGr);

                timeoffDateSpans.forEach(function(timeoff) {
                    if (rosterSpanGr.type == 'time_off')
                        timeOffs[rosterSpanGr.user + ''].push(timeoff);

                    var spanTitle;
                    if (!that.excludeUserDetails) {
                        if (rosterSpanGr.type == 'time_off')
                            spanTitle = gs.getMessage("{0} (Time off)", [userGr.name + '']);
                        else
                            spanTitle = gs.getMessage("{0} (Time off - In approval)", [userGr.name + '']);
                        spanTitle = SNC.GlideHTMLSanitizer.sanitize(spanTitle);
                    }
                    var timeOffSpan = {
                        "title": spanTitle,
                        "color": that.colors[rosterSpanGr.type + ''].color,
                        "textColor": that.colors[rosterSpanGr.type + ''].textColor,
                        "group_id": that.shiftGr.group + '',
                        "start": timeoff.start.getDisplayValueInternal() + "",
                        "end": timeoff.end.getDisplayValueInternal() + "",
                        "type": rosterSpanGr.type == 'time_off' ? 'timeoff' : 'time_off_in_approval',
                        "table": rosterSpanGr.getTableName(),
                        "sys_id": rosterSpanGr.sys_id + "",
                        "rota_id": that.shiftGr.sys_id + "",
                        "actual_start_date": timeoff.start.getDisplayValueInternal() + "",
                        "actual_end_date": timeoff.end.getDisplayValueInternal() + "",
                        "startNumeric": timeoff.start.getNumericValue() + "",
                        "endNumeric": timeoff.end.getNumericValue() + "",
                        "all_day": false
                    };
                    if (rosterSpanGr.roster + "" && rosterSpanGr.roster.order + "")
                        timeOffSpan.order = parseInt(rosterSpanGr.roster.order + "", 10);
                    else
                        timeOffSpan.order = 999999;
                    that._populateUserDetails(timeOffSpan, rosterSpanGr.user + '');
                    that.formatter.formatEvent(timeOffSpan);
                    rosterSpans.push(timeOffSpan);
                });
            }

            processedUserTimeOffs[cacheKey][this.getShiftGroupId()] = timeOffs;
        }

        var rosterStartTimeStr = rosterGr.rotation_start_time + "";
        var rotationStartTime = rosterStartTimeStr.substring(0, 2) + ":" + rosterStartTimeStr.substring(2, 4) + ":" + rosterStartTimeStr.substring(4, 6);


        for (var i = 0; i < rotationPayload.memberPlans.plans.length; i++) {
            var memberPlan = rotationPayload.memberPlans.plans[i];
            var previousMemberPlan = rotationPayload.memberPlans.plans[i - 1];

            if (!this._isMemberPlanInCalendarRange(memberPlan.start, memberPlan.end, calendarStartGDT, calendarEndGDT, rotationStartTime)) {

                // Compute lastOnCallMember of member plan if already populated
                if (memberPlan.end && typeof memberPlan.lastOnCallMember === 'undefined') {

                    var memberPlanEndGDT = new GlideDateTime();
                    memberPlanEndGDT.setTimeZone(this._getShiftScheduleTimezone());
                    memberPlanEndGDT.setDisplayValueInternal(memberPlan.end + " " + rotationStartTime);
                    memberPlanEndGDT.addSeconds(86399); //(23 * 60 * 60) + (59 * 60) + 59;

                    var dayBeforeMemberPlanEndGDT = new GlideDateTime(memberPlanEndGDT);
                    dayBeforeMemberPlanEndGDT.addDays(-1);
                    this._processMemberPlan(rosterGr, rotationPayload, dayBeforeMemberPlanEndGDT, memberPlanEndGDT, memberPlan, previousMemberPlan, rotationPayload.memberPlans.member_sys_ids, coverages, timeOffs);
                }
                continue;
            }
            rosterSpans = rosterSpans.concat(this._processMemberPlan(rosterGr, rotationPayload, calendarStartGDT, calendarEndGDT, memberPlan, previousMemberPlan, rotationPayload.memberPlans.member_sys_ids, coverages, timeOffs));
        }

        if (rotationPayload && rotationPayload['memberSpanCache'])
            delete rotationPayload['memberSpanCache'].spansMap;
        rosterGr.rotation_payload = JSON.stringify(rotationPayload);
        rosterGr.update();

        return rosterSpans;
    },

    _reorderMembersForContinuity: function(memberPlan, previousPlan, memberSysIds) {
        var that = this;
        if (!previousPlan || !previousPlan.lastOnCallMember)
            return memberPlan.members_in_order;
        var head = [];
        var tail = [];
        var itemFound = false;
        memberPlan.members_in_order.forEach(function(memberIndex) {
            if (itemFound) {
                head.push(memberIndex);
            } else {
                var currentMember = that._getRosterMember(memberSysIds[memberIndex]);
                var lastOnCallMember = that._getRosterMember(previousPlan.lastOnCallMember);
                if (currentMember && lastOnCallMember && currentMember.member == lastOnCallMember.member) {
                    itemFound = true;
                }
                tail.push(memberIndex);
            }
        });
        return head.concat(tail);
    },

    _getScheduleSpans: function(calendarStartGDT, calendarEndGDT, cmnScheduleSpanGr) {

        var rosterScheduleTimezone = '';
        var scheduleSysId = cmnScheduleSpanGr.getValue("schedule");
        if (scheduleSysId) {
            this.setInCacheIfEmpty(this.cache, "_scheduleTimeZone");
            if (this.cache._scheduleTimeZone[scheduleSysId]) {
                rosterScheduleTimezone = this.cache._scheduleTimeZone[scheduleSysId];
            } else {
                rosterScheduleTimezone = cmnScheduleSpanGr.schedule.time_zone + '';
                this.cache._scheduleTimeZone[scheduleSysId] = rosterScheduleTimezone;
            }
        }

        var page = new GlideAJAXSchedulePage(new GlideScheduleDateTime(calendarStartGDT), new GlideScheduleDateTime(calendarEndGDT), rosterScheduleTimezone);
        page.addScheduleSpan(cmnScheduleSpanGr, rosterScheduleTimezone, '', '');

        var items = page.getItems();
        var result = [];
        for (var i = 0; i < items.size(); i++) {
            var item = items.get(i);
            var spans = item.getTimeSpans();

            for (var j = 0; j < spans.size(); j++) {

                var span = spans.get(j);
                var spanStartGDT = span.getStart().getGlideDateTime();
                var spanEndGDT = span.getEnd().getGlideDateTime();

                result.push({
                    start: spanStartGDT,
                    end: spanEndGDT
                });
            }
        }

        return result;
    },

    _applyTimeZone: function(sdt, timeZone) {
        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[_applyTimeZone] sdt: " + sdt + " timeZone: " + timeZone);

        var sdtTZ = new GlideScheduleDateTime();
        sdtTZ.setValue(sdt);
        sdtTZ.setTimeZone(timeZone);
        sdtTZ.setTimeZone("Etc/UTC");

        return sdtTZ;
    },

    _isMemberPlanInCalendarRange: function(memberPlanStart, memberPlanEnd, calendarStartGDT, calendarEndGDT, rotationStartTime) {
        var memberStartNumeric = this.START_EPOCH;
        if (memberPlanStart) {
            var memberPlanStartGDT = new GlideDateTime();
            memberPlanStartGDT.setTimeZone(this._getShiftScheduleTimezone());
            memberPlanStartGDT.setDisplayValueInternal(memberPlanStart + " " + rotationStartTime);
            memberStartNumeric = memberPlanStartGDT.getNumericValue();
        }

        var memberEndNumeric = this.END_EPOCH;
        if (memberPlanEnd) {
            var memberPlanEndGDT = new GlideDateTime();
            memberPlanEndGDT.setTimeZone(this._getShiftScheduleTimezone());
            memberPlanEndGDT.setDisplayValueInternal(memberPlanEnd + " " + rotationStartTime);
            memberPlanEndGDT.addSeconds(86399); //(23 * 60 * 60) + (59 * 60) + 59;
            memberEndNumeric = memberPlanEndGDT.getNumericValue();
        }

        var calendarStartNumeric = calendarStartGDT.getNumericValue();
        var calendarEndNumeric = calendarEndGDT.getNumericValue();
        return Math.max(memberStartNumeric, calendarStartNumeric) <= Math.min(memberEndNumeric, calendarEndNumeric);
    },

    _isSpanContains: function(parentSpan, childSpan) {
        var parentStartGDT = parentSpan.start.getGlideDateTime();
        var parentEndGDT = parentSpan.end.getGlideDateTime();
        var childStartGDT = childSpan.start.getGlideDateTime();
        var childEndGDT = childSpan.end.getGlideDateTime();
        if (childStartGDT > parentEndGDT || childStartGDT < parentStartGDT || childEndGDT > parentEndGDT || childEndGDT < parentStartGDT) return false;
        return true;
    },

    _processMemberPlan: function(rosterGr, rotationPayload, calendarStartGDT, calendarEndGDT, memberPlan, previousMemberPlan, memberSysIds, coverages, timeOffs) {
        var that = this;
        var calendarStartSDT = new GlideScheduleDateTime(calendarStartGDT);
        var calendarEndSDT = new GlideScheduleDateTime(calendarEndGDT);
        calendarStartSDT.setTimeZone(this._getShiftScheduleTimezone());
        calendarEndSDT.setTimeZone(this._getShiftScheduleTimezone());

        var nowGDT = new GlideDateTime();
        var rosterStartTimeStr = rosterGr.rotation_start_time + "";
        var rotationStartTime = rosterStartTimeStr.substring(0, 2) + ":" + rosterStartTimeStr.substring(2, 4) + ":" + rosterStartTimeStr.substring(4, 6);
        var memberPlanEndDateInCalendarRange = false;
        // Rotation start date time
        var scheduleStart;
        var rosterStart = new GlideDateTime();
        rosterStart.setTimeZone(this._getShiftScheduleTimezone());
        rosterStart.setDisplayValueInternal(this._getInternalFormatDate(rosterGr.getValue('rotation_start_date')) + " " + rotationStartTime);

        var memberPlanStart = new GlideDateTime();
        memberPlanStart.setTimeZone(this._getShiftScheduleTimezone());
        memberPlanStart.setDisplayValueInternal(memberPlan.start + " " + rotationStartTime);
        var cacheLimitInDays = (rosterGr.rotation_interval_type + "" === "monthly") ? 720 : 360;
        var lastUpdatedMonthGdt = null;

        try {
            if (rotationPayload['cache']) {
                var dates = Object.keys(rotationPayload['cache']);
                dates = dates.sort(function(a, b) {
                    return b - a;
                });
                var calendarStartSplitDate = calendarStartGDT.getValue().split('-');
                calendarStartSplitDate = parseInt(calendarStartSplitDate[0] + "" + calendarStartSplitDate[1]);

                var cacheDate;

                for (var i = 0; i < dates.length; i++) {
                    if (parseInt(dates[i]) < parseInt(calendarStartSplitDate)) {
                        cacheDate = dates[i];
                        break;
                    }
                }
                if (cacheDate) {
                    var cacheDateGDT = new GlideDateTime(rotationPayload['cache'][cacheDate]);
                    lastUpdatedMonthGdt = cacheDateGDT;
                    if (!memberPlan.start || cacheDateGDT > memberPlanStart) {
                        scheduleStart = cacheDateGDT;
                    }
                }
                // Remove cache entries older than 12 months and more than 1 month in to future
                for (var j = 0; j < dates.length; j++) {
                    var currentCacheDate = dates[j];
                    var currentCacheDateGDT = new GlideDateTime();
                    currentCacheDateGDT.setDisplayValueInternal(rotationPayload['cache'][currentCacheDate]);
                    currentCacheDateGDT.setTimeZone(this._getShiftScheduleTimezone());
                    var diffFromToday = this._diffInDays(nowGDT, currentCacheDateGDT);
                    if (diffFromToday < -cacheLimitInDays || diffFromToday > 30) {
                        delete rotationPayload['cache'][currentCacheDate];
                    }
                }

            }

            if (!rotationPayload['memberSpanCache'])
                rotationPayload['memberSpanCache'] = {};

            if (typeof rotationPayload['memberSpanCache'].spans != "object")
                rotationPayload['memberSpanCache'].spans = [];

            rotationPayload['memberSpanCache'].spansMap = {};

            if (rotationPayload['memberSpanCache'].spans.length && (rosterGr.rotation_interval_type + "" != "monthly")) {
                rotationPayload['memberSpanCache'].spans = rotationPayload['memberSpanCache'].spans.filter(function(span) {
                    var diffFromToday = that._diffInDays(nowGDT, currentCacheDateGDT);
                    if (diffFromToday > -7 && diffFromToday < 30) {
                        rotationPayload['memberSpanCache'].spansMap[span[0] + span[1] + span[2]] = true;
                        return true;
                    }
                });
            }
        } catch (_error) {
            // If there is cache object issue, log and fall back to normal flow.
            gs.info("[_processMemberPlan] roster id: " + rosterGr.getUniqueValue() + " cache: " + JSON.stringify(rotationPayload['cache']));
        }

        if (!scheduleStart) {
            if (memberPlan.start) {
                scheduleStart = this._dateMax(memberPlanStart, rosterStart);
            } else if (!scheduleStart) {
                scheduleStart = rosterStart;
            }
        }
        var scheduleStartSDT = new GlideScheduleDateTime(scheduleStart);
        scheduleStartSDT.setTimeZone(this._getShiftScheduleTimezone());

        var scheduleEnd;
        var scheduleEndSDT;
        if (memberPlan.end) {
            scheduleEnd = new GlideDateTime();
            scheduleEnd.setTimeZone(this._getShiftScheduleTimezone());
            scheduleEnd.setDisplayValueInternal(memberPlan.end + " " + rotationStartTime);
            scheduleEnd.addSeconds(86399); //(23 * 60 * 60) + (59 * 60) + 59;
            if (calendarEndGDT < scheduleEnd) {
                scheduleEnd = calendarEndGDT;
            } else {
                memberPlanEndDateInCalendarRange = true;
            }
        } else {
            scheduleEnd = calendarEndGDT;
        }

        scheduleEndSDT = new GlideScheduleDateTime(scheduleEnd);
        scheduleEndSDT.setTimeZone(this._getShiftScheduleTimezone());

        var rosterSpans = [];
        var memberIds = this._reorderMembersForContinuity(memberPlan, previousMemberPlan, memberSysIds);
        var previousSpan = null;
        var previousMemberIndex = null;
        var previousSpanWithOutExtraTime = null;
        var previousChangedSpan = null;
        var nextRotationDate = null;
        var memberIndex = 0,
            memberCount = 0;
        var rotationIntervalCount = parseInt(rosterGr.rotation_interval_count);
        var dowForRotate;
        if (!JSUtil.nil(rosterGr.dow_for_rotate)) {
            dowForRotate = parseInt(rosterGr.dow_for_rotate + '');
        } else {
            dowForRotate = this._computeDayOfWeekForRotation(rosterGr, rosterStart);
        }

        // User spans handling
        if (!this._localCache._scheduleItems) {
            this._localCache._scheduleItems = {};
        }
        var cacheKey = scheduleStartSDT.getValue() + scheduleEndSDT.getValue() + this._getShiftScheduleTimezone() + this.getShiftScheduleId() + "true";
        var items;
        if (this._localCache._scheduleItems[cacheKey]) {
            items = this._localCache._scheduleItems[cacheKey];
        } else {
            var page = new GlideAJAXSchedulePage(scheduleStartSDT, scheduleEndSDT, this._getShiftScheduleTimezone());
            items = page.addSchedule(this.getShiftScheduleId(), '', '');
            this._localCache._scheduleItems[cacheKey] = items;
        }

        var memberSpans = [];
        for (var i = 0; i < items.size(); i++) {
            var item = items.get(i);
            var spans = item.getTimeSpans();

            var nextRotationStartGDT = new GlideDateTime(scheduleStartSDT.getGlideDateTime());
            nextRotationStartGDT.setTimeZone(this._getShiftScheduleTimezone());

            for (var j = 0; j < spans.size(); j++) {
                var span = spans.get(j);
                var spanStartGDT = span.getStart().getGlideDateTime();
                var spanEndGDT = span.getEnd().getGlideDateTime();

                if (item.getType() == 'exclude') {
                    memberSpans.push({
                        span: span,
                        item: item
                    });
                    continue;
                }


                while (nextRotationStartGDT <= spanStartGDT) {
                    nextRotationStartGDT.addDaysLocalTime(1);
                    // Always rotate on rotation start time
                    var nextRotationStartDateStr = nextRotationStartGDT.getDisplayValueInternal().split(" ")[0];
                    nextRotationStartGDT.setDisplayValueInternal(nextRotationStartDateStr + " " + rotationStartTime);
                }

                var nextStartGDT = new GlideDateTime(spanStartGDT);
                nextStartGDT.setTimeZone(that._getShiftScheduleTimezone());
                var nextEndGDT = new GlideDateTime(nextRotationStartGDT);
                nextEndGDT.setTimeZone(that._getShiftScheduleTimezone());
                while (nextEndGDT < spanEndGDT) {
                    nextEndGDT.addSeconds(-1);
                    var startSpan = new GlideScheduleDateTime(nextStartGDT);
                    startSpan.setTimeZone(that._getShiftScheduleTimezone());
                    var endSpan = new GlideScheduleDateTime(nextEndGDT);
                    endSpan.setTimeZone(that._getShiftScheduleTimezone());
                    var newSpan = new GlideScheduleDateTimeSpan(startSpan, endSpan);

                    memberSpans.push({
                        span: newSpan,
                        item: item
                    });

                    nextStartGDT = new GlideDateTime(nextRotationStartGDT);
                    nextStartGDT.setTimeZone(that._getShiftScheduleTimezone());

                    nextRotationStartGDT.addDaysLocalTime(1);
                    // Always rotate on rotation start time
                    var nextRotationStartDateStr = nextRotationStartGDT.getDisplayValueInternal().split(" ")[0];
                    nextRotationStartGDT.setDisplayValueInternal(nextRotationStartDateStr + " " + rotationStartTime);

                    nextEndGDT = new GlideDateTime(nextRotationStartGDT);
                    nextEndGDT.setTimeZone(that._getShiftScheduleTimezone());
                }
                if (nextEndGDT >= spanEndGDT) {
                    var startSpan = new GlideScheduleDateTime(nextStartGDT);
                    startSpan.setTimeZone(that._getShiftScheduleTimezone());
                    var endSpan = new GlideScheduleDateTime(spanEndGDT);
                    endSpan.setTimeZone(that._getShiftScheduleTimezone());
                    var newSpan = new GlideScheduleDateTimeSpan(startSpan, endSpan);

                    memberSpans.push({
                        span: newSpan,
                        item: item
                    });
                }
            }
        }

        memberSpans.sort(function(spanA, spanB) {
            return spanA.span.compareTo(spanB.span);
        });

        var preprocessedInRangeSpans = [];
        memberSpans.forEach(function(spanObj) {
            var span = spanObj.span;
            if (!nextRotationDate && rosterGr.rotation_interval_type + "" === "monthly")
                nextRotationDate = that._getNextRotationDate(rosterGr, span.getStart().getGlideDateTime(), rotationStartTime, lastUpdatedMonthGdt);
            if (previousSpan && spanObj.item.getType() + "" !== 'exclude') {
                if (that._isSpanContains(previousSpan, span)) return;
                if (rosterGr.rotation_interval_type + "" === "daily" && that._isRotationTimeBetween(previousChangedSpan.getStart().getGlideDateTime(), span.getStart().getGlideDateTime(), rotationStartTime)) {
                    var previousSpanEndGDT = new GlideDateTime(previousSpan.getEnd().getGlideDateTime());
                    previousSpanEndGDT.addSeconds(-1); // To manage shift starting and ending at same time (like 7am to 7am)
                    var intervalInDays = Math.ceil(that._diffInDaysWithDST(previousChangedSpan.getStart().getGlideDateTime(), previousSpanEndGDT));
                    memberCount = memberCount + intervalInDays;
                    previousChangedSpan = span;
                }

                if (rosterGr.rotation_interval_type + "" === "weekly" && that._isRotationDayBetween(previousChangedSpan.getStart().getGlideDateTime(), span.getStart().getGlideDateTime(), rotationStartTime, dowForRotate) && previousSpanWithOutExtraTime) {
                    var intervalInWeeks = Math.ceil(that._diffInDaysWithDST(previousChangedSpan.getStart().getGlideDateTime(), previousSpanWithOutExtraTime.getEnd().getGlideDateTime()) / 7);
                    memberCount = memberCount + intervalInWeeks;
                    previousChangedSpan = span;
                }

                if (rosterGr.rotation_interval_type + "" === "monthly") {
                    if (that._isRotationDayForMonthly(nextRotationDate, span.getStart().getGlideDateTime(), rotationStartTime, lastUpdatedMonthGdt, rosterGr) && previousSpanWithOutExtraTime) {
                        memberCount = memberCount + 1;
                        lastUpdatedMonthGdt = span.getStart().getGlideDateTime();
                    }
                }
            }


            if (spanObj.item.getType() + "" !== 'exclude') {

                if (spanObj.item.getTable() + "" !== "roster_schedule_span") {
                    previousSpanWithOutExtraTime = span;
                }
                previousSpan = span;
                if (!previousChangedSpan) {
                    previousChangedSpan = span;
                }

                memberIndex = (parseInt(memberCount / rotationIntervalCount)) % memberIds.length;


                // Cache handling
                if (memberIndex == 0 && previousMemberIndex != memberIndex) {
                    var spanStartDate = span.getStart().getGlideDateTime().getValue();
                    var spanStartSplit = spanStartDate.split("-");
                    var spanStartYear = spanStartSplit[0];
                    var spanStartMonth = spanStartSplit[1];
                    if (!rotationPayload['cache']) {
                        rotationPayload['cache'] = {};
                    }
                    var diffFromToday = that._diffInDays(nowGDT, span.getStart().getGlideDateTime());
                    // Only cache entries 12 months into past and 1 month into future
                    if (diffFromToday > -cacheLimitInDays && diffFromToday < 30 && !rotationPayload['cache'][parseInt(spanStartYear + "" + spanStartMonth)]) {
                        var spanStartGDT = span.getStart().getGlideDateTime();
                        spanStartGDT.setTimeZone("GMT");
                        rotationPayload['cache'][parseInt(spanStartYear + "" + spanStartMonth)] = spanStartGDT.getDisplayValueInternal();
                    }
                }

                previousMemberIndex = memberIndex;

                if (typeof rotationPayload['memberSpanCache'].spans == 'object' && rosterGr.rotation_interval_type + "" != "monthly") {
                    var diffFromToday = that._diffInDays(nowGDT, span.getStart().getGlideDateTime());

                    // Store cached dates in GMT
                    var spanStartGDTValue = span.getStart().getGlideDateTime();
                    spanStartGDTValue.setTimeZone("GMT");
                    var spanStartStr = spanStartGDTValue.getDisplayValueInternal();

                    var spanEndGDTValue = span.getEnd().getGlideDateTime();
                    spanEndGDTValue.setTimeZone("GMT");
                    var spanEndStr = spanEndGDTValue.getDisplayValueInternal();

                    if (diffFromToday >= -7 && diffFromToday <= 30 &&
                        !rotationPayload['memberSpanCache'].spansMap[spanStartStr + spanEndStr + memberIds[memberIndex]]) {
                        rotationPayload['memberSpanCache'].spans.push(
                            [spanStartStr, spanEndStr, memberIds[memberIndex]]
                        );
                        rotationPayload['memberSpanCache'].spansMap[spanStartStr + spanEndStr + memberIds[memberIndex]] = true;
                    }

                }

                if (that._areIntervalsOverlapping({
                        start: span.getStart().getGlideDateTime(),
                        end: span.getEnd().getGlideDateTime()
                    }, calendarStartGDT, calendarEndGDT)) {

                    var memberGr = that._getRosterMember(memberSysIds[memberIds[memberIndex]] + "");
                    var memberJson = that.getMemberIds();
                    if (memberJson[memberGr.sys_id + ""]) {
                        var memberSpanInRange = {
                            span: span,
                            memberGr: memberGr
                        };
                        if (preprocessedInRangeSpans.length &&
                            that._canJoinSpan(memberSpanInRange, preprocessedInRangeSpans[preprocessedInRangeSpans.length - 1])) {
                            var oldProcessSpan = preprocessedInRangeSpans[preprocessedInRangeSpans.length - 1];
                            oldProcessSpan.span = new GlideScheduleDateTimeSpan(oldProcessSpan.span.getStart(), span.getEnd());
                        } else {
                            preprocessedInRangeSpans.push(memberSpanInRange);
                        }
                    }
                }
            }


        });

        // Populate user data and exclude coverages and timeoffs
        preprocessedInRangeSpans.forEach(function(memberSpanInRange) {
            var memberGr = memberSpanInRange.memberGr;
            var span = memberSpanInRange.span;

            var userSpans = [{
                start: span.getStart().getGlideDateTime(),
                end: span.getEnd().getGlideDateTime()
            }];

            userSpans = that._excludeSpans(userSpans, coverages, span);

            var memberSpanTitle;

            if (!that.excludeUserDetails) {
                var userGr = that._getUser(memberGr.member + "");
                memberSpanTitle = gs.getMessage("{0} ({1})", [userGr.name + "", rosterGr.getValue("name")]);
                memberSpanTitle = SNC.GlideHTMLSanitizer.sanitize(memberSpanTitle);
            }

            var memberObj = {
                "title": memberSpanTitle,
                "color": that.colors['roster'].color,
                "textColor": that.colors['roster'].textColor,
                "group_id": that._getMemberGroups(memberGr.member + ''),
                "engine": that.shiftGr.schedule_engine + "",
                "type": 'roster',
                "roster_id": rosterGr.getUniqueValue() + "",
                "roster_name": rosterGr.name + "",
                "order": rosterGr.order + "",
                "table": memberGr.getTableName() + "",
                "sys_id": memberGr.sys_id + "",
                "rota_id": that.shiftGr.sys_id + "",
                "description": gs.getMessage("On-call rotation"),
                "actual_start_date": span.getStart().getGlideDateTime().getDisplayValueInternal() + "",
                "actual_end_date": span.getEnd().getGlideDateTime().getDisplayValueInternal() + "",
                "all_day": (span.getOriginTimeSpan() ? that._isSpanAllDay(span.getOriginTimeSpan()) : false)
            };

            that._populateUserDetails(memberObj, memberGr.member + '');

            var memberSpansBeforeExclude = [];

            for (var uIndex = 0; uIndex < userSpans.length; uIndex++) {
                var userSpan = userSpans[uIndex];
                var member = Object.assign({}, memberObj);
                that._populateSpanDates(member, userSpan, calendarStartSDT, calendarEndSDT);
                that.formatter.formatEvent(member);
                memberSpansBeforeExclude.push(member);
            }

            that.setMemberSpansBeforeExclude(that.getMemberSpansBeforeExclude().concat(memberSpansBeforeExclude));

            if (that.getExcludeTimeOff()) {
                userSpans = that._excludeSpans(userSpans, timeOffs[memberGr.member + ''] || [], span);
            }

            for (uIndex = 0; uIndex < userSpans.length; uIndex++) {
                userSpan = userSpans[uIndex];
                member = Object.assign({}, memberObj);
                that._populateSpanDates(member, userSpan, calendarStartSDT, calendarEndSDT);
                that.formatter.formatEvent(member);
                rosterSpans.push(member);
            }
        });

        if (memberPlanEndDateInCalendarRange) {
            if (typeof memberPlan.lastOnCallMember === 'undefined') {
                if (rosterSpans.length) {
                    memberPlan.lastOnCallMember = rosterSpans[rosterSpans.length - 1].sys_id;
                } else {
                    memberPlan.lastOnCallMember = null;
                }
            }
        }

        return rosterSpans;
    },

    _populateSpanDates: function(member, userSpan, calendarStartSDT, calendarEndSDT) {
        var startGDT = userSpan.start;
        var endGDT = userSpan.end;
        if (userSpan.start.getNumericValue() < calendarStartSDT.getGlideDateTime().getNumericValue()) {
            startGDT = calendarStartSDT.getGlideDateTime();
        }
        if (userSpan.end.getNumericValue() > calendarEndSDT.getGlideDateTime().getNumericValue()) {
            endGDT = calendarEndSDT.getGlideDateTime();
        }
        member["start"] = startGDT.getDisplayValueInternal() + "";
        member["end"] = endGDT.getDisplayValueInternal() + "";
        member["startNumeric"] = startGDT.getNumericValue() + "";
        member["endNumeric"] = endGDT.getNumericValue() + "";
    },

    _getInternalFormatDate: function(dateDisplayValueString) {
        return dateDisplayValueString.substring(0, 4) + "-" + dateDisplayValueString.substring(4, 6) + "-" + dateDisplayValueString.substring(6, 8);
    },

    _canJoinSpan: function(currentSpan, previousSpan) {
        if (currentSpan.memberGr.getUniqueValue() == previousSpan.memberGr.getUniqueValue() &&
            currentSpan.span.start.getGlideDateTime().getNumericValue() - previousSpan.span.end.getGlideDateTime().getNumericValue() <= 1000)
            return true;
    },

    _populateUserDetails: function(spanObj, userSysId) {
        if (this.excludeUserDetails)
            return;

        var userGr = this._getUser(userSysId);
        var memberEmail = (!this.checkAccess || userGr.email.canRead()) ? userGr.email + '' : '';
        var memberPhone = '';
        if (!this.checkAccess) {
            memberPhone = (userGr.mobile_phone + '' != '') ? userGr.mobile_phone + '' : userGr.phone + '';
        } else if ((userGr.mobile_phone + '' != '') && userGr.mobile_phone.canRead()) {
            memberPhone = userGr.mobile_phone + '';
        } else if (userGr.phone.canRead()) {
            memberPhone = userGr.phone + '';
        }

        spanObj.user_id = userGr.getUniqueValue() + "";
        spanObj.user_name = userGr.name + "";
        spanObj.user_active = userGr.active == "1";
        spanObj.user_email = memberEmail;
        spanObj.user_contact_number = memberPhone;
    },

    _getMemberGroups: function(userSysId) {
        var groupSysIds = {};
        if (this.groupMembers.includes(userSysId)) {
            return this.getShiftGroupId();
        }
        return '';
    },

    _getEventBgColor: function(rotaId, type) {
        var ajaxSchedulePage = new GlideAJAXSchedulePage();

        if (this._log.atLevel(GSLog.DEBUG))
            this.timer.start("[_getEventBgColor]");

        if (type === "rota") {
            var rotaPalleteDarkColor = new OCCalendarUtils().getPalleteDarkColors(ajaxSchedulePage.getColor(rotaId));
            eventBgColor = (rotaPalleteDarkColor) ? rotaPalleteDarkColor : ajaxSchedulePage.darkenColor(ajaxSchedulePage.getColor(rotaId));
        } else
            eventBgColor = ajaxSchedulePage.getColor(rotaId);

        if (this._log.atLevel(GSLog.DEBUG))
            this.timer.stop("[_getEventBgColor]");

        return eventBgColor;
    },

    _excludeSpans: function(userSpans, coverages, actualSpan) {
        var matches = [];
        for (var i in coverages) {
            if (this._areIntervalsOverlapping(coverages[i], actualSpan.getStart().getGlideDateTime(), actualSpan.getEnd().getGlideDateTime())) {
                matches.push(coverages[i]);
            }
        }

        if (!matches.length)
            return userSpans;

        matches.sort(function(spanA, spanB) {
            return spanA.start.compareTo(spanB.start);
        });

        for (var i = 0; i < matches.length; i++) {
            var coverage = matches[i];
            var newSpans = [];
            var that = this;
            userSpans.forEach(function(span) {
                newSpans = newSpans.concat(that._excludeSpan(span, coverage));
            });
            userSpans = newSpans;
        }

        return userSpans;
    },

    _excludeSpan: function(span, excludeSpan) {
        if (!this._areIntervalsOverlapping(excludeSpan, span.start, span.end)) {
            return [span];
        } else if (excludeSpan.start <= span.start && excludeSpan.end >= span.end) {
            return [];
        } else if (excludeSpan.start <= span.start && (excludeSpan.end >= span.start && excludeSpan.end < span.end)) {
            return [{
                start: excludeSpan.end,
                end: span.end
            }];
        } else if ((excludeSpan.start > span.start && excludeSpan.start <= span.end) && (excludeSpan.end >= span.end)) {
            return [{
                start: span.start,
                end: excludeSpan.start
            }];
        } else {
            return [{
                start: span.start,
                end: excludeSpan.start
            }, {
                start: excludeSpan.end,
                end: span.end
            }];
        }
    },


    _getDateLimitedEncQuery: function(limitedBy, startDateTime, endDateTime) {
        var and = "^";
        var or = "^NQ";
        startDateTime = this._formatDateStr(startDateTime.getUTCValue());
        endDateTime = this._formatDateStr(endDateTime.getUTCValue());

        var startInEndIn = limitedBy + and + "start_date_time>=" + startDateTime + and + "end_date_time<=" + endDateTime;
        var startOutEndIn = limitedBy + and + "start_date_time<=" + startDateTime + and + "end_date_time>=" + startDateTime + and + "end_date_time<=" + endDateTime;
        var startInEndOut = limitedBy + and + "start_date_time>=" + startDateTime + and + "start_date_time<=" + endDateTime + and + "end_date_time>=" + endDateTime;
        var startOutEndOut = limitedBy + and + "start_date_time<=" + startDateTime + and + "end_date_time>=" + endDateTime;
        var repeatNotNull = limitedBy + and + "repeat_type!=null" + and + "repeat_until=00000000^ORrepeat_until=null^ORrepeat_until>=" + startDateTime.split("T")[0];
        var encQuery = startInEndIn + or + startOutEndIn + or + startInEndOut + or + startOutEndOut + or + repeatNotNull;
        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[_getDateLimitedEncQuery] encQuery: " + encQuery);
        return encQuery;
    },

    _formatDateStr: function(strDate) {
        strDate = strDate + "";
        strDate = strDate.replace(/\s+/g, "T");
        strDate = strDate.replace(/\-/g, "");
        strDate = strDate.replace(/\:/g, "");
        strDate += "Z";
        return strDate;
    },

    _computeDayOfWeekForRotation: function(rosterGr, rosterStart) {
        var lowestStartDate = this._findLowestStartDate(rosterGr.sys_id + "");
        if (lowestStartDate) {
            if (lowestStartDate > rosterStart) {
                return lowestStartDate.getDayOfWeekUTC();
            }
        }

        return rosterStart.getDayOfWeekLocalTime();
    },

    _convertToGlideDate: function(dateStr) {
        if (!dateStr)
            gs.error("Invalid dateStr object");
        var dateValue = dateStr.substring(0, 4) + "-" + dateStr.substring(4, 6) + "-" + dateStr.substring(6, 8);
        var gd = new GlideDate();
        gd.setValue(dateValue);
        return gd;
    },

    _diffInDays: function(gdt1, gdt2) {
        return (gdt2.getNumericValue() - gdt1.getNumericValue()) / 86400000;
    },

    _diffInDaysWithDST: function(gdt1, gdt2) {
        gdt1.setTimeZone(this._getShiftScheduleTimezone());
        gdt2.setTimeZone(this._getShiftScheduleTimezone());
        return (gdt2.getNumericValue() - gdt1.getNumericValue() + gdt2.getDSTOffset() - gdt1.getDSTOffset()) / 86400000;
    },

    _dateMax: function(gdt1, gdt2) {
        return gdt1 > gdt2 ? gdt1 : gdt2;
    },

    _dateMin: function(gdt1, gdt2) {
        return gdt1 < gdt2 ? gdt1 : gdt2;
    },

    _findLowestStartDate: function(rosterId) {
        var gr = new GlideRecord("cmn_rota_member");
        gr.addQuery('roster', rosterId);
        gr.query();
        var minStartDate = null;
        while (gr.next()) {
            if (JSUtil.nil(gr.from)) return null;

            var fromGd = new GlideDate();
            fromGd.setValue(gr.from + '');
            if (minStartDate == null || fromGd < minStartDate) {
                minStartDate = fromGd;
            }
        }
        return minStartDate;
    },

    _isRotationTimeBetween: function(previousGdt, currentGdt, rotationStartTime) {
        var indexDate = new GlideDateTime();
        indexDate.setTimeZone(this._getShiftScheduleTimezone());
        indexDate.setDisplayValueInternal(previousGdt.getDisplayValueInternal().split(" ")[0] + " " + rotationStartTime);

        while (indexDate <= currentGdt) {
            if (previousGdt < indexDate && indexDate <= currentGdt)
                return true;
            indexDate.addDaysLocalTime(1);
            // Always rotate on rotation start time
            var indexDateStr = indexDate.getDisplayValueInternal().split(" ")[0];
            indexDate.setDisplayValueInternal(indexDateStr + " " + rotationStartTime);
        }

        return false;
    },

    _isRotationDayBetween: function(previousGdt, currentGdt, rotationStartTime, dowRotate) {
        var indexDate = new GlideDateTime();
        indexDate.setTimeZone(this._getShiftScheduleTimezone());
        indexDate.setDisplayValueInternal(previousGdt.getDisplayValueInternal().split(" ")[0] + " " + rotationStartTime);

        while (indexDate <= currentGdt) {
            if (previousGdt < indexDate && indexDate <= currentGdt && indexDate.getDayOfWeekLocalTime() == dowRotate)
                return true;
            indexDate.addDaysLocalTime(1);
            // Always rotate on rotation start time
            var indexDateStr = indexDate.getDisplayValueInternal().split(" ")[0];
            indexDate.setDisplayValueInternal(indexDateStr + " " + rotationStartTime);
        }
        return false;
    },

    _getRotationDay: function(rosterGr, currentGdt) {
        var monthlyRotationType = rosterGr.getValue('rotation_start_dom_type');
        var rotationDay;
        if (monthlyRotationType == 'specific_day') {
            rotationDay = parseInt(Math.min(rosterGr.getValue("rotation_start_dom"), currentGdt.getDaysInMonthLocalTime()));
        } else if (monthlyRotationType == 'last_working_day_of_month') {
            rotationDay = currentGdt.getDaysInMonthLocalTime();
        }
        return rotationDay;
    },

    _getNextRotationDate: function(rosterGr, currentGdt, rotationStartTime, lastUpdatedMonthGdt) {
        var nextMonthRotationGDT = new GlideDateTime();
        nextMonthRotationGDT.setTimeZone(this._getShiftScheduleTimezone());
        nextMonthRotationGDT.setDisplayValueInternal(currentGdt.getDisplayValueInternal().split(" ")[0] + " " + rotationStartTime);
        nextMonthRotationGDT.setDayOfMonthLocalTime(this._getRotationDay(rosterGr, nextMonthRotationGDT));
        nextMonthRotationGDT.setTimeZone(this._getShiftScheduleTimezone());
        if (currentGdt > nextMonthRotationGDT || (lastUpdatedMonthGdt == null && currentGdt.compareTo(nextMonthRotationGDT) == 0)) {
            nextMonthRotationGDT.addMonthsLocalTime(1);
        }
        return nextMonthRotationGDT;
    },

    _isRotationDayForMonthly: function(nextRotationGdt, currentGdt, rotationStartTime, lastUpdatedMonthGdt, rosterGr) {
        var nextMonthRotationGDT = new GlideDateTime();
        nextMonthRotationGDT.setTimeZone(this._getShiftScheduleTimezone());
        nextMonthRotationGDT.setDisplayValueInternal(currentGdt.getDisplayValueInternal().split(" ")[0] + " " + rotationStartTime);
        nextMonthRotationGDT.setDayOfMonthLocalTime(this._getRotationDay(rosterGr, nextMonthRotationGDT));

        var previousMonthRotationGDT = new GlideDateTime();
        previousMonthRotationGDT.setTimeZone(this._getShiftScheduleTimezone());
        previousMonthRotationGDT.setDisplayValueInternal(currentGdt.getDisplayValueInternal().split(" ")[0] + " " + rotationStartTime);
        previousMonthRotationGDT.setDayOfMonthLocalTime(this._getRotationDay(rosterGr, previousMonthRotationGDT));

        if (nextMonthRotationGDT < currentGdt) {
            nextMonthRotationGDT.addMonthsLocalTime(1);
            nextMonthRotationGDT.setDayOfMonthLocalTime(this._getRotationDay(rosterGr, nextMonthRotationGDT));
        } else if (previousMonthRotationGDT > currentGdt) {
            previousMonthRotationGDT.addMonthsLocalTime(-1);
            previousMonthRotationGDT.setDayOfMonthLocalTime(this._getRotationDay(rosterGr, previousMonthRotationGDT));
        }
        if (lastUpdatedMonthGdt) {
            return (lastUpdatedMonthGdt < previousMonthRotationGDT) || (currentGdt >= nextMonthRotationGDT);
        }
        return (currentGdt >= nextRotationGdt || currentGdt >= nextMonthRotationGDT);
    },

    _isSpanAllDay: function(originSpan) {
        return (86400000 - (originSpan.getDuration()) <= 1000); // 24 hrs or 23:59:59
    },

    _isSpanMoreThanADay: function(start, end) {
        return end.getNumericValue() - start.getNumericValue() > 86400000;
    },

    _areIntervalsOverlapping: function(memberPlan, calendarStart, calendarEnd) {
        var memberStartNumeric = memberPlan.start ? new GlideDateTime(memberPlan.start).getNumericValue() : -1;
        var calendarStartNumeric = calendarStart ? new GlideDateTime(calendarStart).getNumericValue() : -1;
        var memberEndNumeric = memberPlan.end ? new GlideDateTime(memberPlan.end).getNumericValue() : 99999999999999;
        var calendarEndNumeric = calendarEnd ? new GlideDateTime(calendarEnd).getNumericValue() : 99999999999999;
        return Math.max(memberStartNumeric, calendarStartNumeric) < Math.min(memberEndNumeric, calendarEndNumeric);
    },

    _getUser: function(userSysId) {
        this.setInCacheIfEmpty(this.cache, "_userCache");
        if (!this.cache._userCache[userSysId]) {
            var userGr = new GlideRecord('sys_user');
            userGr.setWorkflow(false);
            userGr.get(userSysId);
            this.cache._userCache[userSysId] = userGr;
        }
        return this.cache._userCache[userSysId];
    },

    _getRosterMember: function(sysId) {
        this.setInCacheIfEmpty(this._localCache, "_memberCache");
        if (!this._localCache._memberCache[sysId]) {
            var member = new GlideRecord('cmn_rota_member');
            member.setWorkflow(false);
            member.get(sysId);
            this._localCache._memberCache[sysId] = member;
        }
        return this._localCache._memberCache[sysId];
    },

    type: 'OnCallSpansSNC'
};

OnCallSpansSNC.getMemberSpanFromRosterCache = function(rosterGr, gdt) {
    var result = {
        hasCache: false,
        memberSysId: null
    };

    try {
        var rotationPayload = JSON.parse(rosterGr.getValue('rotation_payload'));
        if (rotationPayload['memberPlans']) {
            var member_sys_ids = rotationPayload['memberPlans']['member_sys_ids'];
            var memberSpanCache = rotationPayload['memberSpanCache'];
            if (memberSpanCache && member_sys_ids && member_sys_ids.length && typeof memberSpanCache.spans == 'object') {
                var minStartGDT = null;
                var maxEndGDT = null;
                for (var i = 0; i < memberSpanCache.spans.length; i++) {
                    var spanStartGDT = new GlideDateTime();
                    spanStartGDT.setTimeZone("GMT");
                    spanStartGDT.setDisplayValueInternal(memberSpanCache.spans[i][0]);

                    var spanEndGDT = new GlideDateTime();
                    spanEndGDT.setTimeZone("GMT");
                    spanEndGDT.setDisplayValueInternal(memberSpanCache.spans[i][1]);

                    if (spanStartGDT <= gdt && gdt <= spanEndGDT) {
                        result.hasCache = true;
                        result.memberSysId = member_sys_ids[memberSpanCache.spans[i][2]];
                        return result;
                    }
                    if (!minStartGDT || minStartGDT > spanStartGDT) {
                        minStartGDT = spanStartGDT;
                    }
                    if (!maxEndGDT || maxEndGDT < spanEndGDT) {
                        maxEndGDT = spanEndGDT;
                    }
                }
                if (minStartGDT && maxEndGDT && minStartGDT <= gdt && gdt <= maxEndGDT) {
                    result.hasCache = true;
                }
            }
        }
    } catch (ex) {
        return result;
    }
    return result;
};
