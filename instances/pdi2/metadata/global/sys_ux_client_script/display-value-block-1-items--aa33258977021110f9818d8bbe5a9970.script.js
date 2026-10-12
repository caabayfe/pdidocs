/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var trustedDevice = api.item.value;
    var operatingSystem = trustedDevice.os_type.displayValue;
    var deviceId = trustedDevice.device_id.displayValue;
    var registeredTime = trustedDevice.sys_created_on.displayValue;
    var isActive = trustedDevice.active.value;
    return [{
        "label": api.state.translations.device_card.os_label,
        "value": {
            "type": "string",
            "value": operatingSystem
        }
    }, {
        "label": api.state.translations.device_card.device_id_label,
        "value": {
            "type": "string",
            "value": deviceId
        }
    }, {
        "label": api.state.translations.device_card.reg_time_label,
        "value": {
            "type": "string",
            "value": registeredTime
        }
    } , {
        "label": api.state.translations.device_card.status_label,
        "value": {
            "type": "highlighted-value",
            "label": isActive ? api.state.translations.device_card.active_value : api.state.translations.device_card.inactive_value,
            "status": isActive ? "green" : "critical",
            "showIcon": false
        }
    }];
}
