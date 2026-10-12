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

    var data = api.data.look_up_instance_record.result;
    if (data.instance_id.value != 'source_instance') {
        var modelParams = {
            "instance_name": "Clone Instance",
            "instance_url": "",
            "admin_user": "",
            "admin_password": "",
            "show_warning": false,
            "modal_type": "update"
        };
        for (let field in data) {
            if (field in modelParams) {
                // SKIP password - as we wont want it to bind with password field else it will show masked value.
                // this is becuase we are using vlaue bind in model pwd field to handle pwd auto prefill
                if (field !== "admin_password") {
                    modelParams[field] = data[field].displayValue;
                }
            }
        }
        api.setState("modelParams", modelParams);
        const eventHandler = imports["sn_instance_clone.ListPageEventHandler"](api, helpers);
        eventHandler.callUtilAPI({
            operation: "CHECK_TARGET_OAUTH_SETUP",
            instanceUrl: modelParams.instance_url,
        }, true);
    } else {
        helpers.translate('Cannot update source instance').then((translatedText) => {
            var modelParams = {
                'response_variant': 'warning',
                'response_message': translatedText
            };
            api.setState('showMsg', true);
            api.setState('modelParams', modelParams);
        });
    }
}
