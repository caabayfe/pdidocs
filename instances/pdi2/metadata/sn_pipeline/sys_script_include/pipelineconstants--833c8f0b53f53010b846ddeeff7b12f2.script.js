var PipelineConstants = {
    table: {
        ENVIRONMENT_TABLE: 'sn_pipeline_environment',
        PIPELINE_TABLE: 'sn_pipeline_pipeline',
        PIPELINE_ENVIRONMENT_ORDER_TABLE: 'sn_pipeline_pipeline_environment_order',
        PIPELINE_INSTANCE_TABLE: 'sn_pipeline_pipeline_instance',
        PIPELINE_TYPE: 'sn_pipeline_pipeline_type',
        REQUEST_AUTHORIZATION_KEY_TABLE: 'sn_pipeline_request_authorization_key'
    },
    formFields: {
        NAME: 'name',
        INSTANCE_TYPE: 'instance_type',
        INSTANCE_ID: 'instance_id',
        INSTANCE_CREDENTIAL: 'instance_credential',
        IS_CONTROLLER: 'is_controller',
        INSTANCE_URL: 'instance_url',
        PERMISSION_SETS_REQUIRED_IN_SOURCE_ENVIRONMENT: 'permission_sets_required_in_source_environment',
        ROLES_REQUIRED_IN_SOURCE_ENVIRONMENT: 'roles_required_in_source_environment'
    },
    columns: {
        ENVIRONMENT_COLUMNS: ['sys_id', 'name', 'instance_type', 'instance_id', 'is_controller', 'instance_url'],
        PIPELINE_TYPE_COLUMNS: ['sys_id', 'name', 'permission_sets_required_in_source_environment', 'roles_required_in_source_environment'],
        PIPELINE_ENVIRONMENT_ORDER_COLUMNS: ['sys_id', 'environment', 'order']
    },
    sysId: {
        APPLICATION_DEPLOYMENT_PIPELINE_TYPE: '268f9c0fb73430100290b9708e11a9de',
    },
    ajaxParameters: {
        environmentValidation: {
            PIPELINE_TYPE_NAME: 'sysparm_pipeline_type_name',
            IS_CONTROLLER: 'sysparm_is_controller',
            URL: 'sysparm_url',
            CREDENTIAL: 'sysparm_credential',
			ENVIRONMENT_SYS_ID: 'sysparm_environment_sys_id'
        }
    },
    flow: {
        environmentValidation: {
            actions: {
                CONTROLLER: 'sn_pipeline.validate_controller',
                CONNECTION: 'sn_pipeline.validate_connection'
            },
            input: {
                URL: 'url',
                CREDENTIAL: 'credential',
                SOURCE_INSTANCE_ID: 'source_instance_id',
                PIPELINE_TYPE_NAME: 'pipeline_type_name'
            },
            output: {
                INSTANCE_ID: 'instanceId',
                RESPONSE_BODY: 'response_body',
                IS_VALID: 'isValid',
                FOUND_IN_ENVIRONMENTS: 'foundInEnvironments',
                SOURCE_INSTANCE: 'sourceInstance'
            }
        },
        runner: {
            actions: {
                RUNNER_ACTION: 'sn_pipeline.pipeline_runner'
            },
            subflows: {
                RUNNER_SUBFLOW: 'sn_pipeline.pipeline_runner'
            },
            input: {
                URL: 'url',
                CREDENTIAL: 'credential',
                PIPELINE_TYPE_NAME: 'pipeline_type_name',
                REQUEST_BODY: 'request_body',
                PIPELINE: 'pipeline',
                PAYLOAD: 'payload',
                PIPELINE_TYPE_SUBFLOW: 'pipeline_type_subflow',
                REQUEST_AUTH_TOKEN: 'request_auth_token',
				PIPELINE_INSTANCE: 'pipeline_instance'
            },
            output: {
                RESPONSE_BODY: 'response_body',
                STATUS_CODE: 'status_code'
            }
        },
        pipelineType: {
            actions: {
                GET_PIPELINE_TYPE_ACTION: 'sn_pipeline.get_pipeline_type'
            },
            subflows: {},
            input: {
                URL: 'url',
                CREDENTIAL: 'credential',
                PIPELINE_TYPE_NAME: 'pipeline_type_name'
            },
            output: {
                RESPONSE_BODY: 'response_body',
                STATUS_CODE: 'status_code'
            }
        },
        authorization: {
            actions: {
                GET_AUTHORIZED_REQUEST: 'sn_pipeline.get_authorized_request'
            },
            subflows: {},
            input: {
                URL: 'url',
                CREDENTIAL: 'credential',
                REQUEST_AUTH_TOKEN: 'request_auth_token'
            },
            output: {
                RESPONSE_BODY: 'response_body',
                STATUS_CODE: 'status_code',
                IS_AUTHORIZED: 'isAuthorized'
            }
        },
        adminEmail: {
            actions: {
                GET_ADMIN_CONTACT: 'sn_pipeline.get_admin_contact'
            },
            subflows: {},
            input: {
                URL: 'url',
                CREDENTIAL: 'credential'
            },
            output: {
                RESPONSE_BODY: 'response_body',
                ADMIN_EMAIL: 'adminEmail'
            }
        }
    },
    instantTypes: {
        DEV: "dev",
        TEST: "test",
        PROD: "prod"
    }
};
