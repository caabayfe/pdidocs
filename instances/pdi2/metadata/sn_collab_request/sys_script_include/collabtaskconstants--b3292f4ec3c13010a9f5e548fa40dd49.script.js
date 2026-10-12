var CollabTaskConstants = {
    INSTANCE_ID: 'instance_id',
    AES_PLUGIN_ID: 'com.snc.app-engine-studio',
    COLLAB_REQUEST_APP_ID: 'f6ad5d41c3222010a9f5e548fa40dd69',
    tables: {
        SYS_APP: 'sys_app',
        SYS_USER: 'sys_user',
        SYS_USER_GROUP: 'sys_user_group',
        COLLABORATION_TASK: 'sn_collab_request_dev_collab_task',
        USER_ROLE: 'sys_user_role',
        USER_HAS_ROLE: 'sys_user_has_role',
        GROUP_HAS_ROLE: 'sys_group_has_role',
        PIPELINE_ENVIRONMENT: 'sn_pipeline_environment',
        COLLAB_DESCRIPTOR: 'sys_appcollab_descriptor'
    },
    roles: {
        AES_ROLE: 'sn_app_eng_studio.user',
        DELEGATED_DEVELOPER_ROLE: 'delegated_developer'
    },
    fields: {
        common: {
            NAME: 'name',
            SYS_ID: 'sys_id',
            ROLE: 'role',
            USER: 'user',
            GROUP: 'group'
        },
        collabTask: {
            APP_NAME: 'app_name',
            APP_SYS_ID: 'app_sys_id',
            APP_URL: 'app_url',
            COLLAB_DESCRIPTOR: 'collaboration_descriptor',
            COLLAB_DESCRIPTOR_SYS_ID: 'collaboration_descriptor_sys_id',
            COLLAB_DESCRIPTOR_URL: 'collaboration_descriptor_url',
            COLLAB_DESCRIPTOR_NAME: 'collaboration_descriptor_name',
            REQUESTOR: 'requestor',
            REQUESTOR_SYS_ID: 'requestor_sys_id',
            REQUESTOR_NAME: 'requestor_name',
            REQUESTOR_EMAIL: 'requestor_email',
            IS_INVITEE_GROUP: 'is_invitee_group',
            INVITEE: 'invitee',
            INVITEE_SYS_ID: 'invitee_sys_id',
            INVITEE_NAME: 'invitee_name',
            INVITEE_EMAIL: 'invitee_email',
            INVITEE_HAS_AES_ROLE: 'invitee_has_aes_role',
            INVITEE_HAS_DD_ROLE: 'invitee_has_delegated_dev_role',
            GROUP_INVITEE: 'group_invitee',
            GROUP_INVITEE_SYS_ID: 'group_invitee_sys_id',
            GROUP_INVITEE_NAME: 'group_invitee_name',
            GROUP_INVITEE_EMAIL: 'group_invitee_email',
            GROUP_INVITEE_HAS_AES_ROLE: 'group_invitee_has_aes_role',
            GROUP_INVITEE_HAS_DDD_ROLE: 'group_invitee_has_delegated_dev_role',
            ORIGINATING_INSTANCE_ID: 'originating_instance_id',
            ORIGINATING_INSTANCE_HAS_AES_INSTALLED: 'originating_instance_has_aes_installed',
            SHORT_DESCRIPTION: 'short_description',
            STATE: 'state',
            AUTO_APPROVE: 'auto_approve',
            SYS_ID: 'sys_id',
            WORK_NOTES: 'work_notes'
        },
    },
    collabTaskStates: {
        NEW: '1',
        APPROVED: '2',
        REJECTED: '3',
        CANCELLED: '4'
    },
    statusCodes: {
        BAD_REQUEST: 400,
        FORBIDDEN: 403,
        SUCCESS: 200,
        CREATED: 201
    },

    errors: {
        MISSING_PAYLOAD: 'Bad Request: Missing payload.',
        NO_USERS_AND_GROUPS: 'Bad Request:There are no users or groups present in the payload.',
        MISSING_DESCRIPTOR: 'Missing descriptor Id.',
        MISSING_INVITEE: 'Missing invitee Id.',
        INVALID_FEATURE: 'Unknown value in the feature query param.'
    },

    paths: {
        AES_APP_HOME: '/now/appenginestudio/my-apps/',
        COLLAB_DESCRIPTOR: '/sys_appcollab_descriptor.do?sys_id=',
        DEV_STUDIO_APP: '/sn_glider_app/servicenow_studio.do?table=sys_scope&sysId=',
        CREATOR_STUDIO_APP: '/now/creatorstudio/request-app/',
        SNS_STUDIO_APP: '/now/servicenow-studio/builder?table=sys_app&sysId='
    },

    collaborationFeature: {
        JOIN: 'JOIN',
        INVITE: 'INVITE'
    },

};
