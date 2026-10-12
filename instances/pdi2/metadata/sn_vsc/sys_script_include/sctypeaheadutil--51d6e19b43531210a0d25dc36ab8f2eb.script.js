class SCTypeAheadUtil {
    constructor() {
        this.constants = new sn_vsc.SecurityCenterConstants();
        this.defaultRecordsCountToFetch = 25;

        /**
         * A map of tables and their corresponding default queries
         * The following default queries can be enhanced with time.
         * */
        this.defaultSetOfEncodedQueries = {
            "sys_user": "active=true",
            "sys_user_group": "active=true"
        };
    }

    /**
     * sourceTable: The table to query from to create payload for the typeahead component
     * currentElementId: The element on the UI, user is interacting with
     * encodedQuery: For additional filterings for a given source table
     * recordsCountToFetch: If consumer wants to have its own records count, honor that, otherwise default it
     */
    filterOptions(sourceTable, currentElementId, encodedQuery, recordsCountToFetch) {
        var resp = {
            "items": [],
            "currentElementId": null
        };

        var gr = new GlideRecordSecure(sourceTable);
        gr.addEncodedQuery(this._createEncodedQuery(sourceTable, encodedQuery), true);
        gr.setLimit(recordsCountToFetch || this.defaultRecordsCountToFetch);
        gr.orderBy(gr.getDisplayName());
        gr.query();
        while (gr.next()) {
            var item = {
                "id": gr.getValue("sys_id"),
                "label": gr.getDisplayValue()
            };
            resp.items.push(item);
        }
        resp.currentElementId = currentElementId;
        return resp;
    }

    _createEncodedQuery(tableName, addtionalUserQuery) {
        var finalQuery = "";
        if (this.defaultSetOfEncodedQueries.hasOwnProperty(tableName)) {
            finalQuery += "^" + this.defaultSetOfEncodedQueries[tableName];
        }
        if (addtionalUserQuery) {
            finalQuery += "^" + addtionalUserQuery;
        }
        return finalQuery;
    }
}
