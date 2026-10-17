var AssetManagementScheduledJobConstants = Class.create();
AssetManagementScheduledJobConstants.prototype = {
	initialize: function() {
	},
	type: 'AssetManagementScheduledJobConstants',
};

// Column names
AssetManagementScheduledJobConstants.DOMAIN_COL = 'sys_domain';
AssetManagementScheduledJobConstants.DOWNSTREAM_COL = 'downstream';
AssetManagementScheduledJobConstants.EXECUTION_ORDER_COL = 'execution_order';
AssetManagementScheduledJobConstants.JOB_COL = 'job';
AssetManagementScheduledJobConstants.PRIORITY_COL = 'priority';
AssetManagementScheduledJobConstants.RUN_ID_COL = 'run_id';
AssetManagementScheduledJobConstants.STATUS_COL = 'status';
AssetManagementScheduledJobConstants.SYS_ID_COL = 'sys_id';
AssetManagementScheduledJobConstants.TASK_PARAMETER_COL = 'task_parameter';
AssetManagementScheduledJobConstants.TASK_TYPE_COL = 'task_type';
AssetManagementScheduledJobConstants.UPSTREAM_COL = 'upstream';
AssetManagementScheduledJobConstants.WORKER_COL = 'worker';

// Task types
AssetManagementScheduledJobConstants.TERMINATE_WORKER_TASK = 'terminate worker';

// Status values
AssetManagementScheduledJobConstants.COMPLETED_STATUS = 'completed';
AssetManagementScheduledJobConstants.FAILED_STATUS = 'failed';
AssetManagementScheduledJobConstants.IN_PROGRESS_STATUS = 'in progress';
AssetManagementScheduledJobConstants.PREPARING_STATUS = 'preparing';
AssetManagementScheduledJobConstants.READY_STATUS = 'ready';
AssetManagementScheduledJobConstants.TIMED_OUT_STATUS = 'timed out';

// Table names
AssetManagementScheduledJobConstants.AST_EXECUTION_QUEUE = 'ast_execution_queue';
AssetManagementScheduledJobConstants.SAM_TASK_QUEUE = 'sam_task_queue';

// Other constants
AssetManagementScheduledJobConstants.SLEEP_LENGTH = 1000;
