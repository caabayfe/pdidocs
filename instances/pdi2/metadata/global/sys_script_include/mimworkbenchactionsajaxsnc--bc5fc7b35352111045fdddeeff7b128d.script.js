var MIMWorkbenchActionsAjaxSNC = Class.create();
MIMWorkbenchActionsAjaxSNC.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    initialize: function(request, response, processor) {
		AbstractAjaxProcessor.prototype.initialize.call(this, request, response, processor);
	},

    addChildTasks: function() {
        var taskSysId = this.getParameter("sysparm_sys_id");
        var table = this.getParameter("sysparm_table");
        var selectedTasks = this.getParameter("sysparm_selected_tasks");
        var query = this.getParameter("sysparm_query");
        var parentColumn = this.getParameter("sysparm_parent_column");
        var type = this.getParameter("sysparm_type");

        if (!taskSysId) {
            gs.log("[addChildTasks] Invalid Parameter - sysparm_sys_id is empty or null");
            return;
        }
        if (!table) {
            gs.log("[addChildTasks] Invalid Parameter - sysparm_table is empty or null");
            return;
        }
        if (!parentColumn) {
            gs.log("[addChildTasks] Invalid Parameter - sysparm_parent_column is empty or null");
            return;
        }

        var taskGr = new GlideRecordSecure(table);
        if (taskGr.canWrite() && taskGr.getElement(parentColumn).canWrite()) {
            taskGr.addQuery('sys_id', '!=', taskSysId);
            var qc = taskGr.addQuery(parentColumn, '!=', taskSysId);
            qc.addOrCondition(parentColumn, 'null');
            if (type == 'add_selected')
                taskGr.addQuery('sys_id', 'IN', selectedTasks);
            else if (this._isSafeEncodedQuery(query))
                taskGr.addEncodedQuery(query, true);
            else
                return;
            taskGr.setValue(parentColumn, taskSysId);
            taskGr.updateMultiple();
        }
        return;
    },
	
    _isSafeEncodedQuery: function(q) {
        if (!q) return false;
        var lower = q.toLowerCase();
        return lower.indexOf('^nq') === -1 && lower.indexOf('javascript:') === -1 && lower.indexOf('^join') === -1 && lower.indexOf('^orjoin') === -1;
    },

    addAffectedLocations: function() {
        var taskSysId = this.getParameter("sysparm_sys_id");
        var selectedLocations = this.getParameter("sysparm_selected_locations");
        var query = this.getParameter("sysparm_query");
        var type = this.getParameter("sysparm_type");

        if (!taskSysId) {
            gs.log("[addAffectedLocations] Invalid Parameter - sysparm_sys_id is empty or null");
            return;
        }

        var taskLocationGr = new GlideRecordSecure('task_location');
        if (taskLocationGr.canCreate()) {
            if (type == 'add_selected') {
                if (!selectedLocations) {
                    gs.log("[addAffectedLocations] Invalid Parameter - sysparm_selected_tasks is empty or null");
                    return;
                }
                selectedLocations = selectedLocations.split(',');
                for (var i = 0; i < selectedLocations.length; i++) {
                    var location = selectedLocations[i];
                    taskLocationGr = new GlideRecordSecure('task_location');
                    taskLocationGr.addQuery('task', taskSysId);
                    taskLocationGr.addQuery('location', location);
                    taskLocationGr.setLimit(1);
                    taskLocationGr.query();
                    if (!taskLocationGr.hasNext()) {
                        var newTaskLocationGr = new GlideRecordSecure('task_location');
                        newTaskLocationGr.setValue('task', taskSysId);
                        newTaskLocationGr.setValue('location', location);
                        newTaskLocationGr.insert();
                    }
                }
            } else if (type == 'add_all') {
                if (!this._isSafeEncodedQuery(query))
                    return;
                var locationGr = new GlideRecordSecure('cmn_location');
                locationGr.addEncodedQuery(query, true);
                locationGr.query();
                while (locationGr.next()) {
                    taskLocationGr = new GlideRecordSecure('task_location');
                    taskLocationGr.addQuery('task', taskSysId);
                    taskLocationGr.addQuery('location', locationGr.getUniqueValue());
                    taskLocationGr.setLimit(1);
                    taskLocationGr.query();
                    if (!taskLocationGr.hasNext()) {
                        var newTaskLocationGr1 = new GlideRecordSecure('task_location');
                        newTaskLocationGr1.setValue('task', taskSysId);
                        newTaskLocationGr1.setValue('location', locationGr.getUniqueValue());
                        newTaskLocationGr1.insert();
                    }
                }
            }
        }
        return;
    },

    addRelatedRecords: function() {
        var taskSysId = this.getParameter("sysparm_sys_id");
        var table = this.getParameter("sysparm_table");
        var selectedRecords = this.getParameter("sysparm_selected");
        var query = this.getParameter("sysparm_query");
        var parentColumn = this.getParameter("sysparm_parent_column");
        var type = this.getParameter("sysparm_type");

        if (!taskSysId) {
            gs.log("[addRelatedRecords] Invalid Parameter - sysparm_sys_id is empty or null");
            return;
        }
        if (!table) {
            gs.log("[addRelatedRecords] Invalid Parameter - sysparm_table is empty or null");
            return;
        }
        if (!parentColumn) {
            gs.log("[addRelatedRecords] Invalid Parameter - sysparm_parent_column is empty or null");
            return;
        }

        var relatedRecordGr = new GlideRecordSecure(table);
        if (relatedRecordGr.canWrite() && (relatedRecordGr.getElement(parentColumn).canWrite() || table == 'sn_cim_register')) { // TODO: remove skip condition for sn_csi_register, once ITIL user is provided with access to write parent field
            var qc = relatedRecordGr.addQuery(parentColumn, '!=', taskSysId);
            qc.addOrCondition(parentColumn, 'null');
            if (type == 'add_selected')
                relatedRecordGr.addQuery('sys_id', 'IN', selectedRecords);
            else if (this._isSafeEncodedQuery(query))
                relatedRecordGr.addEncodedQuery(query, true);
            else
                return;
            relatedRecordGr.setValue(parentColumn, taskSysId);
            relatedRecordGr.updateMultiple();
        }
        return;
    },

    addRelatedRecordsCIM: function() {
        var taskSysId = this.getParameter("sysparm_sys_id");
        var table = this.getParameter("sysparm_table");
        var selectedRecords = this.getParameter("sysparm_selected");
        var type = this.getParameter("sysparm_type");

        if (!taskSysId) {
            gs.log("[addRelatedRecordsCIM] Invalid Parameter - sysparm_sys_id is empty or null");
            return;
        }
        if (!table) {
            gs.log("[addRelatedRecordsCIM] Invalid Parameter - sysparm_table is empty or null");
            return;
        }

        var relatedRecordGr = new GlideRecordSecure(table);
        if (relatedRecordGr.canWrite() && relatedRecordGr.getElement('cim_register').canWrite() && relatedRecordGr.getElement('source_id').canWrite() && relatedRecordGr.getElement('source_table').canWrite()) {
            if (type == 'add_all') {
                var cimRegisterGr = new GlideRecordSecure('sn_cim_register');
                cimRegisterGr.query();
                while (cimRegisterGr.next())
                    this._createInboundCIM(cimRegisterGr.getUniqueValue() + "", taskSysId, table);
                return;
            }
            var selectedRecordsArr = selectedRecords.split(",");
            for (var i = 0; i < selectedRecordsArr.length; i++)
                this._createInboundCIM(selectedRecordsArr[i], taskSysId, table);
        }
        return;
    },

    _createInboundCIM: function(cimRegisterId, taskSysId, table) {
        var relatedRecordGr = new GlideRecordSecure(table);
        relatedRecordGr.addQuery('cim_register', cimRegisterId);
        relatedRecordGr.addQuery('source_id', taskSysId);
        relatedRecordGr.addQuery('source_table', 'incident');
        relatedRecordGr.query();
        if (!relatedRecordGr.hasNext()) {
            var insertRecordGr = new GlideRecordSecure(table);
            insertRecordGr.initialize();
            insertRecordGr.setValue("cim_register", cimRegisterId);
            insertRecordGr.setValue("source_id", taskSysId);
            insertRecordGr.setValue("source_table", "incident");
            insertRecordGr.insert();
        }
        return;
    },

    type: 'MIMWorkbenchActionsAjaxSNC'
});
