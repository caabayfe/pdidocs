var DeploymentPipelineConstants = {
    APPLICATION_DEPLOYMENT: "application_deployment",
    APPLICATION_DEPLOYMENT_TYPE_SYS_ID: "268f9c0fb73430100290b9708e11a9de",
    RELEASEOPS_PLUGIN_ID: "sn_releaseops",
    RELEASEOPS_DEPLOYMENT_INSTANCE: "sn_releaseops_deployment_instance",
    tables: {
        DEPLOYMENT_REQUEST: 'sn_deploy_pipeline_deployment_request',
    },
    releaseOpsDeploymentRequest: {
        tables: {
            RELEASEOPS_DEPLOYMENT_REQUEST: 'sn_releaseops_deployment_request',
        },
        state: {
            CANCELLED: "60",
        }
    },
    deploymentRequest: {
        payloadFields: {
            required: {
                APP_SYS_ID: "app_sys_id",
                APP_VERSION: "app_version",
                //If either requestor_user_name or requestor_sys_id is present then the other is not required
                REQUESTOR_USER_NAME: "requestor_user_name",
                REQUESTOR_SYS_ID: "requestor_sys_id",
                REQUESTOR_EMAIL: "requestor_email"
            },

            optional: {
                APP_NAME: "app_name",
                APP_DEVELOPMENT_URL: "app_development_url",
                REQUESTOR_FIRST_NAME: "requestor_first_name",
                REQUESTOR_LAST_NAME: "requestor_last_name",
                RELEASE_NOTES: "release_notes"
            }
        },
        openStates: [0, 1],
        /* NEW: '0', IN_REVIEW: '1', CLOSED_PUBLISHED: '2', CLOSED_REJECTED: '3', CLOSED_FAILED: '4', CANCELED: '5' */
        states: {
            NEW: "0",
            IN_REVIEW: "1",
            CLOSED_PUBLISHED: "2",
            CLOSED_REJECTED: "3",
            CLOSED_FAILED: "4",
            CANCELED: "5"
        },
        columns: ["sys_id", "number", "app_sys_id", "app_version", "requestor_user_name", "requestor_sys_id", "requestor_email", "app_name", "state"]
    },
    pipeline: {
        tables: {
            ENVIRONMENT: "sn_pipeline_environment",
            PIPELINE: "sn_pipeline_pipeline",
            PIPELINE_ENVIRONMENT_ORDER: "sn_pipeline_pipeline_environment_order"
        },
        instanceTypes: {
            DEV: "dev",
            TEST: "test",
            STAGE: "staging",
            PROD: "prod",
            SANDBOX: "sandbox"
        }
    },
    deploymentPermissionSetID: {
        SUBMIT_FOR_DEPLOYMENT: "3e59c155ff1320102b341888253bf154",
        PUBLISH_TO_APP_REPO: "5f790cb45b320300ebacefe5f0f91a50",
        PUBLISH_TO_APP_STORE: "dbc314565b320300ebacefe5f0f91ad7",
        DELEGATED_ADMIN: "faa7acd09b33211062b1e2f36ef04b7e"
    }
};
