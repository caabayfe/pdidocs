class UDCConstants {
	static type = 'UDCConstants';
	static SYS_METADATA = 'sys_metadata';
	static EMPTY_LABEL = gs.getMessage('(empty)');

	static errors = {
		ARTIFACT_DOES_NOT_EXISTS: 'Artifact does not exist',
		FILE_DOES_NOT_EXISTS: 'File does not exists',
		ARTIFACT_URL_GENERATION_FAILED: 'Artifact URL generation failed',
		ARTIFACT_PREVIEW_URL_GENERATION_FAILED: 'Artifact Preview URL generation failed',
		BUILDER_DOES_NOT_EXISTS: 'Builder does not exist',
		ARTIFACT_COUNT_EXCEEDED: 'Artifact count exceeded',
		TYPE_DOES_NOT_EXISTS: 'Type does not exist',
		INVALID_SEARCH_CONFIG_ID: 'Search config is invalid',
		APP_DOES_NOT_EXISTS: 'Application does not exist',
		USER_ACCESS_RESTRICTED: 'User access is restricted',
		NO_CROSS_SCOPE_ACCESS_PRIVILEGE: 'No cross-scope access privilege',
	};

	static fallbackIcons = {
		FILE: 'document-blank-outline',
		OTHER_APP: 'window-outline',
		CUSTOM_APP: '',
		GLOBAL_APP: 'globe-outline',
		TOOL: 'wrench-pencil-outline',
		CATEGORY: 'document-blank-outline',
		TABLE: 'table-outline',
	};

	static APP_TABLES = {
		sys_scope: true,
		sys_app: true,
		sys_store_app: true,
	};

	static ERROR_CODES = {
		NOT_FOUND: 404,
		UNAUTHORIZED: 401,
		FORBIDDEN: 403,
		BAD_REQUEST: 400,
		SERVER_ERROR: 500,
	};

	static sortOrder = {
		ASC: 'asc',
		DESC: 'desc',
	};
}
