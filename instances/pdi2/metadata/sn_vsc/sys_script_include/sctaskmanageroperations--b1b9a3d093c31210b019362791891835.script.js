var SCTaskManagerOperations = Class.create();
SCTaskManagerOperations.prototype = {
    constants: new sn_vsc.SecurityCenterConstants(),
    initialize: function() {
		this.priorityMap = {
            "1": "Critical",
            "2": "High",
            "3": "Moderate",
            "4": "Low"
        };
	},
    getDueStatus: function(gr) {
        var taskDue = gr.due_date;
        var currentdate = new GlideDateTime();
        var res = '';
        if (taskDue == '') {
            res = '';
        } else if (currentdate > taskDue) {
            res = 'overdue';
        } else {
            res = 'upcoming';
        }
        return res; // return the calculated value
    },

    _getTaskPriority: function(taskPriority) {
        return this.priorityMap[taskPriority] || "Low"; //Default to Low if taskPriority is not known
    },

    _calculateTaskPriority: function(taskType) {
        var priority = this.constants.securityTaskPriority.LOW;
        if (taskType == this.constants.securityTaskType.NEW_CUSTOMER_ACTION ||
            taskType == this.constants.securityTaskType.NEW_BANNER_ANNOUNCEMENT)
            priority = this.constants.securityTaskPriority.CRITICAL;
        else if (taskType == this.constants.securityTaskType.HARDENING_SCORE_DEVIATION)
            priority = this.constants.securityTaskPriority.HIGH;
        else if (taskType == this.constants.securityTaskType.EVENT_NOTIFICATION ||
            taskType == this.constants.securityTaskType.METRICS_THRESHOLD)
            priority = this.constants.securityTaskPriority.MODERATE;

        return priority;
    },

    _calculateDueDate: function(taskType, sourceRecord) {
        var due_date = sourceRecord != null ? new GlideDateTime(sourceRecord.sys_created_on) : new GlideDateTime();

        if (taskType == this.constants.securityTaskType.NEW_CUSTOMER_ACTION) {
            if (sourceRecord.up_due_date)
                due_date = new GlideDateTime(sourceRecord.up_due_date);
            else
                due_date.addMonthsUTC(6);
        } else if (taskType == this.constants.securityTaskType.NEW_BANNER_ANNOUNCEMENT) {
            //use same day as banner created 

        } else {
            due_date.addDaysUTC(7);
        }

        return due_date.getDate().getByFormat("yyyy-MM-dd");
    },

    _getTaskMessageValue: function(field, taskType, taskParams) {
        var msgParams = taskParams[field + "_params"];
        var msgKey = taskParams[field] ? taskParams[field] : taskType + ".automated_task." + field;
        return gs.getMessage(msgKey, msgParams);
    },

    /**
     * A function to create security task asynchronously  
     * @param {string} taskType the security task to create
     * @param {GlideRecord} source record reference
     * @taskParams {any} JSON object with task parameters relevant to the taskType
     *		supported parameters are:
     * 			short_decription_parameters
     * 			details_parameters
     * 			priority
     * 			due_date
     * 
     * @example
     * var taskParams = {
     *	'short_decription_parameters': ['customer action name'],
     *	'details_parameters':['customer action name', '940f113e58c21210eea16e01df3ecf02']	 
     * }
     * createSecurityTask('new_customer_action', customerActionRecord, taskParams)
     */
    queueSecurityTaskCreate: function(taskType, source, taskParams) {
        gs.eventQueue('sn_vsc.sc_task.CREATE', source, taskType, JSON.stringify(taskParams));
    },

    /**
     * A function to create security task synchronously
     * @see queueSecurityTaskCreate for docs on parameters
     */
    createSecurityTask: function(taskType, source, taskParams) {
        //get source record from sysevent
        var sourceRecord = source;
        var eventId;
        if (source && source.instance) {
            eventId = source.getUniqueValue();
            sourceRecord = new GlideRecord(source.table);
            sourceRecord.get(source.instance);
        }

        //single active task check
        if (this._shouldEnforceSingleActiveTask(taskType, taskParams)) {
            var existingTask = this._getExistingTask(taskType, sourceRecord, taskParams);
            if (existingTask && existingTask.isValid()) {
                existingTask["work_notes"] = "[code]" + this._getTaskMessageValue('details', taskType, taskParams) + "[/code]";
                existingTask.update();
                return existingTask.number;
            }
        }

        //create new task
        var task = new GlideRecord(this.constants.SECURITY_TASK);
        task.initialize();
        task.type = taskType;
        //capture event source
        if (eventId)
            task.event = eventId;
        //capture source record
        if (sourceRecord && sourceRecord.isValid()) {
            task.source_table = sourceRecord.getTableName();
            task.source_record = sourceRecord.getUniqueValue();
        }

        task.short_description = this._getTaskMessageValue('short_description', taskType, taskParams);
        task.details = this._getTaskMessageValue('details', taskType, taskParams);
        task.priority = taskParams.priority ? taskParams.priority : this._calculateTaskPriority(taskType, sourceRecord);
        task.due_date = taskParams.due_date ? taskParams.due_date : this._calculateDueDate(taskType, sourceRecord);

        task.insert();
        return task.number;
    },

    _shouldEnforceSingleActiveTask: function(taskType, taskParams) {
        return taskParams.single_active_task ||
            taskType == this.constants.securityTaskType.HARDENING_SCORE_DEVIATION ||
            taskType == this.constants.securityTaskType.EVENT_NOTIFICATION ||
            taskType == this.constants.securityTaskType.METRICS_THRESHOLD ||
            taskType == this.constants.securityTaskType.NEW_CUSTOMER_ACTION;
    },

    _getExistingTask: function(taskType, source, taskParams) {
        var task = new GlideRecord(this.constants.SECURITY_TASK);
        task.addEncodedQuery("active=true^type=" + taskType, true);
        //add task specific active task conditions
        if (taskParams.single_active_task_query)
            task.addEncodedQuery(taskParams.single_active_task_query, true);
        else if (taskType == this.constants.securityTaskType.EVENT_NOTIFICATION &&
            source && source.getTableName() == "sn_vsc_security_policy_execution_history")
            //join with sn_vsc_security_policy_execution_history table with condition on policy
            task.addEncodedQuery("JOINsn_vsc_security_task.source_record=sn_vsc_security_policy_execution_history.sys_id!policy=" + source.getValue("policy"), true);
        else if (taskType == this.constants.securityTaskType.METRICS_THRESHOLD &&
            source && source.getTableName() == "sn_vsc_metric_threshold_event")
            //join with sn_vsc_metric_threshold_event table with condition on metric
            task.addEncodedQuery("JOINsn_vsc_security_task.source_record=sn_vsc_metric_threshold_event.sys_id!metric=" + source.getValue("metric"), true);
        else if (taskType == this.constants.securityTaskType.NEW_CUSTOMER_ACTION)
            //ensure one active task per customer action record
            task.addEncodedQuery("source_record=" + source.sys_id, true);

        task.query();
        return task.next() ? task : null;
    },

    type: 'SCTaskManagerOperations'
};
