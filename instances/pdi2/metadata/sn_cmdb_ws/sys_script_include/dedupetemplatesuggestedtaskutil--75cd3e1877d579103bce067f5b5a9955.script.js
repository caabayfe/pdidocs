var DedupeTemplateSuggestedTaskUtil = Class.create();
DedupeTemplateSuggestedTaskUtil.prototype = {

    RECONCILE_TEMPLATE_TABLE: "reconcile_duplicate_template",
    RECONCILE_DUPLICATE_TASK: "reconcile_duplicate_task",
    RECONCILE_DUPLICATE_TEMPLATE_SUGGESTED_TASK: "sn_cmdb_ws_reconcile_duplicate_template_suggested_task",
    RECONCILE_DUPLICATE_TASK_DATA: 'reconcile_duplicate_task_data',

    DUPLICATE_AUDIT_RESULT: 'duplicate_audit_result',
    FOLLOW_ON_TASK: "follow_on_task",
    DISCOVERY_SOURCE: "discovery_source",
    CI_COUNT: "ci_count",
    SHORT_DESCRIPTION: "short_description",
    CMDB_CI: "cmdb_ci",
    TABLE: "table",
    DUPLICATE_CI: "duplicate_ci",

    COUNT: "count",
    MAX: "MAX",
    IN: "IN",

    DRAFT: "1",
    READY: "2",
    RETIRED: "3",
    SYS_ID: "sys_id",
    DUPLICATE_COUNT: "duplicate_count",
    STATE: 'state',
    OPEN_STATE: 1,
    BATCH_SIZE: 100,
    GLIDE_AGGREGATES_MAX_LIMIT_PROPERTY: 'glide.db.max.aggregates',
    SYS_UPDATED_ON: 'sys_updated_on',
    SYS_DOMAIN: 'sys_domain',
    TASK: 'task',
    TEMPLATE: 'template',
    PUBLISHED: 'published',

    DOMAIN_SUPPORT_PLUGIN: 'com.glide.domain',
    GLIDE_SYS_DOMAIN_PARTITIONING_PROPERTY: 'glide.sys.domain.partitioning',

    initialize: function() {
        this.MAX_SUPPORTED_GLIDE_AGGREGATES = parseInt(gs.getProperty(this.GLIDE_AGGREGATES_MAX_LIMIT_PROPERTY, 100000));
        this.IS_DOMAIN_SUPPORT_ACTIVE = GlidePluginManager.isActive(this.DOMAIN_SUPPORT_PLUGIN) && gs.getProperty(this.GLIDE_SYS_DOMAIN_PARTITIONING_PROPERTY, 'false') == 'true';
        if (this.IS_DOMAIN_SUPPORT_ACTIVE) {
            this.CURRENT_DOMAIN = gs.getSession().getCurrentDomainID() != null ? gs.getSession().getCurrentDomainID() : 'global';
        }
    },

    // Populate suggestions for all published templates, and orphans (tasks not matching any template either with conditions or manually associated) into table
    // Current orphan records will be with state as Ready and template=null
    // Suggested tasks will be template = <user selected template> on RECONCILE_DUPLICATE_TEMPLATE_SUGGESTIONS table
    populateSuggestedTasks: function() {
        this._getTasksAndPopulateSuggestionCandidateRows();

        // Get published templates in order of update
        var publishedTemplates = this._getPublishedTemplates();
        
        // Evaluate each template and find the matching dedupe tasks
        for (var index = 0; index < publishedTemplates.length; index++) {
            var currentTemplate = publishedTemplates[index];
            this._evaluateConditionsAndUpdateSuggestedTasks(currentTemplate);
        }
        
        // Update all existing Ready records to Retired
        this._updateSuggestedTaskRecords(this.READY, this.RETIRED);

        // Update all Draft records to Ready
        this._updateSuggestedTaskRecords(this.DRAFT, this.READY);
    },

    _updateSuggestedTaskRecords: function(fromState, toState) {
        var suggestedTaskGr = new GlideRecord(this.RECONCILE_DUPLICATE_TEMPLATE_SUGGESTED_TASK);
        suggestedTaskGr.addQuery(this.STATE, fromState);
        suggestedTaskGr.setValue(this.STATE, toState);
        suggestedTaskGr.updateMultiple();
    },

    _evaluateConditionsAndUpdateSuggestedTasks: function(template) {
        var resultTaskIds = {};

        if (template.task_conditions) {
            this._getSuggestedTasksForTaskConditions(template.sys_id, template.task_conditions, resultTaskIds);
        }

        if (template.conditions) {
            this._getSuggestedTasksForCIConditions(template.table, template.conditions, resultTaskIds);
        }

        if (template.advanced && template.script) {
            this._getSuggestedTasksForScript(template.sys_id, resultTaskIds);
        }

        // process taskIds and update suggested tasks table
        this._updateSuggestedTasksWithTemplate(Object.keys(resultTaskIds), template.sys_id, template.domain);
    },

    /**
     * Get suggested tasks that match class condition e.g. class=cmdb_ci_win_server^EQ or classINSTANCE_OFcmdb_ci_computer
     */
    _getSuggestedTasksForTaskConditions: function(templateId, taskConditions, resultTaskIds) {
        var start = 0;
        var end = this.MAX_SUPPORTED_GLIDE_AGGREGATES - 1;
        var potentialTaskIds = [];
        // Platform has a limitation on number of aggregates returned using query, workaround is to call multiple times with varying offset
        // If glide aggregate returns less data rows than asked (end -start), it indicates there is no more data to query
        // If it returned exact rows as asked, we need to query again as there is potential of more data available
        //TODO: See if we can use DBSqlParser here
        do {
            var singleBatchRowCount = 0;
            // Get all de-duplication tasks by evaluating the specified condition on the reconcile_duplicate_task_data table
            var duplicateTaskDataGr = this._getTaskDataRecords(taskConditions, start, end);

            while (duplicateTaskDataGr.next()) {
                potentialTaskIds.push(duplicateTaskDataGr.getValue('task'));
                singleBatchRowCount++;
                if (potentialTaskIds.length == this.BATCH_SIZE) {
                    // DEF0626955: Check if task is compatible with template.
                    var result = sn_cmdb.DuplicateTemplate.canAddTasksToTemplate(potentialTaskIds, templateId);
                    for (var i = 0; i < result.success.length; i++) {
                        resultTaskIds[result.success[i]] = true;
                    }
                    potentialTaskIds = [];
                }
            }
            
            // Process the last batch
            if (potentialTaskIds.length > 0) {
                var result = sn_cmdb.DuplicateTemplate.canAddTasksToTemplate(potentialTaskIds, templateId);
                for (var i = 0; i < result.success.length; i++) {
                    resultTaskIds[result.success[i]] = true;
                }
            }

            start = end + 1;
            end = end + this.MAX_SUPPORTED_GLIDE_AGGREGATES;
        } while (singleBatchRowCount == this.MAX_SUPPORTED_GLIDE_AGGREGATES);
    },

    /**
     * Get suggested tasks based on conditions which apply to CIs. For example, add all tasks where the the CIs have ram=1024
     */
    _getSuggestedTasksForCIConditions: function(table, conditions, resultTaskIds) {
        /**
         * Use the below approach to query the CI conditions:
         * 1. Query the table on which template is defined to get the CI sys_ids in batches.
         * 2. Query the duplicate_audit_result for the CI sys_ids batch to get the task sys_ids
         */
        var ciSysIds = [];
        var lastSysId = '';

        while (true) {
            var gr = new GlideRecord(table);
            gr.addEncodedQuery(conditions);

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

            this._addTaskIdsFromDuplicateAuditResult(ciSysIds, resultTaskIds);

            // Update the lastSysId with the last element from the ciSysIds array
            lastSysId = ciSysIds[ciSysIds.length - 1];

            // Reset the ciSysIds array for the next batch
            ciSysIds = [];
        }
    },

    _addTaskIdsFromDuplicateAuditResult: function(ciSysIds, resultTaskIds) {
        var duplicateAuditResultGr = new GlideAggregate(this.DUPLICATE_AUDIT_RESULT);
        duplicateAuditResultGr.addQuery('duplicate_id', 'IN', ciSysIds);
        duplicateAuditResultGr.addNullQuery('follow_on_task.template');
        duplicateAuditResultGr.addQuery('follow_on_task.state', this.OPEN_STATE);
        duplicateAuditResultGr.groupBy('follow_on_task');
        duplicateAuditResultGr.groupBy('follow_on_task.template');
        duplicateAuditResultGr.query();
        while (duplicateAuditResultGr.next()) {
            resultTaskIds[duplicateAuditResultGr.getValue('follow_on_task')] = true;
        }
    },

    /**
     * Get suggested tasks based on the result of custom script
     */
    _getSuggestedTasksForScript: function(templateId, resultTaskIds) {
        var templateGr = new GlideRecord(this.RECONCILE_TEMPLATE_TABLE);
        if (!templateGr.get(templateId)) {
            gs.debug('Cannot find template to evaluate script.');
            return;
        }
        // Evaluate the script and get the list of task_ids
        var evaluator = new GlideScopedEvaluator();
        var taskIds = evaluator.evaluateScript(templateGr, 'script');

        // Do not proceed if the result of the script is not an array
        if (!Array.isArray(taskIds)) {
            gs.debug('Skip getting suggested tasks for script as no result is not valid array');
            return;
        }

        // Query the task_ids and filter the valid tasks_ids. We need this becuase the script can return any task_id.
        for (var i = 0; i < taskIds.length; i += this.BATCH_SIZE) {
            var chunk = taskIds.slice(i, i + this.BATCH_SIZE);
            var duplicateTaskGr = new GlideAggregate(this.RECONCILE_DUPLICATE_TASK);
            duplicateTaskGr.addQuery('sys_id', 'IN', chunk);
            duplicateTaskGr.addNullQuery('template');
            duplicateTaskGr.addQuery('state', this.OPEN_STATE);
            duplicateTaskGr.query();
            while (duplicateTaskGr.next()) {
                resultTaskIds[duplicateTaskGr.getValue('sys_id')] = true;
            }
        }
    },

    /**
     * Query the suggested task count with given taskIds and template as empty( indicating how many rows to update), if we get equal
     * number of rows as chunk(expected taskIds), we have all rows available to update template for suggested tasks, otherwise we need
     * to create additional rows and copy CI Count and discovery sources ( from same taskId and state as draft) 
     * in the table ( As existing rows are also matched with another template). Once we have all required rows to update, we update the template
     * 
     */
    _updateSuggestedTasksWithTemplate: function(taskIds, templateId, domain) {
        for (var i = 0; i < taskIds.length; i += this.BATCH_SIZE) {
            var chunk = taskIds.slice(i, i + this.BATCH_SIZE);
            // Check if all the taskids are eligible to update the template (if they had not been suggest-associated to other template)
            var eligibleTaskCount = this._getTasksCountWithEmptyTemplate(chunk);
            // Some of the tasks in chunk are already associated to different template, create more rows for tasks already matched
            if (eligibleTaskCount != chunk.length) {
                // Separate suggested tasks which have already template associated vs non associated in the chunk of taskIds
                var result = this._separateTasksWithNWithoutTemplate(chunk);
                for (var j = 0; j < result.tasksWithTemplate.length; j++) {
                    // Create additional rows to update template for suggested tasks( these tasks already have another template associated)
                    this._addAdditionalRowForTasks(result.tasksWithTemplate[j], domain);
                }
            }
            var suggestedTaskGr = new GlideRecord(this.RECONCILE_DUPLICATE_TEMPLATE_SUGGESTED_TASK);
            suggestedTaskGr.addQuery(this.TASK, this.IN, chunk);
            suggestedTaskGr.addNullQuery(this.TEMPLATE);
            suggestedTaskGr.addQuery(this.STATE, this.DRAFT);
            suggestedTaskGr.setValue(this.TEMPLATE, templateId);
            suggestedTaskGr.updateMultiple();
        }
    },

    _getTasksCountWithEmptyTemplate: function(chunkTaskIds) {
        var taskCountGa = new GlideAggregate(this.RECONCILE_DUPLICATE_TEMPLATE_SUGGESTED_TASK);
        taskCountGa.addAggregate(this.COUNT);
        taskCountGa.addQuery(this.TASK, this.IN, chunkTaskIds);
        taskCountGa.addNullQuery(this.TEMPLATE);
        taskCountGa.addQuery(this.STATE, this.DRAFT);
        taskCountGa.query();
        if (taskCountGa.next()) {
            return taskCountGa.getAggregate(this.COUNT);
        }
        return 0;
    },

    _separateTasksWithNWithoutTemplate: function(chunk) {
        var suggestedTaskGr = new GlideRecord(this.RECONCILE_DUPLICATE_TEMPLATE_SUGGESTED_TASK);
        suggestedTaskGr.addQuery(this.TASK, this.IN, chunk);
        suggestedTaskGr.addNullQuery(this.TEMPLATE);
        // We only need tasks that are in draft to avoid copying suggested tasks from previous runs
        suggestedTaskGr.addQuery(this.STATE, this.DRAFT);
        suggestedTaskGr.query();
        var tasksWithNullTemplate = [];
        while (suggestedTaskGr.next()) {
            tasksWithNullTemplate.push(suggestedTaskGr.getValue(this.TASK));
        }
        var arrayUtil = new global.ArrayUtil();
        var diffResult = arrayUtil.diff(chunk, tasksWithNullTemplate);
        return {
            "tasksWithTemplate": diffResult,
            "tasksWithoutTemplate": tasksWithNullTemplate
        };
    },

    _addAdditionalRowForTasks: function(taskId, domain) {
        // get an existing row with taskId, copy discovery sources and CI count to new row
        var gr = new GlideRecord(this.RECONCILE_DUPLICATE_TEMPLATE_SUGGESTED_TASK);
        gr.addQuery(this.TASK, taskId);
        gr.addQuery(this.STATE, this.DRAFT);
        gr.setLimit(1);
        gr.query();
        if (gr.next()) {
            this._populateSuggestedTaskCandidates(taskId, gr.getValue(this.CI_COUNT), gr.getValue(this.SHORT_DESCRIPTION), gr.getValue(this.DISCOVERY_SOURCE), this.DRAFT, domain);
        } else {
            gs.error("Failed to find taskId with " + taskId + " in suggested task table");
        }
    },

    _getPublishedTemplates: function() {
        var gr = new GlideRecord(this.RECONCILE_TEMPLATE_TABLE);
        // Need to add the domain query here, otherwise it will return records from the child domains (for which this code will be called separately)
        if (this.IS_DOMAIN_SUPPORT_ACTIVE) {
            gr.addQuery('sys_domain', this.CURRENT_DOMAIN);
        }
        gr.addQuery(this.STATE, this.PUBLISHED);
        gr.orderBy(this.SYS_UPDATED_ON);
        gr.query();
        var templates = [];
        while (gr.next()) {
            var template = {};
            template.sys_id = gr.getValue(this.SYS_ID);
            template.table = gr.getValue('table');
            template.task_conditions = gr.getValue('task_conditions');
            template.conditions = gr.getValue('conditions');
            template.advanced = gr.getDisplayValue('advanced') === 'true';
            template.script = gr.getValue('script');

            template.domain = gr.getValue(this.SYS_DOMAIN);
            templates.push(template);
        }
        return templates;
    },

    _getTasksAndPopulateSuggestionCandidateRows: function() {
        var duplicateTaskGr = new GlideRecord(this.RECONCILE_DUPLICATE_TASK);
        duplicateTaskGr.addQuery(this.STATE, this.OPEN_STATE);
        duplicateTaskGr.addNullQuery(this.TEMPLATE);
        duplicateTaskGr.query();
        while (duplicateTaskGr.next()) {
            var taskId = duplicateTaskGr.getValue(this.SYS_ID);
            this._populateSuggestedTaskCandidates(taskId, this._getCICount(taskId), duplicateTaskGr.getValue(this.SHORT_DESCRIPTION), this._getDiscoverySources(taskId), this.DRAFT, duplicateTaskGr.getValue(this.SYS_DOMAIN));
        }
    },

    _getCICount: function(taskSysId) {
        var duplicateAuditGr = new GlideAggregate(this.DUPLICATE_AUDIT_RESULT);
        duplicateAuditGr.addAggregate(this.COUNT);
        duplicateAuditGr.addQuery(this.FOLLOW_ON_TASK, taskSysId);
        duplicateAuditGr.query();
        var count = 0;
        if (duplicateAuditGr.next()) {
            count = duplicateAuditGr.getAggregate(this.COUNT);
        }
        return count;
    },

    _getDiscoverySources: function(taskSysId) {
        var discoverySources = {};
        var gr = new GlideRecord(this.DUPLICATE_AUDIT_RESULT);
        gr.addQuery('follow_on_task', taskSysId);
        gr.query();
        while (gr.next()) {
            var source = gr.getValue('discovery_source_duplicate_ci');
            if (source) {
                discoverySources[source] = true;
            }
        }
        return Object.keys(discoverySources).join();
    },

    _populateSuggestedTaskCandidates: function(taskSysId, taskCiCount, shortDescription, taskDiscoverySources, state, domain) {
        var gr = new GlideRecord(this.RECONCILE_DUPLICATE_TEMPLATE_SUGGESTED_TASK);
        gr.setValue(this.TASK, taskSysId);
        gr.setValue(this.CI_COUNT, taskCiCount);
        gr.setValue(this.SHORT_DESCRIPTION, shortDescription);
        gr.setValue(this.DISCOVERY_SOURCE, taskDiscoverySources);
        gr.setValue(this.STATE, state);
        gr.setValue(this.SYS_DOMAIN, domain);
        gr.insert();
    },

    /**
     * Get all the open tasks by evaluating the condition on the reconcile_duplicate_task_data table
     */
    _getTaskDataRecords: function(condition, start, end) {
        var duplicateTaskDataGr = new GlideAggregate(this.RECONCILE_DUPLICATE_TASK_DATA);
        duplicateTaskDataGr.addEncodedQuery(condition, true);
        duplicateTaskDataGr.groupBy(this.TASK);
        duplicateTaskDataGr.groupBy('task.template');
        duplicateTaskDataGr.addQuery('task.state', this.OPEN_STATE);
        duplicateTaskDataGr.addNullQuery('task.template');
        duplicateTaskDataGr.chooseWindow(start, end);
        duplicateTaskDataGr.query();
        return duplicateTaskDataGr;
    },

    type: 'DedupeTemplateSuggestedTaskUtil'
};
