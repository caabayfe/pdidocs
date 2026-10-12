var CreatorStudioConstants = {

    /**
     * @deprecated
     * This seems to be using the wrong name or checking the wrong thing, if need to check 
     * for global scope, use 'GLOBAL_APPLICATION_SCOPE_NAME'
     */
    GLOBAL_APPLICATION_SYS_ID: "global",

    GLOBAL_APPLICATION_SCOPE_NAME: "global",

    AES_APPLICATION_SYS_ID: "4cb87f6f53703010b846ddeeff7b1289",

    MAGIC_SYS_ID: "$sys_id_ui11",

    projectTable: {
        NAME: "sn_app_eng_studio_project"
    },

    applicationProjectLinkTable: {
        NAME: "sn_app_eng_studio_project_application_m2m"
    },

    appDetailsTable: {
        NAME: "sn_app_eng_studio_app_details"
    },

    clientParams: {
        REFERRING_URL: "{client:ReferringUrl}",
        SCOPE_ID: "{client:ScopeId}",
        SCOPE_NAME: "{client:ScopeName}",
        STACKNAME: "{client:StackName}",
        TABLE: "{client:Table}",
        VIEW_NAME: "{client:ViewName}"
    },

    sysparms: {
        NAMEOFSTACK: "sysparm_nameofstack",
        REDIRECT_URL: "sysparm_redirect_url",
        REFERRING_URL: "sysparm_referring_url",
        TRANSACTION_SCOPE: "sysparm_transaction_scope",
        VIEW: "sysparm_view"
    },

    sorting: {
        APPS_SORT_APPROVED_FIELDS: ["name", "last_opened_in_aes"],
        APPS_SORT_DEFAULT_FIELD: "last_opened_in_aes",
        ASC_ORDER: "asc",
        DESC_ORDER: "desc"
    },

    errors: {
        PROJECT_ACCESS_DENIED: "Access to project denied",
        PROJECT_DOES_NOT_EXIST: "Project does not exist",
        APPLICATION_ACCESS_DENIED: "Access to application denied",
        APPLICATION_DOES_NOT_EXIST: "Application cannot be found",
        APPLICATION_DETAILS_RECORD_NOT_FOUND: "Application Details record cannot be found",
        TAXONOMY_DOES_NOT_EXIST: "Taxonomy cannot be found",
        APPLICATION_FILE_DOES_NOT_EXIST: "Application file cannot be found",
        PROJECT_LINK_EXISTS: "Project link already exists",
        PROJECT_LINK_DOES_NOT_EXIST: "Project link does not exist",
        OPERATIONS_IMPROPER_FORMAT: "Operations must be an array",
        INSERT_FAILURE: "Failed to insert record",
        UPDATE_FAILURE: "Failed to update record",
        INVALID_TAXONOMY_OR_FILE_OBJECT: "Invalid taxonomy or file object record",
    },

    deploymentStates: {
        PENDING_APPROVAL: '1',
        IN_VALIDATION: '2',
        PUBLISHED: '3',
        REJECTED: '4'
    },

	groups: {
		AES_USER_GROUP_ID: '72910dd8779050108a370870a81061a9',
		AES_USER_LIMITED_GROUP_ID: '553032e853165110b846ddeeff7b12aa',
	},

	roles: {
		AES_USER_ROLE_ID: '97f4a0c20f123300e54f3c71df767ea2'
	},

	permissionType: {
		FULL: 'full',
	},

};
