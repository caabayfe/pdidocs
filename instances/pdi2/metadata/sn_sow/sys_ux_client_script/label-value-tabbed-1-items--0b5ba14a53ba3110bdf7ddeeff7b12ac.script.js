/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    var item = api.item.value;
    var labelValues = [];

    if (item.manager.displayValue) {
        labelValues.push({
            label: helpers.translateSync("Manager"),
            value: item.manager.displayValue
        });
    }

    if (item.email.value) {
        labelValues.push({
            label: helpers.translateSync("Team email"),
            value: {
                type: "text-link",
                value: item.email.value,
                label: item.email.value,
                showIcon: false,
                href: "mailto:" + item.email.value,
                underlined: false,
                opensWindow: false
            }
        });
    }

    if (item.onCallData && item.onCallData.shift) {
        labelValues.push({
            label: helpers.translateSync("Current shift name"),
            value: item.onCallData.shift.name
        });

        labelValues.push({
            label: helpers.translateSync("Shift duration"),
            value: helpers.translateSync("{0} - {1}", [item.onCallData.shift.start_translated, item.onCallData.shift.end_translated])
        });
    }

    return labelValues;
}
