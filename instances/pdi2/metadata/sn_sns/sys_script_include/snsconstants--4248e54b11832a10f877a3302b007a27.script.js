class SNSConstants {
	static SCOPE_TABLE = 'sys_scope';
	static SYS_APP_TABLE = 'sys_app';
	static SYS_STORE_APP_TABLE = 'sys_store_app';
	static META_DATA_TABLE = 'sys_metadata';
	static SYS_APP_INFO_TABLE = 'sys_app_info';
	static GLOBAL_APPLICATION_SCOPE_NAME = 'global';
	static IDE_CREATED_CRS = 'CS';
	static DELEGATED_DEVELOPER_ROLE = 'delegated_developer';

	static permissionSysIds = {
		DELETE_APP_DELEGATED_DEV_PERM_SYS_ID: '57f39a28c3132010a9f5e548fa40ddeb',
		DELEGATED_ADMIN_DELEGATED_DEV_PERM_SYS_ID: 'faa7acd09b33211062b1e2f36ef04b7e',
		SUBMIT_APP_DELEGATED_DEV_PERM_SYS_ID: '3e59c155ff1320102b341888253bf154',
		PUBLISH_TO_APP_REPO_DELEGATED_DEV_PERM_SYS_ID: '5f790cb45b320300ebacefe5f0f91a50',
		PUBLISH_TO_APP_STORE_DELEGATED_DEV_PERM_SYS_ID: 'dbc314565b320300ebacefe5f0f91ad7',
		SOURCE_CONTROL_DELEGATED_DEV_PERM_SYS_ID: '82249a90531320100f29ddeeff7b12e1',
	};
	static errors = {
		APP_DOES_NOT_EXISTS: 'Application does not exist.',
		APP_ACCESS_ERROR_MESSAGE: "User doesn't have access to application.",
	};
}
