function handler({
    api,
    event,
    helpers,
    imports
}) {
    var number = api.state.userDetails.phone,
        configValue = api.data.query_default_call_config.result.value.value,
        computerTelephonyIntegration = 'CTI',
        isOpenFrameConfigValid = false,
        recordOpenCall = "RECORD#OPEN_CALL",
        navigate = "NAV_ITEM_SELECTED";

    if (api.data.validate_openframe_configuration.output)
        isOpenFrameConfigValid = api.data.validate_openframe_configuration.output.isOpenframeConfigValid;

    if (configValue === computerTelephonyIntegration) {
       if (isOpenFrameConfigValid) {
            let source = "form_field";
            api.emit(recordOpenCall, {
                "route": "cti",
                "fields": {
                    "opened": true
                },
                "iconSelected": true,
                "params": {
                    "number": number,
                    "source": source
                }
            });
            return;
        } else {
            console.log("CTI is not configured properly or logged-in user does not have the necessary roles");
        }
    }

    let url = `tel:${number}`;
    api.emit(navigate, {
        "external": {
            "url": url
        }
    });
}
