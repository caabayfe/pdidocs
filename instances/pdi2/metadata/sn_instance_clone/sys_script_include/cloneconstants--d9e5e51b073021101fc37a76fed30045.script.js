var CloneConstants = {
    SYSTEM_PROFILE_SYS_ID: "874b7e423b7333001b420896c3efc4c0",

    backupType: {
        USE_RECENT_BACKUP: "use_recent_backup",
        ON_DEMAND_BACKUP: "on_demand_backup",
        USE_ANOTHER_CLONE_BACKUP: "use_another_clone_backup"
    },

    cloneOptions: {
        DEFAULT_MAX_CLONE_DURATION: "3M",
        CLONE_FREQUENCY_WEEKLY: 1,
        CLONE_FREQUENCY_BIWEEKLY: 2,
        CLONE_FREQUENCY_MONTHLY: 3
    },

    logLevel: {
        LOG_LEVEL_INFO: '0',
        LOG_LEVEL_ERROR: '2'
    },

    reqState: {
        SUCCESS: "success",
        FAILURE: "failure"
    },

    tableName: {
        CLONE_PROFILE_EXCLUSION: "clone_profile_exclusions",
        CLONE_PROFILE_PRESERVER: "clone_profile_preservers",
        CLONE_PROFILE_CLEANUP_SCRIPT: "clone_profile_cleanup_scripts",
        CLONE_DATA_PRESERVER: "clone_data_preserver",
        CLONE_DATA_EXCLUSION: "clone_data_exclude",
        CLONE_CLEANUP_SCRIPT: "clone_cleanup_script",
        CLONE_REQUEST: "sn_instance_clone_request",
        CLONE_LOG: "sn_instance_clone_log",
        INSTANCE_TOGGLE_ALLOWED_TABLES: "instance_toggle_allowed_tables",
        INSTANCE_TOGGLE_NOTALLOWED_TABLES: "instance_toggle_notallowed_tables"
    },
    stepperComponentsSteps: [{
            CONFIGURATIONS: gs.getMessage("Building Configurations")
        },
        {
            PREFLIGHT_CHECKS: gs.getMessage("Preflight Check")
        },
        {
            BACKUP: gs.getMessage("Backup")
        },
        {
            PRE_CLONE: gs.getMessage("Pre Clone")
        },
        {
            PROVISION_DBI: gs.getMessage("Provision DBI")
        },
        {
            RESTORE: gs.getMessage("Restore")
        },
        {
            APPLYING_EXCLUSIONS: gs.getMessage("Applying Exclusions")
        },
        {
            APPLYING_PRESERVERS: gs.getMessage("Applying Preservers")
        },
        {
            NODE_RESTART: gs.getMessage("Node Repoint")
        },
        {
            SCHEDULING_CLEANUP_SCRIPTS: gs.getMessage("Scheduling cleanup scripts")
        },
        {
            POST_CLONE: gs.getMessage("Post Clone")
        }
    ],

	_stepperComponentsSteps: {
        CONFIGURATIONS: gs.getMessage("Building Configurations"),
        PREFLIGHT_CHECKS: gs.getMessage("Preflight Check"),
        BACKUP: gs.getMessage("Backup"),
        PRE_CLONE: gs.getMessage("Pre Clone"),
        PROVISION_DBI: gs.getMessage("Provision DBI"),
        RESTORE: gs.getMessage("Restore"),
        APPLYING_EXCLUSIONS: gs.getMessage("Applying Exclusions"),
        APPLYING_PRESERVERS: gs.getMessage("Applying Preservers"),
        NODE_RESTART: gs.getMessage("Node Repoint"),
        SCHEDULING_CLEANUP_SCRIPTS: gs.getMessage("Scheduling cleanup scripts"),
        POST_CLONE: gs.getMessage("Post Clone")
    },

    status: {
        CLONE_STATUS_DRAFT: "Draft",
        CLONE_STATUS_SCHEDULED: "Scheduled",
        CLONE_STATUS_REQUESTED: "Requested",
        CLONE_STATUS_HOLD: "Hold",
        CLONE_STATUS_CANCELED: "Canceled"
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

    largerPreserverOptions: {
        LARGE_PRESERVER_OPTION_LOAD_TESTING: "Load Testing",
        LARGE_PRESERVER_OPTION_TARGET_INTACT: "Keep the Target Data Intact",
        LARGE_PRESERVER_OPTION_OTHERS: "Others"
    },

    errorMsg: {
        EMPTY_PRESERVERS: gs.getMessage('EMPTY_PRESERVERS'),
        EXCLUSIONS_NOT_ALLOWED: gs.getMessage('EXCLUSIONS_NOT_ALLOWED'),
        CLEANUP_SCRIPT_EXISTS: gs.getMessage('CLEANUP_SCRIPT_EXISTS'),
        PRESERVER_EXISTS: gs.getMessage('PRESERVER_EXISTS'),
        PRESERVER_DB_VIEW: gs.getMessage('PRESERVER_DB_VIEW'),
        PRESERVER_DB_VIEWS: gs.getMessage('PRESERVER_DB_VIEWS'),
        EXCLUSION_EXISTS: gs.getMessage('EXCLUSION_EXISTS'),
        TARGET_INSTANCE_EXISTS: gs.getMessage('TARGET_INSTANCE_EXISTS'),
        TARGET_REQ_PROPERTY: gs.getMessage('TARGET_REQ_PROPERTY'),
        TARGET_MATCHES_SOURCE: gs.getMessage('TARGET_MATCHES_SOURCE'),
        TARGET_EXISTS: gs.getMessage('TARGET_EXISTS'),
        SAME_INSTANCEID: gs.getMessage('SAME_INSTANCEID'),
        INVALID_RESPONSE: gs.getMessage('INVALID_RESPONSE'),
        DESTINATION_ERROR: gs.getMessage('DESTINATION_ERROR'),
        INVALID_USERNAME: gs.getMessage('INVALID_USERNAME'),
        DESTINATION_UNAUTHORISED: gs.getMessage('DESTINATION_UNAUTHORISED'),
        HA_PLUGIN_NOTENABLED: gs.getMessage('HA_PLUGIN_NOTENABLED'),
        NOT_SN_INSTANCE: gs.getMessage('NOT_SN_INSTANCE'),
        DESTINATION_ERROR_STATUS: gs.getMessage('DESTINATION_ERROR_STATUS'),
        NODE_TEXT_CREATION: gs.getMessage('NODE_TEXT_CREATION'),
        WEBSERVICE_NOTEXIST: gs.getMessage('WEBSERVICE_NOTEXIST'),
        INSTANCE_TOGGLE_ALLOWED_EXIST: gs.getMessage('INSTANCE_TOGGLE_ALLOWED_EXIST'),
        INSTANCE_TOGGLE_NOTALLOWED_EXIST: gs.getMessage('INSTANCE_TOGGLE_NOTALLOWED_EXIST')
    },

	oAuthAppConstants: {
		APP_CLIENT_NAME: "CACOAuthClient",
		APP_CLIENT_TYPE: "APP",
		APP_PROVIDER_TYPE: "CONSUMER",
		APP_PROVIDER_NAME: "CACOAuthProvider",
		DEFAULT_GRANT_TYPE: "authorization_code",
		TOKEN_FORMAT: "jwt",
		ACCESS_TOKEN_LIFESPAN: 180,
		REFRESH_TOKEN_LIFESPAN: (10*24*60*60),
		SUB_CLAIM: "user_name",
		OAUTH_REDIRECT_URI: "/oauth_redirect.do",
		OAUTH_AUTH_URI: "/oauth_auth.do",
		OAUTH_TOKEN_URI: "/oauth_token.do",
		CODE_CHALLENGE_METHOD: "S256",
		REQUESTOR_ID: "59a76b3553c14310ec8385f230e5e69d",
		CANCEL_PREF_NAME: 'oauth.authorization.cancelled',
		REQUESTOR_CONTEXT: 'sys_rest_message',
		LOGO_NAME: 'sn_instance_clone.CloneAppAltText.png'
	},
	calendarConstants : {
		AVAILABLE: "available",
		UNAVAILABLE: "unavailable"
	}
};
