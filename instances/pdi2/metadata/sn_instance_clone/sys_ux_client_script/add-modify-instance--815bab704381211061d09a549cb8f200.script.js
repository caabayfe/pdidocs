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
    if (event.name == "NOW_BUTTON#CLICKED" && event.elementId == "delete_button") {
        var sys_id = api.state.record_sys_id;
        var operation = "DELETE_INSTANCE";
        helpers.snHttp('/api/sn_instance_clone/clone/util', {
            method: 'POST',
            body: {
                operation: operation,
                sysId: api.state.record_sys_id
            }
        }).then(response => {
            var result = response.response.result;
            helpers.modal.close('list_modal');
            var modelParams = api.state.modelParams;

            if (result.isError) {
                modelParams.response_message = "Instance Deletion Failed";
                modelParams.response_variant = "critical";
            } else {
                modelParams.response_message = "Instance Deletion Successful";
                modelParams.response_variant = "info";
            }
            api.setState("timestamp", Date.now());
            api.setState("showMsg", !api.state.showMsg);
            api.setState("modelParams", modelParams);


        }).catch(resp => {
            if (!!resp.error) {
                try {} catch (e) {}
            }
        });

    } else {
        var operation = "INSTANCE_AUTH";
        api.setState("disableButton", true);
        helpers.snHttp('/api/sn_instance_clone/clone/util', {
            method: 'POST',
            body: {
                operation: operation,
                instanceUrl: api.state.modelParams.instance_url,
                userName: api.state.modelParams.admin_user,
                password: api.state.modelParams.admin_password,
                registerInstance: true
            }
        }).then(response => {
            var data = JSON.stringify(response);
            var result = response.response.result;
            api.setState("timestamp", Date.now());
            var modelParams = api.state.modelParams;
            if (result.isError) {
                api.setState("showErrorMessage", true);
                helpers.translate("Unable to Save the Instance {0}  Authentication Failed: {1}", api.state.modelParams.instance_url, result.message)
                    .then((message) => {
                        api.setState("errorMessage", message);
                    });

            } else {
                helpers.modal.close('list_modal');
                // ADDED: Clear the password from state after use as we are using data binidng to handle browser autofill password.
                var modelParams = api.state.modelParams;
                modelParams.admin_password = ''; // Clear it!
                api.setState("modelParams", modelParams);
                api.setState("showErrorMessage", false);
                api.setState("showMsg", !api.state.showMsg);
                helpers.translate("Instance {0} Saved successfully", api.state.modelParams.instance_url)
                    .then((val) => {
                        modelParams.response_message = val;
                        modelParams.response_variant = "info";
                        api.setState("modelParams", modelParams);
                    });
            }
            api.setState("modelParams", modelParams);
            api.setState("timestamp", Date.now());
            api.setState("disableButton", false);
        }).catch(resp => {
            if (!!resp.error) {
                try {} catch (e) {}
            }
        });


    }
}
