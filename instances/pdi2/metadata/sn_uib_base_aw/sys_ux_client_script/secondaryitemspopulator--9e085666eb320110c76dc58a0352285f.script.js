/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({ api }) {
    if (api.context.app.record_secondary_values_location !== 'sidebar'
        && api.data.gform && api.data.gform.nowRecordCommonHeader
        && api.data.gform.nowRecordCommonHeader.secondaryItems
        && api.data.gform.nowRecordCommonHeader.secondaryItems.length) {
        const secondaryItems = api.data.gform.nowRecordCommonHeader.secondaryItems;
        return secondaryItems.map((item) => {
            let value = {};
            if (item.type === "reference")
                value = {
                    "type": "text-link",
                    "label": item.displayValue,
                    "href": "javascript:void(0)",
                    "value": item.sysId,
                    "data": item
                };
            else if (item.type === "highlighted")
                value = {
                    "type": "highlighted-value",
                    "label": item.displayValue,
                    "status": item.colorName,
                    "showIcon": item.showIcon,
                    "icon": item.iconName,
                    "value": item.sysId,
                    "data": item
                };
            else
                value = {
                    "type": "string",
                    "value": item.displayValue,
                    "data": item
                };

            return {
                "label": item.fieldLabel,
                "value": value
            };
        });
    }
    return [];
}
