var KBSearchDeduplicationSNC = Class.create();
KBSearchDeduplicationSNC.prototype = {
    initialize: function() {
        //a search within 10 seconds of another search from the same session will be considered for deduplication.
        this.DUPLICATE_TIME_DIFF = 10;
        this.UPDATE_CHUNK_SIZE = 1000;
    },

    getQuery: function(dateObj) {
        //dateObj is undefined or null then consider yeterday for processing.
        if (!dateObj) {
            dateObj = new GlideDate();
            dateObj.addDays(-1);
        }
        var dt = new GlideDateTime(gs.beginningOfDay(dateObj));
        dt.addSeconds((this.DUPLICATE_TIME_DIFF * -1));
        var startDt = "sys_created_on>=" + dt.getValue();

        dt = new GlideDateTime(gs.endOfDay(dateObj));
        var endDt = "sys_created_on<=" + dt.getValue();
        var query = startDt + '^' + endDt;
        return query;
    },

    process: function(dateObj, encQuery) {
        var timeDiffInMs = this.DUPLICATE_TIME_DIFF * 1000;
        var gr = new GlideRecord("ts_query_kb");
        gr.addQuery(this.getQuery(dateObj));
        if (encQuery)
            gr.addEncodedQuery(encQuery);
        gr.orderBy('session_id');
        gr.orderBy('sys_created_on');
        gr.query();
        gs.log("Job Query : " + gr.getEncodedQuery(), "KBSearchDeduplication");
        var updateIds = [];
        var updateIdsToMarkFalse = [];
        var prevTerm = "";
        var prevSysId = "";
        var prevSessionId = "";
        var prevRecordDate = "";
        var prevFinalSearch = "";
        while (gr.next()) {
            var searchTerm = gr.getValue("search_term");
            var sysId = gr.getValue("sys_id");
            var sessionId = gr.getValue("session_id");
            var recordDate = gr.getValue("sys_created_on");
            var finalSearch = gr.getValue("final_search_term");

            if (prevTerm == "" || prevSessionId == "") {
                prevTerm = searchTerm;
                prevSysId = sysId;
                prevSessionId = sessionId;
                prevRecordDate = recordDate;
                prevFinalSearch = finalSearch;
                continue;
            }

            if (prevSessionId != sessionId) {
                if (prevFinalSearch == "0")
                    updateIds.push(prevSysId);
            } else {
                var date1 = new GlideDateTime();
                date1.setValue(recordDate);
                var date2 = new GlideDateTime();
                date2.setValue(prevRecordDate);
                var diff = date1.getNumericValue() - date2.getNumericValue();
                if (diff <= timeDiffInMs) {
                    if ((searchTerm && searchTerm.startsWith(prevTerm)) ||
                        (prevTerm && prevTerm.startsWith(searchTerm))) {
                        //Previous search is duplicate of this search
                        if (prevFinalSearch == "1") //if alreayd marked as final
                            updateIdsToMarkFalse.push(prevSysId);
                    } else {
                        //Previous search is not a duplicate of this search
                        if (prevFinalSearch == "0") //if alreayd marked as not final
                            updateIds.push(prevSysId);
                    }
                } else {
                    if (prevFinalSearch == "0")
                        updateIds.push(prevSysId);
                }
            }
            if (updateIds.length == this.UPDATE_CHUNK_SIZE) {
                this.doUpdate(updateIds, "true");
                updateIds = [];
            }
            if (updateIdsToMarkFalse.length == this.UPDATE_CHUNK_SIZE) {
                this.doUpdate(updateIdsToMarkFalse, "false");
                updateIdsToMarkFalse = [];
            }
            prevTerm = searchTerm;
            prevSysId = sysId;
            prevSessionId = sessionId;
            prevRecordDate = recordDate;
            prevFinalSearch = finalSearch;
        }
        if (prevFinalSearch == "0")
            updateIds.push(prevSysId);

        if (updateIds.length > 0)
            this.doUpdate(updateIds, "true");
        if (updateIdsToMarkFalse.length > 0)
            this.doUpdate(updateIdsToMarkFalse, "false");
    },

    doUpdate: function(finalSearchIds, val) {
        var mu = new GlideMultipleUpdate('ts_query_kb');
        mu.addQuery('sys_id', 'IN', finalSearchIds);
        mu.setValue('final_search_term', val);
        mu.execute();
    },

    type: 'KBSearchDeduplicationSNC'
};
