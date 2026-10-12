function handler({
    api,
    event,
    helpers,
    imports
}) {
    var number = event.payload.item.label,
        configValue = api.data.query_default_call_config.output.data.GlideRecord_Query.sys_properties._results[0].value.value,
        computerTelephonyIntegration = 'CTI',
        isOpenFrameConfigValid = false,
        recordOpenCall = "RECORD#OPEN_CALL",
        navigate = "NAV_ITEM_SELECTED";

    if (api.context.props.isCtiEnabled === true)
        isOpenFrameConfigValid = true;

    if (configValue === computerTelephonyIntegration) {
        if (isOpenFrameConfigValid) {
            let table = api.context.props.table,
                sysId = api.context.props.recordSysId,
                source = "form_field";
            api.emit(recordOpenCall, {
                "route": "cti",
                "fields": {
                    "opened": true
                },
                "iconSelected": true,
                "params": {
                    "number": number,
                    "sysId": sysId,
                    "table": table,
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
