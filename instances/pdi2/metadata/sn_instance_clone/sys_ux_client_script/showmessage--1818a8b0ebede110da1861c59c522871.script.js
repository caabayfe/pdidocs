/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    var message;
    if (api.context.props.profileName) {
        var modelParams = {
            "instance_url": "",
            "instance_name": "",
            "admin_user": "",
            "admin_password": "",
            "response_message": message,
            "response_variant": "info",
            "modal_type": null
        };
        if (api.context.props.operation == 'create') {
            var operation = 'GET_PROFILE_NAME';
            helpers.snHttp('/api/sn_instance_clone/clone/util', {
                method: 'POST',
                body: {
                    operation: operation,
                    sysId: api.context.props.profileName,
                }
            }).then(resp => {
                api.setState("showMsg", true);
                modelParams.response_message = resp.response.result.name + api.data.clone_get_list_header_1.output.listAlertMessage;
                api.setState("modelParams", modelParams);
            }).catch(resp => {
                if (!!resp.isError) {
                    try {
                        console.log(operation + " failed: Something Went Wrong");
                    } catch (e) {
                        console.log(operation + " failed, could not provide details");
                    }
                }
            });
        } else {
            api.setState("showMsg", true);
            modelParams.response_message = api.data.clone_get_list_header_1.output.listAlertDeleteMessage;
            api.setState("modelParams", modelParams);
        }
    }
}
