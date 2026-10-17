var UniversalLinksUtil = Class.create();
UniversalLinksUtil.prototype = {

    initialize: function() {},

    getSupportedListScreens: function() {
        var tableName = current.source_table_name;
        var screens = this._getScreens(tableName);
        return ("sys_idIN" + screens);
    },

    _getScreens: function(tableName) {
        var segments = this._getItemStreamSegmentsWithSingleItemStream(tableName);
        segments = this._getItemsStreamSegmentByItemStreamDITable(segments, tableName);
        var screens = this._getScreensWithSingleSegment();
        screens = this._getListScreensFromScreensListWithSingleSegment(segments, screens);
        return screens.toString();
    },

    // Return all segment with a single item stream
    _getItemStreamSegmentsWithSingleItemStream: function(tableName) {
        var segments = [];
        var segmentsAggGR = new GlideAggregate('sys_sg_item_stream_m2m_segment');
        segmentsAggGR.addAggregate(this.COUNT.value, 'segment');
        segmentsAggGR.addHaving(this.COUNT.value, '=', 1);
        segmentsAggGR.query();
        while (segmentsAggGR.next())
            segments.push(segmentsAggGR.getValue('segment'));

        return segments;
    },

    // Return all segment with single item stream based on stream.data_item.table 
    _getItemsStreamSegmentByItemStreamDITable: function(segments, tableName) {
        var segmentList = [];
        var gr = new GlideRecord('sys_sg_item_stream_m2m_segment');
        gr.addQuery('item_stream.data_item.table', tableName);
        gr.addQuery('segment', 'IN', segments.toString());
        gr.query();
        while (gr.next())
            segmentList.push(gr.getValue('segment'));

        return segmentList;
    },

    _getScreensWithSingleSegment: function() {
        var screens = [];
        var screensAggGR = new GlideAggregate('sys_sg_item_stream_segment');
        screensAggGR.addAggregate(this.COUNT.value, 'screen');
        screensAggGR.addHaving(this.COUNT.value, '=', 1);
        screensAggGR.query();
        while (screensAggGR.next())
            screens.push(screensAggGR.getValue('screen'));
		
        return screens;
    },

    _getListScreensFromScreensListWithSingleSegment: function(segmentsList, screensList) {
        var list = [];
        var segmentGR = new GlideRecord('sys_sg_item_stream_segment');
        segmentGR.addQuery('sys_id', 'IN', segmentsList.toString());
        segmentGR.addQuery('screen', 'IN', screensList.toString());
        segmentGR.query();
        while (segmentGR.next())
            list.push(segmentGR.getValue('screen'));
		
        return list;
    },

    getSupportedRecordScreens: function() {
        var tableName = current.source_table_name;
        var screens = this._getRecordScreens(tableName);

        return ("sys_idIN" + screens);
    },

    _getRecordScreens: function(tableName) {
        var recordScreensList = [];
        recordScreensList = recordScreensList.concat(this._getRecordScreensWithTableOrViewConfig(tableName));
        recordScreensList = recordScreensList.concat(this._getRecordWithFormSegment(tableName));
        return this._getUniqueValues(recordScreensList);
    },

    _getRecordScreensWithTableOrViewConfig: function(tableName) {
        var screens = [];
        var recordScreenWithTableGR = new GlideRecord('sys_sg_form_screen');
        var qc = recordScreenWithTableGR.addQuery('table', tableName);
        qc.addOrCondition('data_item.table', tableName);
        qc.addOrCondition('item_view.table', tableName);
        qc.addOrCondition('view_config.table', tableName);
        recordScreenWithTableGR.query();
        while (recordScreenWithTableGR.next())
            screens.push(recordScreenWithTableGR.getUniqueValue());

        return screens;
    },

    _getRecordWithFormSegment: function(tableName) {
        var screensWithSegment = [];
        var screensWithSegmentGR = new GlideRecord('sys_sg_form_segment');
        screensWithSegmentGR.addNullQuery('form.item_view');
        screensWithSegmentGR.addNullQuery('form.view_config');
        var qc = screensWithSegmentGR.addQuery('embedded_screen.ref_sys_sg_details_screen.table', tableName);
        qc.addOrCondition('embedded_screen.ref_sys_sg_activity_stream_screen.table', tableName);
        screensWithSegmentGR.query();
        while (screensWithSegmentGR.next())
            screensWithSegment.push(screensWithSegmentGR.getValue('form'));

        return screensWithSegment;
    },

    // Returning an Array after removing all duplications
    _getUniqueValues: function(array) {
        var uniqueValues = {};
        for (var i = 0; i < array.length; i++)
            uniqueValues[array[i]] = true;

        return Object.keys(uniqueValues);
    },

    COUNT: {
        'value': 'COUNT'
    },

    type: 'UniversalLinksUtil'
};
