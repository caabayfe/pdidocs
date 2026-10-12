var AssetParallelTask = Class.create();
AssetParallelTask.prototype = {
	initialize: function(baseJob, taskType, entity, entityReference, taskParameter, priority, upstream, downstream,
		taskQueue, sysId) {
		this.job = baseJob.JOB_ID; // sys_id of main scheduled job process
		this.runId = baseJob.RUN_ID; // Unique ID for job run
		this.taskType = taskType; // Name of task
		this.entity = entity; // A refernece (i.e. pubisher, product, etc)
		this.entityReference = entityReference; // Table that 'entity' references
		this.taskParameter = taskParameter || {}; // Additional parameters needed for task
		this.priority = priority; // Prioritizes task execution largest -> smallest
		this.upstream = upstream || []; // Tasks to be completed before currect can be picked up
		this.downstream = downstream || []; // Tasks that cannot be picked up until the current is complete
		this.taskQueue = taskQueue || AssetManagementScheduledJobConstants.AST_EXECUTION_QUEUE;
		this.sysId = sysId; // Sys_id to use when inserting task (should not exist in task queue already).
	},

	/**
	* @function AssetParallelTask#insert
	* @desc Inserts task into parallel task queue.
	* @return {String} sys_id of newly inserted task
	*/
	insert: function() {
		var gr = new GlideRecord(this.taskQueue);
		gr.initialize();
		gr.setValue(AssetManagementScheduledJobConstants.JOB_COL, this.job);
		gr.setValue(AssetManagementScheduledJobConstants.RUN_ID_COL, this.runId);
		gr.setValue(AssetManagementScheduledJobConstants.TASK_TYPE_COL, this.taskType);
		gr.setValue('entity', this.entity);
		gr.setValue('entity_reference', this.entityReference);
		gr.setValue(AssetManagementScheduledJobConstants.TASK_PARAMETER_COL, JSON.stringify(this.taskParameter));
		gr.setValue(AssetManagementScheduledJobConstants.PRIORITY_COL, this.priority);
		gr.setValue(AssetManagementScheduledJobConstants.UPSTREAM_COL, this.upstream);
		gr.setValue(AssetManagementScheduledJobConstants.DOWNSTREAM_COL, this.downstream);
		if (this.sysId) { gr.setNewGuidValue(this.sysId); } // Inserts new record with this sysId
		return gr.insert();
	},

	type: 'AssetParallelTask',
};
