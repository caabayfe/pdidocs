var AppIntakeConstants = {
    table: {
        SC_REQ_ITEM: 'sc_req_item',
        SN_PIPELINE_ENVIRONMENT: 'sn_pipeline_environment',
    },
    sysProperties: {
        PASSWORD_RESET_URI: 'glide.security.password_reset.uri',
    },
    link: {
        PASSWORD_RESET_DEFAULT_LINK: '/$pwd_reset.do?sysparm_url=ss_default',
    },
    fields: {
        USER_WHITELISTED_FIELDS: ['first_name', 'last_name', 'user_name', 'sys_id', 'email', 'user_password'],
    },
    groups: {
        APP_ENGINE_ADMINS: '477a05d153013010b846ddeeff7b1225',
    },
    permissionTypes: {
        FULL: 'full',
        LIMITED: 'limited',
    }
};
