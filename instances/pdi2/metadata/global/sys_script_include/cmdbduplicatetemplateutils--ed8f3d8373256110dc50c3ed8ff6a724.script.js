var CMDBDuplicateTemplateUtils = Class.create();
CMDBDuplicateTemplateUtils.prototype = {
    RECONCILE_DUPLICATE_TASK: 'reconcile_duplicate_task',
    RECONCILE_DUPLICATE_TEMPLATE_RUN: 'reconcile_duplicate_template_run',
    RECONCILE_DUPLICATE_TEMPLATE: 'reconcile_duplicate_template',
    TEMPLATE_NOT_EXIST: 'template_not_exist',
    UNPUBLISHED_TEMPLATE: 'unpublished_template',
    ONGOING_TEMPLATE_RUN: 'ongoing_template_run',
    TEMPLATE_TASK_NOT_COMPATIBLE: 'template_task_not_compatible',
    TEMPLATE_ALREADY_EXISTS: 'template_already_exists',
    UPDATE_FAILED: 'update_failed',
    INVALID_STATE: 'invalid_state',
    BATCH_SIZE: 100,
    OPEN_STATE: 1,
    WORK_IN_PROGRESS: 2,

    initialize: function() {
        this.IS_DOMAIN_SUPPORT_ACTIVE = GlidePluginManager.isActive('com.glide.domain.msp_extensions.installer');
    },

    /*
    	This function adds the provided tasks to the template in batches of 100. It will overwrite any
    	existing template values, but log the previous value for each template.

    	@param templateId sys_id of the template
    	@param taskIds array of the task id sys_ids to be added to the template
    */
    addTasksToTemplate: function(templateId, taskIds) {
        var result = {
            success: [],
            failed: [],
            skipped: [],
            summary: ''
        };

        // Do not add the tasks to the template if they are empty/invalid
        if (!Array.isArray(taskIds)) {
            result.summary = 'CMDBDuplicateTemplateUtils: Failed to add de-duplication task(s) to template. Invalid/Empty task ids.';
            return result;
        }

        var templateGr = this._getTemplate(templateId);
        if (!templateGr) {
            var templateDoesNotExistMessage = 'Failed to add de-duplication task(s) because template ' + templateId + ' does not exist';
            gs.error('CMDBDuplicateTemplateUtils: ' + templateDoesNotExistMessage);
            result.failed = this._populateResult(taskIds, templateDoesNotExistMessage, this.INVALID_TEMPLATE);
            result.summary = templateDoesNotExistMessage;
            return result;
        }

        var templateName = templateGr.getValue('name');

        if (!this._isPublishedTemplate(templateId)) {
            var unPublishedTemplateMessage = 'Cannot add de-duplication task(s) to template ' + templateName + ' because the template is not published. Publish the template before adding tasks';
            result.skipped = this._populateResult(taskIds, unPublishedTemplateMessage, this.UNPUBLISHED_TEMPLATE);
            result.summary = unPublishedTemplateMessage;
            return result;
        }

        if (this._isOngoingTemplateRun(templateId)) {
            var ongoingTemplateRunMessage = 'Cannot add de-duplication task(s) to template ' + templateName + ' because there is already an ongoing run either in Draft/Ready/Running/Cancel Requested state';
            result.skipped = this._populateResult(taskIds, ongoingTemplateRunMessage, this.ONGOING_TEMPLATE_RUN);
            result.summary = ongoingTemplateRunMessage;
            return result;
        }

        // Check if the all tasks can be added to template
        var canAddTasksToTemplateResult = sn_cmdb.DuplicateTemplate.canAddTasksToTemplate(taskIds, templateId);
        var templateTaskNotCompatibleFailedMessage = 'Failed adding de-duplication task(s) to template ' + templateName + ' due to sn_cmdb.DuplicateTemplate.canAddTasksToTemplate API errors';
        var templateTaskNotCompatibleSkippedMessage = 'Skipped adding de-duplication task(s) to template ' + templateName + ' because the template-task class hierarchy does not match';
        result.failed = this._populateResult(canAddTasksToTemplateResult.failed, templateTaskNotCompatibleFailedMessage, this.TEMPLATE_TASK_NOT_COMPATIBLE);
        result.skipped = this._populateResult(canAddTasksToTemplateResult.skipped, templateTaskNotCompatibleSkippedMessage, this.TEMPLATE_TASK_NOT_COMPATIBLE);

        var domain = templateGr.getValue('sys_domain');

        // Only process the tasks that can be added to the template
        for (var i = 0; i < canAddTasksToTemplateResult.success.length; i += this.BATCH_SIZE) {
            var chunk = canAddTasksToTemplateResult.success.slice(i, i + this.BATCH_SIZE);
            var batchResult = this._processBatchAddTasks(templateId, templateName, chunk, domain);
            result.success = result.success.concat(batchResult.success);
            result.failed = result.failed.concat(batchResult.failed);
            result.skipped = result.skipped.concat(batchResult.skipped);
        }

        gs.info('CMDBDuplicateTemplateUtils: Added ' + result.success.length + ', Skipped ' + result.skipped.length + ', Failed ' + result.failed.length + ' tasks');
        return result;
    },

    /*
        This function removes the template from the provided tasks to the template in batches of 100.

        @param taskIds array of the task id sys_ids to be removed from the template
    */
    removeTemplateFromTasks: function(taskIds) {
        var result = {
            success: 0,
            failed: 0,
            skipped: 0
        };
        // Do not remove the tasks from the template if they are empty/invalid
        if (!Array.isArray(taskIds)) {
            gs.info('CMDBDuplicateTemplateUtils: Failed to remove template from de-duplication task(s). Invalid/Empty task ids.');
            return result;
        }

        for (var i = 0; i < taskIds.length; i += this.BATCH_SIZE) {
            var chunk = taskIds.slice(i, i + this.BATCH_SIZE);
            var batchResult = this._processBatchRemoveTemplateFromTasks(chunk);
            result.success += batchResult.success;
            result.failed += batchResult.failed;
            result.skipped += batchResult.skipped;
        }
        gs.info('CMDBDuplicateTemplateUtils: Removed ' + result.success + ', Skipped ' + result.skipped + ', Failed ' + result.failed + ' template from tasks');
        return result;
    },

    _processBatchAddTasks: function(templateId, templateName, chunk, domain) {
        var currentDomain = GlideSession.get().getCurrentDomainID();
        try {
            if (this.IS_DOMAIN_SUPPORT_ACTIVE) {
                // Change the domain to the template domain
                GlideSession.get().setDomainID(domain);
            }

            var gr = new GlideRecord(this.RECONCILE_DUPLICATE_TASK);
            gr.addQuery('sys_id', 'IN', chunk);
            gr.addQuery('state', this.OPEN_STATE);
            gr.query();
        } finally {
            if (this.IS_DOMAIN_SUPPORT_ACTIVE) {
                // Change the domain back to current domain
                GlideSession.get().setDomainID(currentDomain);
            }
        }

        var resultTaskIds = [];
        var skippedTaskIds = [];
        var failedTaskIds = [];
        // Tasks that will be either skipped, failed
        var openTaskIds = [];

        while (gr.next()) {
            var currentTemplate = gr.getValue('template');
            var taskId = gr.getValue('sys_id');
            var taskNumber = gr.getValue('number');

            /**
             * Follow the below steps if the task already has a template:
             * 1. If the template is same as template we are trying to add, skip the update
             * 2. Else if the template is not in valid state i.e. there is an ongoing run, skip the update
             * 3. Else, log a message about changing templates from previous to current template
             */
            if (currentTemplate) {
                var currentTemplateName = gr.getElement('template.name').getValue();
                if (currentTemplate == templateId) {
                    var alreadyHasTemplateMessage = 'Task ' + taskNumber + ' already has the current template ' + currentTemplateName;
                    gs.info('CMDBDuplicateTemplateUtils: Task ' + alreadyHasTemplateMessage);
                    resultTaskIds.push(this._populateResult0(taskId, alreadyHasTemplateMessage, this.TEMPLATE_ALREADY_EXISTS));
                    openTaskIds.push(taskId);
                    continue;
                } else if (this._isOngoingTemplateRun(currentTemplate)) {
                    var existingTemplateMessage = 'Task ' + taskNumber + ' has an existing template ' + currentTemplateName + ' with ongoing run either in Draft/Ready/Running state. Cannot update template while it is running';
                    gs.info('CMDBDuplicateTemplateUtils: Task ' + existingTemplateMessage);
                    skippedTaskIds.push(this._populateResult0(taskId, existingTemplateMessage, this.ONGOING_TEMPLATE_RUN));
                    openTaskIds.push(taskId);
                    continue;
                } else {
                    gs.info('CMDBDuplicateTemplateUtils: Task ' + taskNumber + ' has an existing template. Updating template from ' + currentTemplateName + ' to ' + templateName);
                }
            }

            gr.setValue('template', templateId);
            if (gr.update()) {
                resultTaskIds.push(this._populateResult0(taskId, '', ''));
            } else {
                var failedMessage = 'Failed to add task ' + taskNumber + ' to template ' + templateName + ' because there were update errors.';
                gs.info('CMDBDuplicateTemplateUtils: Failed to add task ' + failedMessage);
                failedTaskIds.push(this._populateResult0(taskId, failedMessage, this.UPDATE_FAILED));
            }
            openTaskIds.push(taskId);
        }

        // We only selected the open tasks from the chunk. Some of them were success, others were skipped or failed
        // Add the remaining set of tasks which did not get selected because they were not open to the skippedTaskIds
        // Other reason could be because of domain difference between template and the tasks
        var arrayUtil = new ArrayUtil();
        var invalidStateTaskIds = arrayUtil.diff(chunk, openTaskIds);
        var message = 'Skip adding task to template ' + templateName + ' because it is not in Open state or task domain does not match with template.';
        skippedTaskIds = skippedTaskIds.concat(this._populateResult(invalidStateTaskIds, message, this.INVALID_STATE));

        return {
            success: resultTaskIds,
            failed: failedTaskIds,
            skipped: skippedTaskIds
        };
    },

    _processBatchRemoveTemplateFromTasks: function(chunk) {
        var gr = new GlideRecord(this.RECONCILE_DUPLICATE_TASK);
        gr.addQuery('sys_id', 'IN', chunk);
        gr.addQuery('state', '!=', this.WORK_IN_PROGRESS);
        gr.query();

        var resultTaskIds = [];
        var skippedTaskIds = [];
        var failedTaskIds = [];

        while (gr.next()) {
            var currentTemplate = gr.getValue('template');
            var taskId = gr.getValue('sys_id');
            var taskNumber = gr.getValue('number');

            /**
             * 1. If the task does not have a template, skip the update
             * 2. If the task has a template that is not in valid state i.e. there is an ongoing run, skip the update
             */
            if (!currentTemplate) {
                gs.info('CMDBDuplicateTemplateUtils: Task ' + taskNumber + ' does not have a template. Skip removing template');
                skippedTaskIds.push(taskId);
                continue;
            } else if (this._isOngoingTemplateRun(currentTemplate)) {
                var currentTemplateName = gr.getElement('template.name').getValue();
                gs.info('CMDBDuplicateTemplateUtils: Task ' + taskNumber + ' has an existing template ' + currentTemplateName + ' with ongoing run either in Draft/Ready/Running state. Cannot remove template from task while it is running');
                skippedTaskIds.push(taskId);
                continue;
            }

            gr.setValue('template', '');
            if (gr.update()) {
                resultTaskIds.push(taskId);
            } else {
                gs.info('CMDBDuplicateTemplateUtils: Failed to remove template from task ' + taskNumber + ' because there were update errors.');
                failedTaskIds.push(taskId);
            }
        }

        // We only selected the open tasks from the chunk. Some of them were success, others were skipped or failed
        // Add the remaining set of tasks which did not get selected because they were not open to the skippedTaskIds
        var arrayUtil = new ArrayUtil();
        skippedTaskIds = skippedTaskIds.concat(arrayUtil.diff(chunk, resultTaskIds.concat(failedTaskIds).concat(skippedTaskIds)));

        return {
            success: resultTaskIds.length,
            failed: failedTaskIds.length,
            skipped: skippedTaskIds.length
        };
    },

    /**
     * Check if the template is published
     */
    _isPublishedTemplate: function(templateId) {
        var gr = new GlideRecord(this.RECONCILE_DUPLICATE_TEMPLATE);
        if (gr.get(templateId)) {
            return gr.getValue('state') == 'published';
        }
        return false;
    },

    /**
     * Check if the template exists and there is no run scheduled in draft/ready/running
     */
    _isOngoingTemplateRun: function(templateId) {
        var gr = new GlideRecord(this.RECONCILE_DUPLICATE_TEMPLATE_RUN);
        gr.addQuery('template', templateId);
        gr.addQuery('state', 'IN', 'draft,ready,running,cancel_requested');
        gr.setLimit(1);
        gr.query();

        return gr.hasNext();
    },

    /**
     * Get the template
     */
    _getTemplate: function(templateId) {
        var templateGr = new GlideRecord(this.RECONCILE_DUPLICATE_TEMPLATE);
        if (!templateGr.get(templateId)) {
            return null;
        }
        return templateGr;
    },

    _populateResult: function(taskIds, message, messageType) {
        var result = [];
        for (taskId in taskIds) {
            result.push(this._populateResult0(taskId, message, messageType));
        }
        return result;
    },

    _populateResult0: function(taskId, message, messageType) {
        var resultObj = {};
        resultObj.taskId = taskId;
        resultObj.message = message;
        resultObj.messageType = messageType;

        return resultObj;
    },

    type: 'CMDBDuplicateTemplateUtils'
};
