var BulkAddIncidents = Class.create();
BulkAddIncidents.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    PARAMS: {
        SYSID: "sysparm_sys_id",
        PARENTTABLE: "sysparm_parent_table",
        TABLE: "sysparm_table",
        VIEW: "sysparm_view",
        NOSTACK: "sysparm_nostack",
        QUERY: "sysparm_query",
        PARENTCOLUMN: "sysparm_parent_column",
        FIXEDQUERY: "sysparm_fixed_query",
        JS: "sysparm_js",
        JSTYPE: "sysparm_js_type",
        SELECTEDTASKS: "sysparm_selected_tasks",
        TYPE: "sysparm_type"
    },

    CONSTANTS: {
        TASK_TABLE: "task",
        CLASS_NAME: "sys_class_name"
    },

    getFixedQuery: function(parentTable, parentColumn) {
        var eps = new GlideScriptedExtensionPoint().getExtensions("BulkAddIncidentsFilter");
        for (var i = 0; i < eps.length; i++) {
            var query = eps[i].getFixedQuery(parentTable, parentColumn);
            if (typeof query === "undefined")
                continue;
            return query;
        }
        return new global.BulkAddRecords().getFixedQuery(parentTable, parentColumn);
    },

    canRelateIncidents: function(parentTable, relatedRecordGr, parentColumn) {
        var eps = new GlideScriptedExtensionPoint().getExtensions("BulkAddIncidentsFilter");
        for (var i = 0; i < eps.length; i++) {
            var check = eps[i].canRelateIncidents(parentTable, relatedRecordGr, parentColumn);
            if (typeof check === "undefined")
                continue;
            return check;
        }
        return new global.BulkAddRecords().canRelateRecord(parentTable, relatedRecordGr, parentColumn);
    },

    getURL: function() {
        var sysId = this.getParameter(this.PARAMS.SYSID);
        var pTable = this.getParameter(this.PARAMS.PARENTTABLE);
        var url = new GlideURL("incident_add_records.do");
        var parentColumn = gs.getProperty('com.snc.incident.link_to_task.' + pTable);
        var fixedQuery = this.getFixedQuery(pTable, parentColumn);

        url.set(this.PARAMS.SYSID, sysId);
        url.set(this.PARAMS.VIEW, "default");
        url.set(this.PARAMS.NOSTACK, "true");
        url.set(this.PARAMS.QUERY, "ORDERBYDESCsys_created_on");
        url.set(this.PARAMS.TABLE, "incident");
        url.set(this.PARAMS.PARENTCOLUMN, parentColumn);
        url.set(this.PARAMS.FIXEDQUERY, fixedQuery);
        url.set(this.PARAMS.JS, "incident_link_task.js");
        url.set(this.PARAMS.JSTYPE, "file_system");
        return url;
    },

    linkTasks: function() {

        var taskSysId = this.getParameter(this.PARAMS.SYSID);
        var table = this.getParameter(this.PARAMS.TABLE);
        var selectedRecords = this.getParameter(this.PARAMS.SELECTEDTASKS);
        var query = this.getParameter(this.PARAMS.QUERY);
        var parentColumn = this.getParameter(this.PARAMS.PARENTCOLUMN);
        var type = this.getParameter(this.PARAMS.TYPE);

        if (!taskSysId) {
            gs.error("[BulkAddIncidents] Invalid Parameter - sysparm_sys_id is empty or null");
            return;
        }
        if (!table) {
            gs.error("[BulkAddIncidents] Invalid Parameter - sysparm_table is empty or null");
            return;
        }
        if (!parentColumn) {
            gs.error("[BulkAddIncidents] Invalid Parameter - sysparm_parent_column is empty or null");
            return;
        }

        var grTask = new GlideRecordSecure(this.CONSTANTS.TASK_TABLE);
        if (!grTask.get(taskSysId))
            return;
        var pTable = grTask.getValue(this.CONSTANTS.CLASS_NAME);

        var relatedRecordGr = new GlideRecordSecure(table);
        if (relatedRecordGr.isValid() && (gs.hasRole('itil') || gs.hasRole('sn_incident_write'))) {
            relatedRecordGr.addQuery(parentColumn, 'null');
            if (type == 'add_selected')
                relatedRecordGr.addQuery('sys_id', 'IN', selectedRecords);
            else
                relatedRecordGr.addEncodedQuery(query);
            relatedRecordGr.query();
            if (type == 'add_selected') {
                while (relatedRecordGr.next()) {
                    if (this.canRelateIncidents(pTable, relatedRecordGr, parentColumn)) {
                        relatedRecordGr.setValue(parentColumn, taskSysId);
                        relatedRecordGr.update();
                    }
                }
            } else {
                var incidents = [];
                while (relatedRecordGr.next()) {
                    if (this.canRelateIncidents(pTable, relatedRecordGr, parentColumn)) {
                        incidents.push(relatedRecordGr.getValue("sys_id"));
                    }
                }
                var inputs = {
                    problem: taskSysId,
                    incidents: incidents
                };
                try {
                    sn_fd.FlowAPI.startSubflowQuick('global.add_all_incidents', inputs);
                } catch (e) {
                    gs.error("Error while adding incident on problem " + e.getMessage());
                }
            }

        }
        return;
    },

    canShowAddButton: function(parent, current) {
        var field = gs.getProperty('com.snc.incident.link_to_task.' + parent.sys_class_name);
        return parent.active == true && current.isValidField(field);
    },

    type: 'BulkAddIncidents'
});
