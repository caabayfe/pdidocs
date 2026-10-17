var PopulateDuplicateTaskClassInfo = Class.create();
PopulateDuplicateTaskClassInfo.prototype = {
    DUPLICATE_AUDIT_RESULT: 'duplicate_audit_result',
    RECONCILE_DUPLICATE_TASK_DATA: 'reconcile_duplicate_task_data',
    RECONCILE_DUPLICATE_TASK: 'reconcile_duplicate_task',
    FOLLOW_ON_TASK: 'follow_on_task',
    DUPLICATE_CI: 'duplicate_ci',
    CATEGORY: 'category',
    KEY: 'key',
    VALUE: 'value',
    TASK: 'task',
    TABLE: 'table',
    CMDB_CI: 'cmdb_ci',
    CLASS_NAME: 'class',
    SYS_ID: 'sys_id',
    SYS_CLASS_NAME: 'sys_class_name',
    EXPRESS_FLOW_CI_COUNT: 5000,
    CI_COUNT_DEFAULT_VALUE: 1000,
    CI_BATCH_SIZE: 100,
    MAX_BACKFILL_RUN_TIME_PROPERTY: 'glide.duplicate_ci_remediator.backfill_reconcile_duplicate_task_data.max_run_time_seconds',
    MAX_CI_COUNT_PROPERTY: 'glide.duplicate_ci_remediator.max.cis',
    TASK_BATCH_SIZE_PROPERTY: 'glide.duplicate_ci_remediator.backfill_reconcile_duplicate_task_data.batch_size',
    TASK_BATCH_SIZE_DEFAULT_VALUE: 2000,
    BACKFILL_JOB_SYS_ID: '320309d35d3a8f90f8774783f7d80849',
    CHECKPOINT_SYS_ID_KEY: 'duplicateTaskDataBackfillCpSysId',
    BOUNDARY_CREATED_ON_KEY: 'duplicateTaskDataBackfillBoundaryCreatedOn',

    initialize: function() {
        this.MAX_CI_COUNT = Math.min(this.EXPRESS_FLOW_CI_COUNT, gs.getProperty(this.MAX_CI_COUNT_PROPERTY, this.CI_COUNT_DEFAULT_VALUE));
        this.MAX_RUN_TIME = gs.getProperty(this.MAX_BACKFILL_RUN_TIME_PROPERTY, 60 * 60);
        this.TASK_BATCH_SIZE = gs.getProperty(this.TASK_BATCH_SIZE_PROPERTY, this.TASK_BATCH_SIZE_DEFAULT_VALUE);
    },

    populateData: function() {
        var maxRunTimeInMs = this.MAX_RUN_TIME * 1000;
        var boundaryCreatedOn = this._getBoundarySysCreatedOn();

        if (!boundaryCreatedOn) {
            boundaryCreatedOn = this._findAndSaveBoundaryCreatedOn();
            if (!boundaryCreatedOn) {
                gs.info('PopulateDuplicateTaskClassInfo: Unable to determine backfill boundary. Deactivating job.');
                this._deactivateJob();
                return;
            }
        }

        var checkpointSysId = this._getCheckpointSysId();
        var totalTime = 0;
        var startTime = new GlideDateTime();

        while (totalTime < maxRunTimeInMs) {
            var gr = new GlideRecord(this.RECONCILE_DUPLICATE_TASK);
            gr.addQuery('state', '1');
            gr.addQuery('sys_created_on', '<=', boundaryCreatedOn);

            if (checkpointSysId) {
                gr.addQuery('sys_id', '>', checkpointSysId);
            }

            gr.orderBy('sys_id');
            gr.setLimit(this.TASK_BATCH_SIZE);
            gr.query();

            var tasks = [];
            var lastSysId = null;

            while (gr.next()) {
                tasks.push({
                    id: gr.getUniqueValue(),
                    domain: gr.getValue('sys_domain')
                });

                lastSysId = gr.getUniqueValue();

                if (tasks.length >= this.CI_BATCH_SIZE) {
                    this._populateClassInfo(tasks);
                    this._saveCheckpointSysId(lastSysId);
                    tasks = [];
                }
            }

            if (tasks.length > 0) {
                this._populateClassInfo(tasks);
                this._saveCheckpointSysId(lastSysId);
            }

            checkpointSysId = lastSysId;

            if (gr.getRowCount() < this.TASK_BATCH_SIZE) {
                gs.info('PopulateDuplicateTaskClassInfo: Fewer tasks than' + this.TASK_BATCH_SIZE + 'were returned and there is nothing left to process. Deactivating Job.');
                this._deactivateJob();
                break;
            }

            totalTime = new GlideDateTime().getNumericValue() - startTime.getNumericValue();
        }

        var executionTime = new GlideDateTime().getNumericValue() - startTime.getNumericValue();
        gs.info('PopulateDuplicateTaskClassInfo: Run completed in ' + (executionTime / 1000) + ' seconds. Last processed Sys_Id: ' + checkpointSysId);
    },

    /*
     * Finds the boundary: the sys_created_on of the task referenced by the earliest task_data record.
     * All tasks with sys_created_on before this value are candidates for backfill.
     * If no task_data exists anywhere yet (e.g. right after an upgrade, before the forward
     * populator has ever run), there is no reference point to derive from - default the boundary
     * to now so every existing task becomes a backfill candidate instead of skipping the run.
     */
    _findAndSaveBoundaryCreatedOn: function() {
        var taskDataGr = new GlideRecord(this.RECONCILE_DUPLICATE_TASK_DATA);
        taskDataGr.orderBy('sys_created_on');
        taskDataGr.setLimit(1);
        taskDataGr.query();

        var boundaryCreatedOn;
        if (!taskDataGr.next()) {
            boundaryCreatedOn = new GlideDateTime().getValue();
            gs.info('PopulateDuplicateTaskClassInfo: No existing task_data found. Using current time as boundary to backfill all existing tasks.');
        } else {
            boundaryCreatedOn = taskDataGr.task.sys_created_on;
            if (!boundaryCreatedOn) {
                gs.error('PopulateDuplicateTaskClassInfo: Unable to determine boundary. Task referenced by earliest task_data record does not exist.');
                return null;
            }
            gs.info('PopulateDuplicateTaskClassInfo: Boundary found. sys_created_on=' + boundaryCreatedOn);
        }

        this._setContextValue(this.BOUNDARY_CREATED_ON_KEY, boundaryCreatedOn);
        return boundaryCreatedOn;
    },

    _populateClassInfo: function(tasks) {
        if (!Array.isArray(tasks) || tasks.length === 0) {
            return;
        }
        for (var i = 0; i < tasks.length; i++) {
            var taskId = tasks[i].id;
            var taskDomain = tasks[i].domain;
            var classes = this._getClassesFromDB(taskId);
			this._populateTaskData(classes, taskId, taskDomain);
        }
    },

    _populateTaskData: function(classes, taskId, taskDomain) {
        var existingTaskDataGr = new GlideRecord(this.RECONCILE_DUPLICATE_TASK_DATA);
        existingTaskDataGr.addQuery(this.TASK, taskId);
        existingTaskDataGr.setLimit(1);
        existingTaskDataGr.query();
        if (existingTaskDataGr.next()) {
            return;
        }
        for (var className in classes) {
            var gr = new GlideRecord(this.RECONCILE_DUPLICATE_TASK_DATA);
            gr.setValue(this.CATEGORY, this.CLASS_NAME);
            gr.setValue(this.KEY, className);
            gr.setValue(this.VALUE, className);
            gr.setValue(this.TASK, taskId);
            gr.setValue('sys_domain', taskDomain);
            gr.insert();
        }
    },

    _getClassesFromDB: function(taskId) {
        var classes = {};
        var duplicateAuditResultInfo = this._getCIsFromDB(taskId);

        if (duplicateAuditResultInfo.count === 0) {
            return classes;
        }

        if (duplicateAuditResultInfo.isLarge) {
            gs.info('Task: ' + taskId + ' has ' + duplicateAuditResultInfo.count + ' records which exceeds max threshold of ' + this.MAX_CI_COUNT + '. Cannot populate class info.');
        } else if (!this._isCMDBCI(duplicateAuditResultInfo.table)) {
            classes[duplicateAuditResultInfo.table] = true;
        } else {
            for (var i = 0; i < duplicateAuditResultInfo.taskCIs.length; i += this.CI_BATCH_SIZE) {
                var chunk = duplicateAuditResultInfo.taskCIs.slice(i, i + this.CI_BATCH_SIZE);
                var ga = new GlideAggregate(duplicateAuditResultInfo.table);
                ga.addQuery(this.SYS_ID, 'IN', chunk);
                ga.groupBy(this.SYS_CLASS_NAME);
                ga.query();
                while (ga.next()) {
                    classes[ga.getValue(this.SYS_CLASS_NAME)] = true;
                }
            }
        }
        return classes;
    },

    _getCIsFromDB: function(taskId) {
        var duplicateAuditResultInfo = {
            count: 0,
            isLarge: false,
            taskCIs: [],
            table: ''
        };

        var gr = new GlideRecord(this.DUPLICATE_AUDIT_RESULT);
        gr.addQuery(this.FOLLOW_ON_TASK, taskId);
        gr.setLimit(this.MAX_CI_COUNT + 1);
        gr.query();

        if (gr.getRowCount() == this.MAX_CI_COUNT + 1) {
            duplicateAuditResultInfo.count = this.MAX_CI_COUNT + 1;
            duplicateAuditResultInfo.isLarge = true;
            duplicateAuditResultInfo.taskCIs = [];
            return duplicateAuditResultInfo;
        }

        var tableChecked = false;
        while (gr.next()) {
            duplicateAuditResultInfo.count++;
            var ciSysId = gr.getValue(this.DUPLICATE_CI);
            var table = gr.getValue(this.TABLE);
            if (ciSysId && table) {
                // Check if non-CMDB table on first valid record and exit early
                if (!tableChecked) {
                    tableChecked = true;
                    if (!this._isCMDBCI(table)) {
                        // Non-CMDB tables don't need sys_class_name aggregation
                        duplicateAuditResultInfo.table = table;
                        duplicateAuditResultInfo.taskCIs = [];
                        return duplicateAuditResultInfo;
                    }
                }
                duplicateAuditResultInfo.taskCIs.push(ciSysId);
                duplicateAuditResultInfo.table = table;
            }
        }
        return duplicateAuditResultInfo;
    },

    _isCMDBCI: function(className) {
        return GlideDBObjectManager.getAbsoluteBase(className) == this.CMDB_CI;
    },

    _getCheckpointSysId: function() {
        return this._getContextValue(this.CHECKPOINT_SYS_ID_KEY);
    },

    _saveCheckpointSysId: function(sysId) {
        if (!sysId) {
            return;
        }
        this._setContextValue(this.CHECKPOINT_SYS_ID_KEY, sysId);
    },

    _getBoundarySysCreatedOn: function() {
        return this._getContextValue(this.BOUNDARY_CREATED_ON_KEY);
    },

    _getContextValue: function(key) {
        var gr = new GlideRecord('cmdb_job_context');
        gr.addQuery('key', key);
        gr.setLimit(1);
        gr.query();
        return gr.next() ? gr.getValue('value') : null;
    },

    _setContextValue: function(key, value) {
        if (!value) {
            return;
        }
        var gr = new GlideRecord('cmdb_job_context');
        gr.addQuery('key', key);
        gr.setLimit(1);
        gr.query();
        if (gr.next()) {
            gr.setValue('value', value);
            gr.update();
        } else {
            gr.setValue('key', key);
            gr.setValue('value', value);
            gr.insert();
        }
    },

    _deactivateJob: function() {
        var gr = new GlideRecord('sysauto_script');
        if (gr.get(this.BACKFILL_JOB_SYS_ID)) {
            gr.setValue('active', false);
            gr.update();
        } else {
            gs.error('PopulateDuplicateTaskClassInfo: Job record not found - De-duplication: Backfill Duplicate Task Data (Classes).');
        }
    },
    type: 'PopulateDuplicateTaskClassInfo'
};
