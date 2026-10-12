var PopulateDuplicateTaskGroups = Class.create();
PopulateDuplicateTaskGroups.prototype = {
    initialize: function() {
        this.TABLE = {
            DUPLICATE_TASK_DATA_GROUP: 'sn_cmdb_ws_reconcile_duplicate_task_group',
            RECONCILE_DUPLICATE_TASK_DATA: 'reconcile_duplicate_task_data',
            GROUP_TASK_M2M: 'sn_cmdb_ws_reconcile_duplicate_task_group_m2m'
        };

        this.COLUMN = {
            TASK: 'task',
            GROUP: 'group',
            TABLE: 'table',
            IDENTIFIER_ENTRY: 'identifier_entry',
            DISCOVERY_SOURCE: 'discovery_source',
            DISCOVERY_SOURCES: 'discovery_sources',
            VALUE: 'value',
            CATEGORY: 'category',
            CLASS: 'class',
            KEY: 'key',
            RULE: 'rule',
            STATE: 'state',
            SYSID: 'sys_id'
        };

        this.STATE = {
            DRAFT: 1,
            READY: 2,
            RETIRED: 3
        };

        this.VARS = {
            GROUP_SYS_ID: 'groupSysId',
            DISCOVERY_SOURCE_STRING: 'discoverySourceString'
        };
        this.DELIMITER = ", ";
    },

    populate: function() {
        var ruleClassSourceMap = {};
        var gr = new GlideRecord(this.TABLE.RECONCILE_DUPLICATE_TASK_DATA);
        // add active query to both halves of the sub query
        gr.addQuery('task.active', true);
        gr.addEncodedQuery('category=identifier_entry^key=rule^NQcategoryINclass,discovery_source');
        gr.addQuery('task.active', true);
        gr.orderBy(this.COLUMN.TASK);
        gr.query();
        var currentTask = "";
        var taskClassArray = [];
        var rule = "";
        var taskSourceArray = [];
        while (gr.next()) {
            var taskSysId = gr.getValue(this.COLUMN.TASK);
            try {
                if (!currentTask)
                    currentTask = taskSysId;
                // either the task is a new task or this is the last record in the task data table, so do inserts
                if (currentTask != taskSysId || !gr.hasNext()) {
                    if (!gr.hasNext()) {
                        var value = gr.getValue(this.COLUMN.VALUE);
                        if (gr.getValue(this.COLUMN.KEY) == this.COLUMN.RULE) {
                            rule = value;
                        } else if (gr.getValue(this.COLUMN.CATEGORY) == this.COLUMN.DISCOVERY_SOURCE) {
                            taskSourceArray.push(value);
                        } else if (gr.getValue(this.COLUMN.CATEGORY) == this.COLUMN.CLASS) {
                            taskClassArray.push(value);
                        }
                    }
                    // sort and stringify the discovery source array
                    var taskSourceString = taskSourceArray.sort().join(this.DELIMITER);
                    // save the new group(s) if they don't exist 
                    for (var i = 0; i < taskClassArray.length; i++) {
                        if (!ruleClassSourceMap[rule] || !ruleClassSourceMap[rule][taskClassArray[i]]) {
                            // Save the new group and store its sys_id in the map
                            var groupGr = new GlideRecord(this.TABLE.DUPLICATE_TASK_DATA_GROUP);
                            groupGr.setValue(this.COLUMN.TABLE, taskClassArray[i]);
                            groupGr.setValue(this.COLUMN.IDENTIFIER_ENTRY, rule);
                            groupGr.setValue(this.COLUMN.DISCOVERY_SOURCES, taskSourceString);
                            groupGr.insert();
                            if (!ruleClassSourceMap[rule])
                                ruleClassSourceMap[rule] = {};
                            if (!ruleClassSourceMap[rule][taskClassArray[i]])
                                ruleClassSourceMap[rule][taskClassArray[i]] = {
                                    'groupSysId': groupGr.getUniqueValue(),
                                    'discoverySourceString': taskSourceString
                                };

                        } else if (ruleClassSourceMap[rule] && ruleClassSourceMap[rule][taskClassArray[i]] && ruleClassSourceMap[rule][taskClassArray[i]][this.VARS.DISCOVERY_SOURCE_STRING] != taskSourceString) {
                            // add new discovery source to the group record
                            var groupGr = new GlideRecord(this.TABLE.DUPLICATE_TASK_DATA_GROUP);
                            // TODO This is an error the record should be inserted in previous if statement
                            if (!groupGr.get(ruleClassSourceMap[rule][taskClassArray[i]][this.VARS.GROUP_SYS_ID])) {
                                gs.warn('PopulateDuplicateTaskGroups: Could not find record for ' + taskClassArray[i] + ' ' + rule);
                                continue;
                            }
                            var currentDiscoverySources = groupGr.getValue(this.COLUMN.DISCOVERY_SOURCES) ? groupGr.getValue(this.COLUMN.DISCOVERY_SOURCES).split() : [];
                            // insert discovery source if its unique
                            for (var j = 0; j < taskSourceArray.length; j++) {
                                if (currentDiscoverySources.indexOf(taskSourceArray[j]) < 0) {
                                    currentDiscoverySources.push(taskSourceArray[j]);
                                }
                            }
                            var sortedDiscoSourcesString = currentDiscoverySources.sort().join(this.DELIMITER);
                            groupGr.setValue(this.COLUMN.DISCOVERY_SOURCES, sortedDiscoSourcesString);
                            groupGr.update();
                            ruleClassSourceMap[rule][taskClassArray[i]][this.VARS.DISCOVERY_SOURCE_STRING] = sortedDiscoSourcesString;
                        }
                        var groupId = ruleClassSourceMap[rule][taskClassArray[i]][this.VARS.GROUP_SYS_ID];
                        var taskGroupGr = new GlideRecord(this.TABLE.GROUP_TASK_M2M);
                        taskGroupGr.setValue(this.COLUMN.GROUP, groupId);
                        taskGroupGr.setValue(this.COLUMN.TASK, currentTask);
                        taskGroupGr.insert();
                    }
                    taskClassArray = [];
                    rule = "";
                    taskSourceArray = [];
                    taskSourceString = "";
                    currentTask = taskSysId;
                }
                var value = gr.getValue(this.COLUMN.VALUE);
                if (gr.getValue(this.COLUMN.KEY) == this.COLUMN.RULE) {
                    rule = value;
                } else if (gr.getValue(this.COLUMN.CATEGORY) == this.COLUMN.DISCOVERY_SOURCE) {
                    taskSourceArray.push(value);
                } else if (gr.getValue(this.COLUMN.CATEGORY) == this.COLUMN.CLASS) {
                    taskClassArray.push(value);
                }
            } catch (error) {
                gs.error("Failed to populate duplicate task group for task {0} : {1}", [taskSysId, error]);
            }
        }
        this._updateState();
    },

    _updateState: function() {
        var gr = new GlideRecord(this.TABLE.DUPLICATE_TASK_DATA_GROUP);
        gr.addQuery(this.COLUMN.STATE, this.STATE.READY);
        gr.query();
        gr.setValue(this.COLUMN.STATE, this.STATE.RETIRED);
        gr.updateMultiple();
        gr = new GlideRecord(this.TABLE.DUPLICATE_TASK_DATA_GROUP);
        gr.addQuery(this.COLUMN.STATE, this.STATE.DRAFT);
        gr.query();
        gr.setValue(this.COLUMN.STATE, this.STATE.READY);
        gr.updateMultiple();
    },

    type: 'PopulateDuplicateTaskGroups'
};
