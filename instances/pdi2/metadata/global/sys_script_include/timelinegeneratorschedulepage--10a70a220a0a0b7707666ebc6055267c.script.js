// Class Imports
var TimelineItem = GlideTimelineItem;

ERROR_TITLE = gs.getMessage('ERROR');
ERROR_NO_PAGE_ID = gs.getMessage('One of the required fields was not specified. Make sure "sysparm_timeline_page_id" is specified.');
ERROR_INTERACTIVE = gs.getMessage('One of the required parameters was not properly specified');
ERROR_SECURITY = gs.getMessage('Modification of this record is not allowed');
ERROR_INVALID_PAGE_ID = gs.getMessage('Unable to find a timeline page with the specified ID');
ERROR_INVALID_SUB_ID = gs.getMessage('Unable to find a timeline page sub item with the specified ID');

var SuccessorRange = Class.create();
SuccessorRange.prototype = {
    initialize: function() {
        this.min = -1;
        this.max = -1;
        this.leftIDs = "";
        this.rightIDs = "";
    },

    setMin: function(timeMs, id) {
        if (this.min == -1 || timeMs <= this.min) {
            if (timeMs != this.min)
                this.leftIDs = "";
            this.min = timeMs;
            this.leftIDs = this.leftIDs + "," + id;
        }
    },

    setMax: function(timeMs, id) {
        if (this.max == -1 || timeMs >= this.max) {
            if (timeMs != this.max)
                this.rightIDs = "";
            this.max = timeMs;
            this.rightIDs = this.rightIDs + "," + id;
        }
    },

    merge: function(other) {
        if (other.min < this.min) {
            this.min = other.min;
            this.leftIDs = other.leftIDs;
        } else if (other.min == this.min) {
            this.leftIDs = this.leftIDs + "," + other.leftIDs;
        }
        if (other.max > this.max) {
            this.max = other.max;
            this.rightIDs = other.rightIDs;
        } else if (other.max == this.max) {
            this.rightIDs = this.rightIDs + "," + other.rightIDs;
        }
    }
};

