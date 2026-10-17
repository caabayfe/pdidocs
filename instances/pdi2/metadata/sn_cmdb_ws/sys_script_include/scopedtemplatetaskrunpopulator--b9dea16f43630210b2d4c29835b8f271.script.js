/**
 * This script include serves the following purpose:
 * 1. Get all the template runs in 'draft' state for current domain.
 * 2. For each run, populate the template column for tasks if there is a condition defined on the template
 * 3. For each run, populate the task run records for the manual and conditionally added tasks in 'ready' state
 * 4. For each run, populate the task run records for the skipped tasks in 'skipped' state
 * 5. Update the template run state to 'ready'
 */
var ScopedTemplateTaskRunPopulator = Class.create();
ScopedTemplateTaskRunPopulator.prototype = {
    MUTEX_EXPIRATION_TIME_PROPERTY: 'glide.cmdb.create_template_task_run.mutex_expiration_time_seconds',
    TEMPLATE_TASK_RUN_POPULATOR_MAX_RUN_TIME_PROPERTY: 'glide.cmdb.template_task_run.max_run_time_seconds',
    DOMAIN_SUPPORT_PLUGIN: 'com.glide.domain',
    GLIDE_SYS_DOMAIN_PARTITIONING_PROPERTY: 'glide.sys.domain.partitioning',
    RECONCILE_DUPLICATE_TEMPLATE: 'reconcile_duplicate_template',
    RECONCILE_DUPLICATE_TEMPLATE_RUN: 'reconcile_duplicate_template_run',
    RECONCILE_DUPLICATE_TEMPLATE_TASK_RUN: 'reconcile_duplicate_template_task_run',
    RECONCILE_DUPLICATE_TASK: 'reconcile_duplicate_task',
    RECONCILE_DUPLICATE_TASK_DATA: 'reconcile_duplicate_task_data',
    DUPLICATE_AUDIT_RESULT: 'duplicate_audit_result',
    DIFFERENT_TEMPLATE: 'different_template',
    TEMPLATE_TASK_NOT_COMPATIBLE: 'template_task_not_compatible',
    UPDATE_FAILED: 'update_failed',
    OPEN_STATE: 1,
    BATCH_SIZE: 100,
    GLIDE_AGGREGATES_MAX_LIMIT_PROPERTY: 'glide.db.max.aggregates',

    initialize: function () {
        this.MUTEX_EXPIRATION_TIME = gs.getProperty(this.MUTEX_EXPIRATION_TIME_PROPERTY, 4 * 60 * 60); // 4 hours
        this.MAX_RUN_TIME = gs.getProperty(this.TEMPLATE_TASK_RUN_POPULATOR_MAX_RUN_TIME_PROPERTY, 1 * 60 * 60); // 1 hour
        this.IS_DOMAIN_SUPPORT_ACTIVE = GlidePluginManager.isActive(this.DOMAIN_SUPPORT_PLUGIN) && gs.getProperty(this.GLIDE_SYS_DOMAIN_PARTITIONING_PROPERTY, 'false') == 'true';
        this.MAX_SUPPORTED_GLIDE_AGGREGATES = parseInt(gs.getProperty(this.GLIDE_AGGREGATES_MAX_LIMIT_PROPERTY, 100000));
        if (this.IS_DOMAIN_SUPPORT_ACTIVE) {
            this.CURRENT_DOMAIN = gs.getSession().getCurrentDomainID() != null ? gs.getSession().getCurrentDomainID() : 'global';
        }
    },

    populateRecords: function () {
        var startTime = new GlideTime();
        var totalTime = 0;
        var maxRunTimeInMs = this.MAX_RUN_TIME * 1000;
        var visitedTemplateRuns = {};

        while (totalTime < maxRunTimeInMs) {
            // Get the next template run currently in "draft" state
            var templateRunDraftGr = this._getTemplateRunInDraftState();
            // No records in the "draft" state. Nothing to process
            if (templateRunDraftGr == null) {
                break;
            }

            // If the same run is visited twice, it means we have no new runs to process.
            if (visitedTemplateRuns[templateRunDraftGr.getValue('sys_id')]) {
                break;
            }
            visitedTemplateRuns[templateRunDraftGr.getValue('sys_id')] = true;

            var templateRunObj = {
                run: templateRunDraftGr.getValue('sys_id'),
                template: templateRunDraftGr.getValue('template')
            };

            /**
             * 1. Try to acquire lock for the current template run.
             * 2. If we are not able to acquire the lock, do NOT retry as some other job might be working on it
             * 3. Proceed with the next run and repeat the same steps
             */
            var mutex = new GlideNativeRecordMutex(templateRunDraftGr);
            mutex.setMaxSpins(0);
            mutex.setMutexExpires(this.MUTEX_EXPIRATION_TIME * 1000);
            if (mutex.get()) {
                try {
                    // Populate the task run records for each of the template runs
                    var response = this._populateTaskRunRecords(templateRunObj);
                    if (response.status == 'success') {
                        // Update template run "state" column to ready and total column to # of tasks in the template task run table
                        var templateRunGr = new GlideRecord(this.RECONCILE_DUPLICATE_TEMPLATE_RUN);
                        if (templateRunGr.get(templateRunObj.run)) {
                            templateRunGr.setValue('state', 'ready');
                            templateRunGr.setValue('total', response.total);
                            templateRunGr.setValue('skipped', response.skipped);
                            templateRunGr.update();
                        }
                    }
                } finally {
                    mutex.release();
                }
            } else {
                gs.debug('Falied to acquire mutex for Template Run: ' + templateRunObj.run);
            }
            var endTime = new GlideTime();
            totalTime = endTime.getNumericValue() - startTime.getNumericValue();
        }
    },

    /**
     * Get the next template run currently in "draft state" in current domain.
     * We need to add the domain query here, otherwise it will return records from the child domains (for which this code will be called separately)
     */
    _getTemplateRunInDraftState: function () {
        var templateRunGr = new GlideRecord(this.RECONCILE_DUPLICATE_TEMPLATE_RUN);
        templateRunGr.addQuery('state', 'draft');
        if (this.IS_DOMAIN_SUPPORT_ACTIVE) {
            templateRunGr.addQuery('sys_domain', this.CURRENT_DOMAIN);
        }
        templateRunGr.orderBy('sys_created_on');
        templateRunGr.setLimit(1);
        templateRunGr.query();
        if (templateRunGr.next()) {
            return templateRunGr;
        }
        return null;
    },

    /**
     * Populate the task run records for the given template run
     */
    _populateTaskRunRecords: function (templateRunObj) {
        var runId = templateRunObj.run;
        var templateId = templateRunObj.template;

        var response = {};

        // If the template does not exist, log error and return
        var templateGr = new GlideRecord(this.RECONCILE_DUPLICATE_TEMPLATE);
        if (!templateGr.get(templateId)) {
            gs.debug('No template exists for run id: ' + runId);

            response.status = 'error';
            response.total = 0;
            response.skipped = 0;

            return response;
        }

        /**
         * Get all the conditions/script applicable for adding tasks to template.
         * 1. Class conditions which determine which appluy to de-duplication tasks created for certain classes
         * 2. Template conditions which apply to CIs. For example, add all tasks where the the CIs within the task have ram=1024
         * 3. Advanced script that returns the list of de-duplication task ids.
         *
         * If either condition/script is defined, populate the template for the tasks that match the condition/script
         * Otherwise, get the list of manually added tasks for the template
         */
        var resultTaskIds = {};
        if (templateGr.getValue('task_conditions') || templateGr.getValue('conditions') || (templateGr.getValue('advanced') && templateGr.getValue('script'))) {
            resultTaskIds = this._populateTemplateForManualAndConditionalTasks(templateGr);
        } else {
            resultTaskIds = this._getManualTaskIdsForTemplate(templateId);
        }

        // Populate the template task run records for the valid task ids with "state" as "ready"
        var validTaskIds = Object.keys(resultTaskIds.validTaskIds);
        for (var i = 0; i < validTaskIds.length; i++) {
            var templateTaskRunGr = new GlideRecord(this.RECONCILE_DUPLICATE_TEMPLATE_TASK_RUN);
            templateTaskRunGr.setValue('template', templateId);
            templateTaskRunGr.setValue('task', validTaskIds[i]);
            templateTaskRunGr.setValue('run', runId);
            templateTaskRunGr.setValue('state', 'ready');

            templateTaskRunGr.insert();
        }

        // Populate the template task run records for the skipped task ids with "state" as "skipped"
        var skippedTaskIds = Object.keys(resultTaskIds.skippedTaskIds);
        for (var j = 0; j < skippedTaskIds.length; j++) {
            var taskId = skippedTaskIds[j];
            var templateTaskRunSkippedGr = new GlideRecord(this.RECONCILE_DUPLICATE_TEMPLATE_TASK_RUN);
            templateTaskRunSkippedGr.setValue('template', templateId);
            templateTaskRunSkippedGr.setValue('task', taskId);
            templateTaskRunSkippedGr.setValue('message', resultTaskIds.skippedTaskIds[taskId].message);
            templateTaskRunSkippedGr.setValue('message_type', resultTaskIds.skippedTaskIds[taskId].messageType);
            templateTaskRunSkippedGr.setValue('run', runId);
            templateTaskRunSkippedGr.setValue('state', 'skipped');
            templateTaskRunSkippedGr.insert();
        }

        response.status = 'success';
        response.total = validTaskIds.length + skippedTaskIds.length;
        response.skipped = skippedTaskIds.length;

        return response;
    },

    /**
     * For tasks that match the condition and do not have the template, populate the template
     * For tasks that match the condition but already have a template, skip them
     * For tasks that do not match the condition but already have a template, do nothing
     * Return the set of valid (manual and conditional) and skipped task ids
     */
    _populateTemplateForManualAndConditionalTasks: function (templateGr) {
        // Tasks whose template column is already populated with some other templateId
        var skippedTaskIds = {};
        // Tasks whose template column is/will be populated with the current templateId
        var validTaskIds = {};

        // Populate the manually added task ids first
        validTaskIds = this._getManualTaskIdsForTemplate(templateGr.getValue('sys_id')).validTaskIds;

        // Populate template for tasks that match class condition e.g. class=cmdb_ci_win_server^EQ or classINSTANCE_OFcmdb_ci_computer
        if (templateGr.getValue('task_conditions')) {
            this._populateTemplateForClassConditionTasks(templateGr, validTaskIds, skippedTaskIds);
        }

        // Populate template for tasks based on conditions which apply to CIs. For example, add all tasks where the the CIs have ram=1024
        if (templateGr.getValue('conditions')) {
            this._populateTemplateForCIConditionTasks(templateGr, validTaskIds, skippedTaskIds);
        }

        // Populate template for tasks based on scrip which returns a list of de-duplication task sys_ids.
        if (templateGr.getDisplayValue('advanced') === 'true' && templateGr.getValue('script')) {
            this._populateTemplateForScriptTasks(templateGr, validTaskIds, skippedTaskIds);
        }

        var resultTaskIds = {
            'validTaskIds': validTaskIds,
            'skippedTaskIds': skippedTaskIds
        };

        return resultTaskIds;
    },

    /**
     * Populate template for tasks that match class condition e.g. class=cmdb_ci_win_server^EQ or classINSTANCE_OFcmdb_ci_computer
     */
    _populateTemplateForClassConditionTasks: function (templateGr, validTaskIds, skippedTaskIds) {
        // Tasks whose template column is not populated yet
        var noTemplateTaskIds = {};

        var start = 0;
        var end = this.MAX_SUPPORTED_GLIDE_AGGREGATES - 1;
        // Platform has a limitation on number of aggregates returned using query, workaround is to call multiple times with varying offset
        // If glide aggregate returns less data rows than asked (end -start), it indicates there is no more data to query
        // If it returned exact rows as asked, we need to query again as there is potential of more data available
        //TODO: See if we can use DBSqlParser here
        do {
            var singleBatchRowCount = 0;
            // Get all de-duplication tasks by evaluating the specified condition on the reconcile_duplicate_task_data table
            var duplicateTaskDataGr = this._getTaskDataRecords(templateGr.getValue('task_conditions'), start, end);

            /**
             * If the template column is equal to the templateId, the task was manually added to the current template
             * If the template column is not equal to the templateId and it not null, the task is already a part of different template
             * If the template column is null, the task is not assigned to any template
             */
            while (duplicateTaskDataGr.next()) {
                var currentTemplateId = duplicateTaskDataGr.getValue('task.template');
                var currentTaskId = duplicateTaskDataGr.getValue('task');
                if (currentTemplateId == templateGr.getValue('sys_id')) {
                    validTaskIds[currentTaskId] = {};
                } else if (currentTemplateId) {
                    skippedTaskIds[currentTaskId] = {};
                    skippedTaskIds[currentTaskId].messageType = this.DIFFERENT_TEMPLATE;
                    skippedTaskIds[currentTaskId].message = 'Task is already added to a different template ' + currentTemplateId;
                } else {
                    noTemplateTaskIds[currentTaskId] = {};
                }
                singleBatchRowCount++;
            }
            start = end + 1;
            end = end + this.MAX_SUPPORTED_GLIDE_AGGREGATES;
        } while (singleBatchRowCount == this.MAX_SUPPORTED_GLIDE_AGGREGATES);

        var resultTaskIds = this._addTasksToTemplate(validTaskIds, skippedTaskIds, noTemplateTaskIds, templateGr.getValue('sys_id'));

        return resultTaskIds;
    },

    /**
     * Populate template for tasks based on conditions which apply to CIs. For example, add all tasks where the the CIs have ram=1024
     */
    _populateTemplateForCIConditionTasks: function (templateGr, validTaskIds, skippedTaskIds) {
        // Tasks whose template column is not populated yet
        var noTemplateTaskIds = {};

        /**
         * Use the below approach to query the CI conditions:
         * 1. Query the table on which template is defined to get the CI sys_ids.
         * 2. Query the duplicate_audit_result with the CI sys_ids in batches to get the task sys_ids
         */
        var ciSysIds = [];
        var lastSysId = '';

        while (true) {
            var gr = new GlideRecord(templateGr.getValue('table'));
            gr.addEncodedQuery(templateGr.getValue('conditions'));

            if (lastSysId) {
                gr.addQuery('sys_id', '>', lastSysId);
            }
            gr.orderBy('sys_id');
            gr.setLimit(this.BATCH_SIZE);

            gr.query();

            if (!gr.hasNext()) {
                break;
            }

            while (gr.next()) {
                ciSysIds.push(gr.getValue('sys_id'));
            }

            this._addTasksFromDuplicateAuditResultToTemplate(validTaskIds, skippedTaskIds, noTemplateTaskIds, ciSysIds, templateGr.getValue('sys_id'));

            // Update the lastSysId with the last element from the ciSysIds array
            lastSysId = ciSysIds[ciSysIds.length - 1];

            // Reset the ciSysIds array for the next batch
            ciSysIds = [];
        }
    },

    /**
     * Common function to add tasks from duplicate_audit_result to template
     */
    _addTasksFromDuplicateAuditResultToTemplate: function(validTaskIds, skippedTaskIds, noTemplateTaskIds, ciSysIds, templateId) {
        var duplicateAuditResultGr = new GlideAggregate(this.DUPLICATE_AUDIT_RESULT);
        duplicateAuditResultGr.addQuery('duplicate_id', 'IN', ciSysIds);
        duplicateAuditResultGr.addQuery('follow_on_task.state', this.OPEN_STATE);
        duplicateAuditResultGr.groupBy('follow_on_task');
        duplicateAuditResultGr.groupBy('follow_on_task.template');
        duplicateAuditResultGr.query();
        while (duplicateAuditResultGr.next()) {
            var currentTemplateId = duplicateAuditResultGr.getValue('follow_on_task.template');
            var currentTaskId = duplicateAuditResultGr.getValue('follow_on_task');
            if (currentTemplateId == templateId) {
                validTaskIds[currentTaskId] = {};
            } else if (currentTemplateId) {
                skippedTaskIds[currentTaskId] = {};
                skippedTaskIds[currentTaskId].messageType = this.DIFFERENT_TEMPLATE;
                skippedTaskIds[currentTaskId].message = 'Task is already added to a different template ' + currentTemplateId;
            } else {
                noTemplateTaskIds[currentTaskId] = {};
            }
        }

        var resultTaskIds = this._addTasksToTemplate(validTaskIds, skippedTaskIds, noTemplateTaskIds, templateId);

        return resultTaskIds;
    },

    /**
     * Populate template for tasks based on the result of custom script
     */
    _populateTemplateForScriptTasks: function (templateGr, validTaskIds, skippedTaskIds) {
        var noTemplateTaskIds = {};
        var resultTaskIds = {};

        // Evaluate the script and get the list of task_ids
        var evaluator = new GlideScopedEvaluator();
        var taskIds = evaluator.evaluateScript(templateGr, 'script');

        // Do not proceed if the result of the script is not an array
        if (!Array.isArray(taskIds)) {
            resultTaskIds = {
                'validTaskIds': validTaskIds,
                'skippedTaskIds': skippedTaskIds
            };

            return resultTaskIds;
        }

        // Query the task_ids and filter the valid and skipped tasks_ids. We need this becuase the script can return any task_id. We need to validate it before adding to template.
        for (var i = 0; i < taskIds.length; i += this.BATCH_SIZE) {
            var chunk = taskIds.slice(i, i + this.BATCH_SIZE);
            var duplicateTaskGr = new GlideAggregate(this.RECONCILE_DUPLICATE_TASK);
            duplicateTaskGr.addQuery('sys_id', 'IN', chunk);
            duplicateTaskGr.addQuery('state', this.OPEN_STATE);
            duplicateTaskGr.query();
            while (duplicateTaskGr.next()) {
                var currentTemplateId = duplicateTaskGr.getValue('template');
                var currentTaskId = duplicateTaskGr.getValue('sys_id');
                if (currentTemplateId == templateGr.getValue('sys_id')) {
                    validTaskIds[currentTaskId] = {};
                } else if (currentTemplateId) {
                    skippedTaskIds[currentTaskId] = {};
                    skippedTaskIds[currentTaskId].messageType = this.DIFFERENT_TEMPLATE;
                    skippedTaskIds[currentTaskId].message = 'Task is already added to a different template ' + currentTemplateId;
                } else {
                    noTemplateTaskIds[currentTaskId] = {};
                }
            }
        }
        resultTaskIds = this._addTasksToTemplate(validTaskIds, skippedTaskIds, noTemplateTaskIds, templateGr.getValue('sys_id'));

        return resultTaskIds;
    },

    /**
     * Get the manually added task ids for the template
     */
    _getManualTaskIdsForTemplate: function (templateId) {
        var manuallyAddedTaskIds = {};
        var duplicateTaskGr = new GlideRecord(this.RECONCILE_DUPLICATE_TASK);
        duplicateTaskGr.addQuery('template', templateId);
        duplicateTaskGr.addQuery('state', this.OPEN_STATE);
        duplicateTaskGr.query();
        while (duplicateTaskGr.next()) {
            var taskId = duplicateTaskGr.getValue('sys_id');
            manuallyAddedTaskIds[taskId] = {};
        }
        var resultTaskIds = {
            'validTaskIds': manuallyAddedTaskIds,
            'skippedTaskIds': {}
        };

        return resultTaskIds;
    },

    /**
     * Get all the open tasks by evaluating the condition on the reconcile_duplicate_task_data table
     */
    _getTaskDataRecords: function (condition, start, end) {
        var duplicateTaskDataGr = new GlideAggregate(this.RECONCILE_DUPLICATE_TASK_DATA);
        duplicateTaskDataGr.addEncodedQuery(condition);
        duplicateTaskDataGr.groupBy('task');
        duplicateTaskDataGr.groupBy('task.template');
        duplicateTaskDataGr.addQuery('task.state', this.OPEN_STATE);
        duplicateTaskDataGr.chooseWindow(start, end);
        duplicateTaskDataGr.query();
        return duplicateTaskDataGr;
    },

    /**
     * Update the "template" column for the list of task ids
     */
    _updateTemplateForTaskIds: function (taskIds, templateId) {
        var successTaskIds = {};
        var skippedTaskIds = {};
        for (var i = 0; i < taskIds.length; i += this.BATCH_SIZE) {
            var chunk = taskIds.slice(i, i + this.BATCH_SIZE);
            var duplicateTaskGr = new GlideRecord(this.RECONCILE_DUPLICATE_TASK);
            duplicateTaskGr.addQuery('sys_id', 'IN', chunk);
            duplicateTaskGr.addNullQuery('template');
            duplicateTaskGr.setValue('template', templateId);
            // updateMultiple() will still run individual update() operations because of BRs on the task table
            // TODO: See if we can disable the BRs by analyzing what the OOB BRs are doing
            duplicateTaskGr.updateMultiple();

            // We need to check again if the update was successful because some of the tasks can be added to the templates (manually/through other template run)
            duplicateTaskGr = new GlideRecord(this.RECONCILE_DUPLICATE_TASK);
            duplicateTaskGr.addQuery('sys_id', 'IN', chunk);
            duplicateTaskGr.addQuery('template', templateId);
            duplicateTaskGr.query();
            while (duplicateTaskGr.next()) {
                var sysId = duplicateTaskGr.getValue('sys_id');
                successTaskIds[sysId] = true;
            }

            // The tasks that were not updated with the template should be considered as skipped
            for (var j in chunk) {
                var taskId = chunk[j];
                if (!successTaskIds[taskId]) {
                    skippedTaskIds[taskId] = true;
                }
            }
        }
        return {
            'success': successTaskIds,
            'skipped': skippedTaskIds
        };
    },

    /**
     * Check if the tableName extends from the parentTableName.
     * For example, tableName is windows server and parentTableName is hardware, it will return true.
     * @param tableName
     * @param parentTableName
     * @returns
     */
    _extendsFromTable: function (tableName, parentTableName) {
        var table = new GlideTableHierarchy(tableName);
        var parentTables = table.getTables();
        return parentTables.indexOf(parentTableName) >= 0;
    },

    _addTasksToTemplate: function (validTaskIds, skippedTaskIds, noTemplateTaskIds, templateId) {
        // noTemplateTaskIds contains the tasks which matched the conidtion but do not have the template populated yet
        // Check if these tasks can be added to the template
        var canAddTasksToTemplateResult = sn_cmdb.DuplicateTemplate.canAddTasksToTemplate(Object.keys(noTemplateTaskIds), templateId);
        noTemplateTaskIds = canAddTasksToTemplateResult.success.reduce(function (a, c) {
            a[c] = true;
            return a;
        }, {});

        // Add the tasks that cannot be added to template to the skippedTaskIds
        for (var i in canAddTasksToTemplateResult.skipped) {
            var skippedTaskId = canAddTasksToTemplateResult.skipped[i];
            if (!skippedTaskIds[skippedTaskId]) {
                skippedTaskIds[skippedTaskId] = {};
                skippedTaskIds[skippedTaskId].messageType = this.TEMPLATE_TASK_NOT_COMPATIBLE;
                skippedTaskIds[skippedTaskId].message = 'Class hierarchy for task and template do not match';
            }
        }
        for (var j in canAddTasksToTemplateResult.failed) {
            var failedTaskId = canAddTasksToTemplateResult.failed[j];
            if (!skippedTaskIds[failedTaskId]) {
                skippedTaskIds[failedTaskId] = {};
                skippedTaskIds[failedTaskId].messageType = this.TEMPLATE_TASK_NOT_COMPATIBLE;
                skippedTaskIds[failedTaskId].message = 'Cannot add task to template because of sn_cmdb.DuplicateTemplate.canAddTasksToTemplate API errors';
            }
        }

        // Populate template column for the list of tasks with no template
        var populateTemplateResult = this._updateTemplateForTaskIds(Object.keys(noTemplateTaskIds), templateId);

        // Some tasks within noTemplateTaskIds might not get updated with template. Include them in the skippedTaskIds
        for (var skipped in populateTemplateResult.skipped) {
            if (!skippedTaskIds[skipped]) {
                skippedTaskIds[skipped] = {};
                skippedTaskIds[skipped].messageType = this.UPDATE_FAILED;
                skippedTaskIds[skipped].message = 'Cannot update template column for task due to update errors';
            }
        }

        // Add the tasks for which template column was populated in the set of validTaskIds
        for (var success in populateTemplateResult.success) {
            validTaskIds[success] = {};
        }

        var resultTaskIds = {
            'validTaskIds': validTaskIds,
            'skippedTaskIds': skippedTaskIds
        };

        return resultTaskIds;
    },

    type: 'ScopedTemplateTaskRunPopulator'
};
