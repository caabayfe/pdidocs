var CloneConstants = { 
	SYSTEM_PROFILE_SYS_ID: "874b7e423b7333001b420896c3efc4c0",
	
	cloneOptions: {
		DEFAULT_MAX_CLONE_DURATION: "3M"
	},
	
	tableName: {
		CLONE_PROFILE_EXCLUSION: "clone_profile_exclusions",
		CLONE_PROFILE_PRESERVER: "clone_profile_preservers",
		CLONE_PROFILE_CLEANUP_SCRIPT: "clone_profile_cleanup_scripts",
		CLONE_DATA_PRESERVER: "clone_data_preserver",
		CLONE_DATA_EXCLUSION: "clone_data_exclude",
		CLONE_CLEANUP_SCRIPT: "clone_cleanup_script"
	},
	
	status: {
		CLONE_STATUS_DRAFT: "Draft",
		CLONE_STATUS_SCHEDULED: "Scheduled",
		CLONE_STATUS_REQUESTED: "Requested",
		CLONE_STATUS_HOLD: "Hold"
	},

	cancelOptions: {
		CANCEL_OPTION_INCORRECT_TARGET: "I chose an incorrect target instance",
		CANCEL_OPTION_LATEST_BACKUP: "I need a different backup",
		CANCEL_OPTION_OTHER: "Other"
	},

	rollbackOptions: {
		ROLLBACK_OPTION_CORRUPTED_INSTANCE: "Target instance was corrupted",
		ROLLBACK_OPTION_LOST_DATA: "I Lost My Data",
		ROLLBACK_OPTION_OTHER: "Other"
	},
	
	errorMsg: {
		EMPTY_PRESERVERS: "Preservers cannot be empty.",
		EXCLUSIONS_NOT_ALLOWED: "Following tables cannot be excluded: ",
		CLEANUP_SCRIPT_EXISTS: "Cleanup script already exists with this name.",
		PRESERVER_EXISTS: "Preserver already exists with the this table name and condition.",
		PRESERVER_DB_VIEW: "DB views cannot be preserved.",
		PRESERVER_DB_VIEWS: "Following DB views cannot be preserved: ",
		EXCLUSION_EXISTS: "Exclusion already exists with this same table name."
	}
};
