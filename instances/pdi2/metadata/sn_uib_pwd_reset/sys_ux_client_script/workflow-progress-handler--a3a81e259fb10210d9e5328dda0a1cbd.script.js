/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const pwdResetUtil = imports["sn_uib_pwd_reset.PwdResetUxfClientUtil"]();
    const result = event.payload.data.output;
    const intervalId = api.state.resetStatePollingIntervalId;
    if (!result.isValid) {
        helpers.timing.clearInterval(intervalId);
        api.emit("PWD_RESET_UIB#SHOW_ERROR_PAGE_FROM_RESET", {
            "errorPageObj": {
                "actions": {
                    "restart": {
                        "isHidden": false,
                        "variant": "primary"
                    }
                },
                "heading": await pwdResetUtil.getTranslation(helpers, "Oops! Something went wrong."),
                "icon": "error",
                "subHeading": result.errorMessage
            }
        });
        return;
    }
    const workflowStatus = result.workflowStatus;
    const workflowDetails = api.state.workflowDetails;
    if (workflowStatus === pwdResetUtil.uiConstants.WORKFLOW_CONTEXT_FAULTED_STATE  || workflowStatus === pwdResetUtil.uiConstants.WORKFLOW_CONTEXT_CANCELLED_STATE ) {
        helpers.timing.clearInterval(intervalId);
        const errorMessage = "An error occured in PwdWfManager UI Script : checkWFProgress()";
        api.emit("PWD_RESET_UIB#SHOW_ERROR_PAGE_FROM_RESET", {
            "errorPageObj": {
                "actions": {
                    "restart": {
                        "isHidden": false,
                        "variant": "primary"
                    }
                },
                "content": "",
                "heading": await pwdResetUtil.getTranslation(helpers, errorMessage),
                "icon": "error",
                "subHeading": ""
            }
        });
        return;
    } else if (workflowStatus === pwdResetUtil.uiConstants.WORKFLOW_CONTEXT_FINISHED_STATE) {
        helpers.timing.clearInterval(intervalId);
        api.data.get_pwd_reset_workflow_result.execute({
            token: api.state.token,
            contextId: workflowDetails.flowResponse.contextId
        });
    }
}
