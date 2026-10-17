var QueryBuilderResultStatus = Class.create();
QueryBuilderResultStatus.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	showLoadButtons: function(query) {
		var TABLE = "qb_query_status";
		var QUERY = "sys_id";
		var STATUS = "status";
		var queryIndex = -1;
		
		query = query.split("="); 
		for(var i = 0; i < query.length - 1; i++) {
			if (query[i] === 'query' && query[i + 1]) {
				queryIndex = i + 1;
				query[queryIndex] = query[queryIndex].substring(0, 32);
				break;
			}
		}
		if(queryIndex < 0){
			return false;
		}
		var gr = new GlideRecord(TABLE);
		if(gr.canRead() && gr.get(query[queryIndex])) {
			if(gr.getValue(STATUS) == "PAUSED") {
				return true;
			}
			return false;
		}
		return false;
    },

    /**
     * To determine whether to or not to display "Load More Results" button on query result table
     * Return true if query exuection mode is v1 else false when mode is v2(graph API)
     */
    showLoadMore: function(query) {
        var TABLE = "qb_query_status";
        var QUERY = "sys_id";
        var EXECUTION_MODE = "query_execution_mode";
        var queryIndex = -1;

        query = query.split("=");
        for (var i = 0; i < query.length - 1; i++) {
            if (query[i] === 'query' && query[i + 1]) {
                queryIndex = i + 1;
                query[queryIndex] = query[queryIndex].substring(0, 32);
                break;
            }
        }
        if (queryIndex < 0) {
            return false;
        }
        var gr = new GlideRecord(TABLE);
        if (gr.canRead() && gr.get(query[queryIndex])) {
            if (gr.getValue(EXECUTION_MODE) != "v2") {
                return true;
            }
            return false;
        }
        return true;
    },

    /**
     * Returns if query execution has reached max limit or not from 'qb_query_status' table using a provided query ID.
     * Looks up the result table in 'qb_saved_query' and retrieves the status from 'qb_query_status'.
     */
    hasMaxLimitReached: function(query) {
        var TABLE = "qb_query_status";
        var QUERY = "sys_id";
        var STATUS = "status";
        var queryIndex = -1;

        query = query.split("=");
        for (var i = 0; i < query.length - 1; i++) {
            if (query[i] === 'query' && query[i + 1]) {
                queryIndex = i + 1;
                query[queryIndex] = query[queryIndex].substring(0, 32);
                break;
            }
        }
        if (queryIndex < 0) {
            return false;
        }
        var gr = new GlideRecord(TABLE);
        if (gr.canRead() && gr.get(query[queryIndex])) {
            return gr.getValue(STATUS);
        }
        return null;
    },

    /**
     * Fetches the execution status of a query from the 'qb_query_status' table using a provided query ID.
     * Looks up the result table in 'qb_saved_query' and retrieves the status from 'qb_query_status'.
     */
    getQueryExecutionStatus: function() {
        var savedQueryTable = 'qb_saved_query';
        var queryStatusTable = 'qb_query_status';

        // Get the query ID from the request parameters
        var queryId = this.getParameter('query');
        if (!queryId) {
            return JSON.stringify({
                "status": "ERROR",
                "message": "Query ID is missing."
            });
        }

        var qbReports = new QueryBuilderReports();
        var executionId = qbReports.getQueryLatestExecutionId(queryId);
        if (!executionId) {
            return JSON.stringify({
                "status": "ERROR",
                "message": "No exectuion Id found for provided Query ID or execution is not complete yet."
            });
        }

        return JSON.stringify({
            "status": "COMPLETE",
            "executionId": executionId
        });
    },

	/**
     * Fetches the execution mode of a query from the 'qb_query_status' table using a provided query ID.
     */
	getQueryExecutionMode: function() {
        var queryStatusTable = 'qb_query_status';

        // Get the query ID from the request parameters
        var queryId = this.getParameter('query');
        if (!queryId) {
            return JSON.stringify({
                "status": "ERROR",
                "message": "Query ID is missing."
            });
        }

		var gr = new GlideRecord(queryStatusTable);
        if (gr.get(queryId) && gr.canRead()) {
            return JSON.stringify({"mode": gr.getValue("query_execution_mode")});
        }

        return JSON.stringify({
            "status": "ERROR",
            "message": "Unable to find execution mode for Query ID : " + queryId
        });
    },

    type: 'QueryBuilderResultStatus'

});
