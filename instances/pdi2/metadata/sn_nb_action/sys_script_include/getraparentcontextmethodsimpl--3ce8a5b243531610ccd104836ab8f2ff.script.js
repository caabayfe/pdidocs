var GetRAParentContextMethodsImpl = Class.create();
GetRAParentContextMethodsImpl.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    // Function that returns the reference qualifier query as a string
    getQuery: function(currContextTable) {
        const log = new global.GSLog(sn_nb_action.Constants.PROP_LOG_LEVEL, this.type);
        const nextBestActionDAO = new sn_nb_action.NextBestActionDAO();
        if (!currContextTable) {
            log.error("Current context table is empty.");
            return "sys_id=-1"; // Return an invalid query to avoid errors
        }
        var parentTables = this.fetchParentTables(currContextTable);
        if (!parentTables || parentTables.length === 0) {
            log.error("No parent tables found for: " + currContextTable);
            return "sys_id=-1";
        }
        var contextQuery = "active=true^contextIN" + parentTables.map(table => table).join(",");
        var contextList = new GlideRecordSecure(Constants.TBL_RULE_CONTEXT);
        contextList.addQuery(contextQuery);
        contextList.query();
        var contextSysIdListWithoutInput = [];
        while (contextList.next()) {
            if (!nextBestActionDAO.hasContextInputs(contextList, true)) {
                contextSysIdListWithoutInput.push(contextList.getValue(Constants.COL_SYS_ID));
            }
        }
        if (!contextSysIdListWithoutInput || contextSysIdListWithoutInput.length == 0) {
            log.error("No parent tables without context inputs found for " + currContextTable);
            return "sys_id=-1";
        }
        var query = "sys_idIN" + contextSysIdListWithoutInput.join(",");
        gs.info("Query passed to the reference qualifier - " + query);
        return query;
    },
    // Function to check if there are any valid parent records
    hasParentContextRecords: function() {
        var currContextTable = this.getParameter('sysparm_currContextTable');
        if (!currContextTable) return false;
        var parentTables = this.fetchParentTables(currContextTable);
        if (!parentTables || parentTables.length === 0) return false;

        var gr = new GlideRecordSecure(Constants.TBL_RULE_CONTEXT);
        gr.addQuery(Constants.COL_ACTIVE, true);
        var queryCondition = gr.addQuery(Constants.COL_CONTEXT, parentTables[0]);
        for (var i = 1; i < parentTables.length; i++) {
            queryCondition.addOrCondition(Constants.COL_CONTEXT, parentTables[i]);
        }
        gr.query();
        return gr.hasNext();
    },
    // Function to check if there are any valid extended context records
    hasExtendedContextRecords: function() {
        var currContextId = this.getParameter('sysparm_currContextId');
        if (!currContextId) return false;
        var gr = new GlideRecordSecure(sn_nb_action.Constants.TBL_RULE_CONTEXT);
        gr.addQuery(sn_nb_action.Constants.COL_MAP_PARENT_CONTEXT, currContextId);
        gr.query();
        return gr.hasNext();
    },
    // Function to check if there are duplicate active context records present on the same table.
    isDuplicateContextRecordPresent: function() {
        var currContextId = this.getParameter('sysparm_currContextId');
        var currContextTable = this.getParameter('sysparm_currContextTable');
        var isContextActive = this.getParameter('sysparm_currContextActiveStatus');
        if (isContextActive == "true") {
            var gr = new GlideRecordSecure(sn_nb_action.Constants.TBL_RULE_CONTEXT);
            gr.addQuery(sn_nb_action.Constants.COL_CONTEXT, currContextTable);
            gr.addQuery(sn_nb_action.Constants.COL_ACTIVE, true);
            gr.addQuery(sn_nb_action.Constants.COL_SYS_ID, '!=', currContextId);
            gr.query();
            return gr.hasNext();
        } else {
            return false;
        }
    },
    // Helper function to find the parents of the child table in the hierarchy
    fetchParentTables: function(childTable) {
        var tableHierarchy = new GlideTableHierarchy(childTable);
        var tables = tableHierarchy.getTables();
        return tables.filter(table => table != childTable);
    },

    type: 'GetRAParentContextMethodsImpl'
});
