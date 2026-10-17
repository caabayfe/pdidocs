var SSADeflectionAnalyticsServiceSNC = Class.create();
SSADeflectionAnalyticsServiceSNC.prototype = {
    initialize: function() {
        this.activityTypeRepId = {};
        this.patternRegExp = {};
        this.sequence = 1;
        this.windowObj = {};
        this.activityService = {};
        this.deflectionConfig = {};
    },

    /**
     * captures deflection metrics for a given deflection config id
     *
     * @param SysId:Deflection Configuration sys_id
     */
    captureDeflectionAnalytics: function(deflectionConfigId, userRefField) {
        this.deflectionConfig = new GlideRecordSecure(SSAConstants.TABLE_DEFLECTION_CONFIGURATION);
        if (this.deflectionConfig.get(deflectionConfigId + '')) {
            var user = new GlideRecordSecure(this.deflectionConfig.activity_context.context_table + '');
			var durationInMinutes = (new GlideDateTime(this.deflectionConfig.window).getNumericValue()/60000)*2;
			var loginTimeFilter = 'last_login_time>=javascript:gs.minutesAgo('+durationInMinutes+')';
			if(!gs.nil(userRefField))
				loginTimeFilter = userRefField + '.' + loginTimeFilter;
			user.addEncodedQuery(loginTimeFilter);

            user.query();
            if (user.hasNext()) {
                this._getActivityWindow();
                var actSubCtx = global.ActivitySubscriptionContext.getContext();
                this.activityService = actSubCtx.getService('DEFLECTION_CONTEXT_SERVICE');
                while (user.next()) {
                    this._fetchActivitiesAndMatchPatterns(user);
                }
            }
        }
    },

    /**
     * fetches Activity String and RegEx representation of Activity Pattern
     *
     * @param GlideRecord: Customer Contact/ Consumer record
     */
    _fetchActivitiesAndMatchPatterns: function(user) {
        var activities = this._getActivitiesData(user);
        if (activities.length > 0) {
            var activityString = this._getActivityString(activities);
            var deflectionPattern = this._getDeflectionPattern();
            while (deflectionPattern.next()) {
                this._matchDeflectionPattern(activityString, deflectionPattern, activities, user);
            }
        }
    },

    /**
     * returns Activity Array based on the  Window duration in the Deflection Config and last Activity time captured/considered for measuring deflection.
     *
     * @param GlideRecord: Customer Contact/ Consumer record
     */
    _getActivitiesData: function(user) {
        var activities = [];
        var result = this.activityService.getActivities({
            "contextId": this.deflectionConfig.activity_context.sys_id,
            "contextInstanceId": user.sys_id + '',
            "startDate": this.windowObj.startDate + '',
            "endDate": this.windowObj.endDate + '',
            "fetchGroupsFromMapping": true,
			"sortOrder": 'Asc'
        });
        activities = result.data.activities;
        return activities;
    },

    /**
     * matches the Deflection Pattern RegEx on the Activity String
     * 
     * @param String: String representation of Activities
     * @param GlideRecord: Deflection Pattern
     * @param Array: Array of Activity Objects
     * @param GlideRecord: Customer Contact/ Consumer record
     */
    _matchDeflectionPattern: function(activityString, deflectionPattern, activities, user) {
        var deflectionPatternRegExp = this._getExpForActivityPattern(deflectionPattern.activity_pattern+'');
        if (!gs.nil(deflectionPatternRegExp)) {
            var reg = new RegExp(deflectionPatternRegExp, 'g');
            while ((matchString = reg.exec(activityString)) !== null && matchString[0].length > 0 && (matchString[0].length%SSAConstants.REP_ID_LENGTH == 0)) {

                var matchIf = deflectionPattern.activity_pattern.match_if;
                var end = (matchString.index + matchString[0].length) / SSAConstants.REP_ID_LENGTH;
                var start = matchString.index / SSAConstants.REP_ID_LENGTH;

                var matchEndTime = new GlideDateTime(activities[end - 1].created + '');
                var matchStartTime = new GlideDateTime(activities[start].created + '');
                var matchInWindowLimits = this._isMatchFoundInWindowLimits(activities, matchStartTime, matchEndTime);

                if (matchInWindowLimits) {
                    if (gs.nil(matchIf)) {
                        this._createDeflectionMetricData(deflectionPattern, start, end, activities);
                    } else {
                        var subStringToLookForPrimaryActivity = activityString.substring(matchString.index, activityString.length);
                        var primaryActivityIndex = subStringToLookForPrimaryActivity.indexOf(this._getRepresentativeId(deflectionPattern.activity_pattern.primary_activity + ''));
						var primaryActivity = (primaryActivityIndex + matchString.index) / SSAConstants.REP_ID_LENGTH;
                        if (matchIf == SSAConstants.MATCH_IF_FOUND && primaryActivityIndex > 0 && primaryActivity == end) {
                            var primaryActivityCreatedTime = new GlideDateTime(activities[primaryActivity].created + '');
                            var activityDuration = GlideDateTime.subtract(matchStartTime, primaryActivityCreatedTime);
                            if (this._compareDurations(activityDuration, this.deflectionConfig.window) == -1)
                                this._createDeflectionMetricData(deflectionPattern, start, end, activities);
                        } else if (matchIf == SSAConstants.MATCH_IF_NOT_FOUND && primaryActivityIndex == -1 && activities.length == end) {
                            if (this._compareDurations(GlideDateTime.subtract(matchStartTime, new GlideDateTime()), this.deflectionConfig.window) == 1)
                                this._createDeflectionMetricData(deflectionPattern, start, end, activities);
                        } else if (matchIf == SSAConstants.MATCH_IF_NOT_FOUND && primaryActivityIndex > 0 && primaryActivity == end) {
                            primaryActivityCreatedTime = new GlideDateTime(activities[primaryActivity].created + '');
                            activityDuration = GlideDateTime.subtract(matchStartTime, primaryActivityCreatedTime);

                            if (this._compareDurations(activityDuration, this.deflectionConfig.window) == 1)
                                this._createDeflectionMetricData(deflectionPattern, start, end, activities);
                        }
                    }
                }

            }
        }
    },

    /**
     * returns true if there is a Match found for Primary Activity in the given Window limit. Default Window limit is 24 hours.
     *
     * @param GlideRecord: Deeflection Config
     * @param Array: Activities
     * @param GlideDateTime: Start time of matching subsequence
     */
    _isMatchFoundInWindowLimits: function(activities, matchStartTime, matchEndTime) {
        var matchDuration = GlideDateTime.subtract(matchStartTime, matchEndTime);
        var windowDuration = this.deflectionConfig.window;
        return this._compareDurations(matchDuration, windowDuration) == -1;
    },

    /**
     * created Deflection Metric and Deflection Meetric Activity records for the matching patterns.
     *
     * @param GlideRecord: Deflection Pattern
     * @param Array: Activity Array
     */
    _createDeflectionMetricData: function(deflectionPattern, start, end, activities) {
        var finalActivity = activities[end - 1];
        var deflectionMetricId = this._createDeflectionMetric(deflectionPattern, finalActivity.sys_id, finalActivity.source_table_name);
        var order = end - start - 1;
        for (i = end - 2; i >= start; i--) {
            var activity = activities[i];
            this._createDeflectionActivity(activity, deflectionMetricId, order);
            order--;
        }
    },


    /**
     * returns 1 if duration1 > duration2
     * returns 0 if duration1 = duration2
     * returns -1 if duration1 < duration2
     */
    _compareDurations: function(duration1, duration2) {
        var dt1 = new GlideDateTime(duration1);
        var dt2 = new GlideDateTime(duration2);
        return dt1.compareTo(dt2);
    },

    /**
     * returns the Deflection Pattern for 'No Deflection' if Activities of type 'Case created' exist.
     * returns the Deflection Pattern for 'Potential/Confirmed Deflection' if Activities of type 'Case created' does not exist.
     *
     * @param SysId: Deflection Config sys_id
     * @param Boolean: holds true if there are any Activities of type 'Case Created' in the Activity string.
     */
    _getDeflectionPattern: function() {
        var deflectionPattern = new GlideRecordSecure(SSAConstants.TABLE_DEFLECTION_PATTERN);
        deflectionPattern.addQuery('deflection_configuration', this.deflectionConfig.sys_id);
        deflectionPattern.query();
        return deflectionPattern;
    },

    /**
     * returns window obj based on the deflection configuration and the last Activities captured/considered in the previous run.
     *
     * @param GlideRecord: Deflection configuration record
     */
    _getActivityWindow: function() {
        var gdt = new GlideDateTime();
        this.windowObj.endDate = gdt + '';
        var windowDuration = this.deflectionConfig.window.dateNumericValue();
        gdt.add(-(windowDuration * 2));
        this.windowObj.startDate = gdt + '';
    },

    /**
     * returns String representation of Activities for the given Obj Array
     *
     * @param Array: Activity Obj Array
     */
    _getActivityString: function(activities) {
        var activityString = '';
        if (activities.length > 0) {
            for (var i = 0; i < activities.length; i++) {
                activityString += this._getRepresentativeId(activities[i].activity_type_id + '');
            }
        }
        return activityString;
    },

    /**
     * Create deflection metric for matched Patterns
     *
     * @param GlideRecord: Deflection Pattern
     * @param GlideRecord: Customer Contact/ Consumer record
     */
    _createDeflectionMetric: function(deflectionPattern, activityId, activityTable) {
        var deflectionMetric = new GlideRecordSecure(SSAConstants.TABLE_DEFLECTION_METRIC);
        deflectionMetric.initialize();
        deflectionMetric.type = deflectionPattern.activity_pattern.outcome + '';
        deflectionMetric.deflection_pattern = deflectionPattern.sys_id;
        deflectionMetric.content_id = activityId;
        deflectionMetric.content_table = activityTable;
        return deflectionMetric.insert() + '';
    },

    /**
     * creates deflection metric activity for given Deflection Metric
     **/
    _createDeflectionActivity: function(activity, deflectionMetricId, order) {
        var deflectionMetricActivity = new GlideRecordSecure(SSAConstants.TABLE_DEFLECTION_METRIC_ACTIVITY);
        deflectionMetricActivity.initialize();
        deflectionMetricActivity.activity_table = activity.source_table_name;
        deflectionMetricActivity.activity = activity.sys_id;
        deflectionMetricActivity.metric = deflectionMetricId;
        deflectionMetricActivity.order = order;
        deflectionMetricActivity.insert();
    },

    /**
     * returns RegEx representation of Pattern Element
     */
    _getExpForPatternElement: function(elementSysId) {
        if (this.patternRegExp[elementSysId] == -1) {
            var patternElement = new GlideRecordSecure(SSAConstants.TABLE_PATTERN_ELEMENT);
            if (patternElement.get(elementSysId)) {
                var activityTypeRecord = patternElement.activity_type.getRefRecord();
                if (activityTypeRecord.isValidRecord()) {
                    var repId = this._getRepresentativeId(activityTypeRecord.sys_id + '');
                    this.patternRegExp[elementSysId] = this._quantifyElement(repId, patternElement);
                } else {
                    this.patternRegExp[elementSysId] = '';
                }
            } else {
                this.patternRegExp[elementSysId] = '';
            }
        }
        return this.patternRegExp[elementSysId];
    },

    /**
     * returns RegEx representation of Pattern Element Groups
     */
    _getExpForPatternElementGroup: function(elementGroupSysId) {
        if (this.patternRegExp[elementGroupSysId] == -1) {
            var patternElementGroup = new GlideRecordSecure(SSAConstants.TABLE_PATTERN_ELEMENT_GROUP);
            if (patternElementGroup.get(elementGroupSysId)) {
                var firstElementRecord = patternElementGroup.first_element.getRefRecord();
                var secondElementRecord = patternElementGroup.second_element.getRefRecord();
                if (firstElementRecord.isValidRecord())
                    var patternExpForFirstElement = this._getExpForElementBase(patternElementGroup.first_element);
                if (secondElementRecord.isValidRecord())
                    var patternExpForSecondElement = this._getExpForElementBase(patternElementGroup.second_element);
                if (!gs.nil(patternExpForFirstElement) && !gs.nil(patternExpForSecondElement)) {
                    switch (patternElementGroup.operator + "") {
                        case SSAConstants.AND_OPERATOR:
                            this.patternRegExp[elementGroupSysId] = this._quantifyElement(patternExpForFirstElement + '' + patternExpForSecondElement, patternElementGroup);
                            break;
                        case SSAConstants.OR_OPERATOR:
                            this.patternRegExp[elementGroupSysId] = this._quantifyElement(patternExpForFirstElement + '|' + patternExpForSecondElement, patternElementGroup);
                    }
                } else if (!gs.nil(patternExpForFirstElement))
                    this.patternRegExp[elementGroupSysId] = this._quantifyElement(patternExpForFirstElement + '', patternElementGroup);
                else if (!gs.nil(patternExpForSecondElement))
                    this.patternRegExp[elementGroupSysId] = this._quantifyElement(patternExpForSecondElement + '', patternElementGroup);
                else
                    this.patternRegExp[elementGroupSysId] = '';
            } else
                this.patternRegExp[elementGroupSysId] = '';
        }
        return this.patternRegExp[elementGroupSysId];
    },

    _quantifyElement: function(repId, elementBase) {

        var elementExp;
        switch (elementBase.occurrence + "") {
            case SSAConstants.OCCURRENCE_ONCE:
                elementExp = '(' + repId + ')';
                break;
            case SSAConstants.OCCURRENCE_OPTIONALLY_ONCE:
                elementExp = '(' + repId + ')?';
                break;
            case SSAConstants.OCCURRENCE_OPTIONALLY_MANY:
                elementExp = '(' + repId + ')*';
                break;
            case SSAConstants.OCCURRENCE_ATLEAST_ONCE:
                elementExp = '(' + repId + ')+';
                break;
            case SSAConstants.OCCURRENCE_RANGE:
                var rangeQuantifier = '{' + elementBase.minimum + '';
                if (!gs.nil(elementBase.maximum)) {
                    rangeQuantifier += ',';
                    if (elementBase.maximum > 0)
                        rangeQuantifier += elementBase.maximum + '';
                }
                rangeQuantifier += '}';
                elementExp = '(' + repId + ')' + rangeQuantifier;
                break;
        }
        return elementExp;
    },

    /**
     * returns RegEx representation of Element Base
     */
    _getExpForElementBase: function(elementBaseSysId) {
        if (gs.nil(this.patternRegExp[elementBaseSysId])) {
            this.patternRegExp[elementBaseSysId] = -1;
            var elementBase = new GlideRecordSecure(SSAConstants.TABLE_ELEMENT_BASE);
            if (elementBase.get(elementBaseSysId)) {
                if (elementBase.sys_class_name == SSAConstants.TABLE_PATTERN_ELEMENT_GROUP) {
                    this._getExpForPatternElementGroup(elementBaseSysId);
                } else {
                    this._getExpForPatternElement(elementBaseSysId);
                }
            }
        } else if (this.patternRegExp[elementBaseSysId] == -1) {
            this.patternRegExp[elementBaseSysId] = '';
        }
        return this.patternRegExp[elementBaseSysId];
    },

    /**
     * returns RegEx representation of Actiivity Pattern
     */
    _getExpForActivityPattern: function(activityPatternSysId) {
        if (gs.nil(this.patternRegExp[activityPatternSysId])) {
            var activityPattern = new GlideRecordSecure(SSAConstants.TABLE_ACTIVITY_PATTERN);
            activityPattern.get(activityPatternSysId);
            if (activityPattern.isValidRecord()) {
                var patternElementMapping = new GlideRecordSecure(SSAConstants.TABLE_PATTERN_ELEMENT_MAPPING);
                patternElementMapping.addQuery('pattern', activityPatternSysId);
                patternElementMapping.orderBy('order');
                patternElementMapping.query();
                if (patternElementMapping.hasNext()) {
                    var patternExp = '';
                    while (patternElementMapping.next()) {
                        var elementBaseRecord = patternElementMapping.element.getRefRecord();
                        if (elementBaseRecord.isValidRecord()) {
                            var expForElementBase = this._getExpForElementBase(patternElementMapping.element);
                            if (!gs.nil(expForElementBase)) {
                                patternExp += '(' + this._getExpForElementBase(patternElementMapping.element) + ')';
                                this.patternRegExp[activityPatternSysId] = patternExp;
                            }
                        }

                    }
                    gs.info('RegEx for Activity Pattern : ' + activityPattern.sys_id + ' : ' + patternExp + ' : Primary Activity:' + this._getRepresentativeId(activityPattern.primary_activity + ''));
                }
            }
        }
        return this.patternRegExp[activityPatternSysId];
    },

    /**
     * Auto generates 5 digit unique literal for a given Activity Type
     */
    _getRepresentativeId: function(activityTypeSysId) {
        if (!gs.nil(this.activityTypeRepId[activityTypeSysId])) {
            return this.activityTypeRepId[activityTypeSysId];
        } else {
            var repId = this._lpad(this.sequence.toString(16).toUpperCase(), 4, "0");
            this.activityTypeRepId[activityTypeSysId] = SSAConstants.REP_ID_DELIMITER + repId;
            this.sequence++;
            return SSAConstants.REP_ID_DELIMITER + repId; // Prefix a delimiter to RepId

        }
    },

    _lpad: function(s, width, charCount) {
        return (s.length >= width) ? s : (new Array(width).join(charCount) + s).slice(-width);
    },

    type: 'SSADeflectionAnalyticsServiceSNC'
};
