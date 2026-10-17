var context = this;
var ScheduleScriptUtil = Class.create();

ScheduleScriptUtil.prototype = {
    initialize: function() {},

    getScriptIncludeObj: function(apiName) {
        return this.getScriptInstanceFromApiName(context, apiName);
    },

    getScriptInstanceFromApiName: function(_ctx, apiName) {
        if (apiName && _ctx) {
            var splits = apiName.split('.');
            if (splits && splits.length === 2) {
                var scope = splits[0];
                var siName = splits[1];
                return new _ctx[scope][siName]();
            }
        }
        return;
    },

    populateItems: function(tgsPage,  result, parentID, parentMinMS, parentMaxMS, successorRange, calculator) {
        if (calculator)
            calculator.logMessage(parentID);

        var restricted = false;

        // Obtain the list of span styles associated with this timeline page.
        var styles = new GlideRecord("cmn_timeline_page_style");
        styles.addQuery("timeline_page", result.sys_id);
        styles.orderBy("order");
        styles.query();

        // Ok now lets create the spans
        var gr = new GlideRecordSecure(result.table);
        if (parentID)
            gr.addQuery(result.parent_col, parentID);

        // Do we have ordering query information?
        if (result.sort_by != null && result.sort_by != '' && result.sort_by_order == 'DESC')
            gr.orderByDesc(result.sort_by);
        else if (result.sort_by != null && result.sort_by != '')
            gr.orderBy(result.sort_by);
        else
            gr.orderBy(result.start_date_field);

        // Is there a query condition?
        if (result.condition != null)
            gr.addEncodedQuery(result.condition);

        gr.setQueryReferences(true);
        gr.query();

        while (gr.next()) {
            // check user has access to record date fields to avoid NPE later on
            if (JSUtil.nil(gr.getValue(result.start_date_field)) || JSUtil.nil(gr.getValue(result.end_date_field)))
                continue;

            var recordTable = result.table;
            var recordID = gr.sys_id;

            var item = new TimelineItem(recordTable, recordID);
            if (parentID)
                item.setParent(parentID);

            var span = item.createTimelineSpan(recordTable, recordID);
            if (parentID)
                span.addPredecessor(parentID);

            // ----- SPAN START/END TIME -----
            var sdo = gr[result.start_date_field].getGlideObject();
            var edo = gr[result.end_date_field].getGlideObject();

            // Ensure we have a start date; otherwise, do not display.
            if (!sdo.hasDate())
                continue;

            // If an item has no end date, we will set it to the start date for
            // all timeline pages
            // as it is common for tasks, incidents, changes, etc. to have only
            // a start date. These
            // will show up as points on the timeline.
            if (!edo.hasDate())
                edo = sdo;

            span.setTimeSpan(sdo, edo);

            if (calculator) {
                var maxResult = calculator.getMaxRangeDetails(recordID, result.table);
                span.setTimeSpanMaxRange(maxResult[0], maxResult[1]);
                span.setMaxRestrictorIDs(maxResult[2]);
            } else {
                if (successorRange && (result.restriction == "restrict_parent" || result.restriction == "update_parent")) {
                    successorRange.setMin(span.getStartTimeMs(), recordID);
                    successorRange.setMax(span.getEndTimeMs(), recordID);
                }
                if (result.restriction == "restrict_parent") {
                    span.setTimeSpanMaxRange(parentMinMS, parentMaxMS);
                    span.setMaxRestrictorIDs(parentID);
                }
            }

            // ----- SPAN COLOR -----
            if (result.css_span_color != '')
                span.setSpanColor(result.css_span_color);

            // ----- SPAN TEXT -----
            var strText = '';
            var cols = result.labels.split(',');
            var displayValue = '';
            var val = '';
            for (var i = 0, l = cols.length; i < l; i++) {
                val = cols[i];
                if (JSUtil.nil(val))
                    continue;

                displayValue = gr.getDisplayValue(cols[i]);
                if (JSUtil.nil(displayValue))
                    continue;

                strText += (i != 0 ? ', ' : '') + displayValue;
            }

            item.setLeftLabelText(strText);
            span.setSpanText(strText);

            // ----- SPAN TOOLTIP -----
            if (result.show_tooltips == true) {
                strText = '';
                cols = result.tooltip_label.split(',');
                for (var j = 0, k = cols.length; j < k; j++) {
                    val = cols[j];
                    if (JSUtil.nil(val))
                        continue;

                    displayValue = gr.getDisplayValue(cols[j]);
                    if (JSUtil.nil(displayValue))
                        continue;

                    var label = gr.getElement(cols[j]).getLabel();
                    strText += '<strong>' + SNC.GlideHTMLSanitizer.sanitize(label) + '</strong>: ' + SNC.GlideHTMLSanitizer.sanitize(displayValue) + '<br />';
                }
                span.setTooltip(strText);
            }

            // ----- INTERACTIVE OPTIONS -----
            if (calculator) {
                span.setRestriction("calculator");
            } else if (result.restriction) {
                if (result.restriction != "none")
                    restricted = true;
                span.setRestriction(result.restriction);
            }
            span.setChildRestricted(false);

            if (result.allow_dragging == true)
                span.setAllowXMove(true);
            if (result.allow_drag_left == true)
                span.setAllowXDragLeft(true);
            if (result.allow_drag_right == true)
                span.setAllowXDragRight(true);

            // ----- OVERRIDE WITH SPAN STYLES -----
            var match = false;
            styles.restoreLocation();
            while (styles.next() && !match) {
                var conditions = styles.getValue("condition");
                if (!conditions) 
                    match = true;
                else {
                    var filter = new GlideFilter(conditions, 'filterCondition');
                    filter.setEnforceSecurity(true);
                    match = filter.match(gr, true);
                }

                if (match) {
                    var spanColorElement = styles.getElement("span_color");
                    if (!spanColorElement.nil())
                        span.setSpanColor(spanColorElement.getDisplayValue());

                    span.setLabelDecoration(styles.label_decoration);
                    var labelColorRecord = styles.label_color.getRefRecord();
                    if (!labelColorRecord.nil())
                        span.setLabelColor(labelColorRecord.color);
                }
            }

            var localSuccessorRange;
            if (!calculator)
                localSuccessorRange = new SuccessorRange();
            var sub = new GlideRecord("cmn_timeline_sub_item");
            sub.addQuery("parent", result.sys_id);
            sub.query();
            while (sub.next()) {
                if (this.populateItems(tgsPage, sub, recordID, span.getStartTimeMs(),
                        span.getEndTimeMs(), localSuccessorRange, calculator)) {
                    if (!calculator) {
                        span.setChildRestricted(true);
                        if (successorRange)
                            successorRange.merge(localSuccessorRange);
                    }
                }
            }
            if (calculator) {
                var minResult = calculator.getMinRangeDetails(recordID, result.table);
                span.setTimeSpanMinRange(minResult[0], minResult[1]);
                span.setMinRestrictorLeftIDs(minResult[2]);
                span.setMinRestrictorRightIDs(minResult[3]);
            } else if (span.getChildRestricted()) {
                span.setTimeSpanMinRange(localSuccessorRange.min, localSuccessorRange.max);
                span.setMinRestrictorLeftIDs(localSuccessorRange.leftIDs);
                span.setMinRestrictorRightIDs(localSuccessorRange.rightIDs);
            }
            tgsPage.add(item);
        }

        return restricted;
    },

    type: 'ScheduleScriptUtil'
};