var TimelineGeneratorSchedulePage = Class.create();
TimelineGeneratorSchedulePage.prototype = Object.extendsObject(AbstractTimelineSchedulePage, {

    // ////////////////////////////////////////////////////////////////////////////////////////////////
    // GET_ITEMS
    // ////////////////////////////////////////////////////////////////////////////////////////////////
    ERROR_CODE_NO_ID: 1,
    ERROR_CODE_INVALID_ID: 2,
    ERROR_SUB_INVALID_ID: 3,

    _getPageRecord: function() {
        var timelinePageId = this.getParameter("sysparm_timeline_page_id");
        var timelineOldPageName = this.getParameter("sysparm_timeline");
        if (timelinePageId == null && timelineOldPageName == null)
            return this.ERROR_CODE_NO_ID;
        var pageRecord = new GlideRecord('cmn_timeline_page');
        if (timelinePageId != null)
            pageRecord.addQuery('sys_id', timelinePageId);
        else
            pageRecord.addQuery('name', timelineOldPageName);
        pageRecord.query();
        if (!pageRecord.next())
            return this.ERROR_CODE_INVALID_ID;
        else
            return pageRecord;
    },

    _setStatusError: function(code) {
        switch (code) {
            case this.ERROR_CODE_NO_ID:
                return this.setStatusError(ERROR_TITLE, ERROR_NO_PAGE_ID);
            case this.ERROR_CODE_INVALID_ID:
                return this.setStatusError(ERROR_TITLE, ERROR_INVALID_PAGE_ID);
            case this.ERROR_SUB_INVALID_ID:
                return this.setStatusError(ERROR_TITLE, ERROR_INVALID_SUB_ID);
        }
    },

    getItems: function() {
        var result = this._getPageRecord();
        if (typeof result == "number")
            return this._setStatusError(result);

        // Set page title
        if (result.name != '')
            this.setPageTitle(result.getDisplayValue("name"));

        //Create range calculator if specified
        var calculator;
		var scheduleScriptUtil = new ScheduleScriptUtil();
        if (result.range_calculator && result.range_calculator.api_name) {
            calculator = scheduleScriptUtil.getScriptIncludeObj(result.range_calculator.api_name);
		}

        scheduleScriptUtil.populateItems(this, result, null, -1, -1, null, calculator);
    },

    

    _searchForPageRecord: function(parentID) {
        var result = '';
        if (!parentID) {
            result = this._getPageRecord();
            if (typeof result == "number")
                return this._setStatusError(result);
            if (result.table == this.getParameter("sysparm_table_name"))
                return result;
            result = this._searchForPageRecord(result.sys_id);
            if (!result)
                return this._setStatusError(this.ERROR_SUB_INVALID_ID);
            else
                return result;
        } else {
            var subRecord = new GlideRecord('cmn_timeline_sub_item');
            subRecord.addQuery('parent', parentID);
            subRecord.query();
            while (subRecord.next()) {
                if (subRecord.table == this.getParameter("sysparm_table_name"))
                    return subRecord;
                result = this._searchForPageRecord(subRecord.sys_id);
                if (result)
                    return result;
            }
            return null;
        }
    },

    findTopTimelineRecord: function(timelineRecord) {
        if (!timelineRecord.parent)
            return timelineRecord;

        var result = new GlideRecord('cmn_timeline_sub_item');
        result.addQuery('sys_id', timelineRecord.parent);
        result.query();
        if (!result.next()) {
            result = new GlideRecord('cmn_timeline_page');
            result.addQuery('sys_id', timelineRecord.parent);
            result.query();
            result.next();
            return result;
        }
        return this.findTopTimelineRecord(result);
    },

    updateParentRecord: function(startDate, endDate, sysID, timelineRecord, recordID) {
        var topTimelineRecord = this.findTopTimelineRecord(timelineRecord);
        if (topTimelineRecord.range_calculator && topTimelineRecord.range_calculator.api_name) {
            var scheduleScriptUtil = new ScheduleScriptUtil();
            var calculator = scheduleScriptUtil.getScriptIncludeObj(topTimelineRecord.range_calculator.api_name);
            if (calculator)
				calculator.updateParents(recordID, timelineRecord.table, startDate, endDate);
        } else if (timelineRecord.parent && timelineRecord.restriction && timelineRecord.restriction == "update_parent") {
            var result = new GlideRecord('cmn_timeline_sub_item');
            result.addQuery('sys_id', timelineRecord.parent);
            result.query();
            var found = result.next();
            if (!found) {
                result = new GlideRecord('cmn_timeline_page');
                result.addQuery('sys_id', timelineRecord.parent);
                result.query();
                found = result.next();
            }
            if (found) {
                var gr = new GlideRecord(result.table);
                gr.addQuery('sys_id', sysID);
                gr.query();
                if (gr.next()) {
                    var sd = parseInt(gr[result.start_date_field].getGlideObject().getNumericValue(), 10);
                    var ed = parseInt(gr[result.end_date_field].getGlideObject().getNumericValue(), 10);
                    var changed = false;
                    if (startDate && startDate < sd) {
                        changed = true;
                        var gdtStart = new GlideDateTime();
                        gdtStart.setNumericValue(startDate);
                        gr.setValue(result.start_date_field, gdtStart);
                    }
                    if (endDate && endDate > ed) {
                        changed = true;
                        var gdtEnd = new GlideDateTime();
                        gdtEnd.setNumericValue(endDate);
                        gr.setValue(result.end_date_field, gdtEnd);
                    }
                    if (changed) {
                        gr.update();
                        if (result.parent_col && result.restriction != "none")
                            this.updateParentRecord(startDate, endDate, gr[result.parent_col], result);
                    }
                }
            }
        }
    },

    // ////////////////////////////////////////////////////////////////////////////////////////////////
    // ELEMENT_MOVE_X
    // ////////////////////////////////////////////////////////////////////////////////////////////////

    elementMoveX: function(spanId, newStartDateTimeMs) {
        if (!spanId || spanId == null || spanId == '')
            return this.setStatusError(ERROR_TITLE, ERROR_INTERACTIVE);
        var result = this._searchForPageRecord();
        if (typeof result == "number")
            return this._setStatusError(result);

        var gr = new GlideRecordSecure(result.table);
        gr.addQuery('sys_id', spanId);
        gr.query();
        if (gr.next()) {
            // Calculate duration
            var sd = parseInt(gr[result.start_date_field].getGlideObject().getNumericValue(), 10);
            var ed = parseInt(gr[result.end_date_field].getGlideObject().getNumericValue(), 10);
            var newEndDateTimeMs = parseInt(newStartDateTimeMs) + (ed - sd);
            var gdtStart = new GlideDateTime();
            gdtStart.setNumericValue(newStartDateTimeMs);
            var gdtEnd = new GlideDateTime();
            gdtEnd.setNumericValue(newEndDateTimeMs);
            if (this._auditDisabled())
                gr.setWorkflow(false);
            gr.setValue(result.start_date_field, gdtStart);
            gr.setValue(result.end_date_field, gdtEnd);
            if (!gr.update())
                return this.setStatusError(ERROR_TITLE, ERROR_SECURITY);
            this.updateParentRecord(newStartDateTimeMs, newEndDateTimeMs, gr[result.parent_col], result, spanId);
            return this.setDoReRenderTimeline(true);
        }
        return this.setStatusError(ERROR_TITLE, ERROR_INTERACTIVE);
    },

    findRecord: function(spanId) {

    },

    // ////////////////////////////////////////////////////////////////////////////////////////////////
    // ELEMENT_TIME_ADJUST START
    // ////////////////////////////////////////////////////////////////////////////////////////////////

    elementTimeAdjustStart: function(spanId, newStartDateTimeMs) {
        if (!spanId || spanId == null || spanId == '')
            return this.setStatusError(ERROR_TITLE, ERROR_INTERACTIVE);

        var result = this._searchForPageRecord();
        if (typeof result == "number")
            return this._setStatusError(result);

        var gr = new GlideRecordSecure(result.table);
        gr.addQuery('sys_id', spanId);
        gr.query();
        if (gr.next()) {
            var gdtStart = new GlideDateTime();
            gdtStart.setNumericValue(newStartDateTimeMs);
            if (this._auditDisabled())
                gr.setWorkflow(false);
            gr.setValue(result.start_date_field, gdtStart);
            if (!gr.update())
                return this.setStatusError(ERROR_TITLE, ERROR_SECURITY);
            this.updateParentRecord(newStartDateTimeMs, null, gr[result.parent_col], result, spanId);
            return this.setDoReRenderTimeline(true);
        }

        return this.setStatusError(ERROR_TITLE, ERROR_INTERACTIVE);
    },

    // ////////////////////////////////////////////////////////////////////////////////////////////////
    // ELEMENT_TIME_ADJUST END
    // ////////////////////////////////////////////////////////////////////////////////////////////////

    elementTimeAdjustEnd: function(spanId, newEndDateTimeMs) {
        if (!spanId || spanId == null || spanId == '')
            return this.setStatusError(ERROR_TITLE, ERROR_INTERACTIVE);

        var result = this._searchForPageRecord(null);
        if (typeof result == "number")
            return this._setStatusError(result);

        var gr = new GlideRecordSecure(result.table);
        gr.addQuery('sys_id', spanId);
        gr.query();
        if (gr.next()) {
            var gdtEnd = new GlideDateTime();
            gdtEnd.setNumericValue(newEndDateTimeMs);
            if (this._auditDisabled())
                gr.setWorkflow(false);
            gr.setValue(result.end_date_field, gdtEnd);
            if (!gr.update())
                return this.setStatusError(ERROR_TITLE, ERROR_SECURITY);
            this.updateParentRecord(null, newEndDateTimeMs, gr[result.parent_col], result, spanId);
            return this.setDoReRenderTimeline(true);
        }
        return this.setStatusError(ERROR_TITLE, ERROR_INTERACTIVE);
    },

    _auditDisabled: function() {
        // If property exists and its value is true, do not setWorkflow to false when updating a record.
        return !gs.getProperty('timeline.enable.audit', false);
    }
});
