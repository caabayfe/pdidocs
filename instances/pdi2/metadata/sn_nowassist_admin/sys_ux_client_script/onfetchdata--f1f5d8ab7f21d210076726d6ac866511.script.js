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
    api.setState('dataPrivacyChannels', api?.data?.get_data_privacy_channels_1?.output);
    var columnDefinition = {
        "columns": [{
                "cellEditingDisabled": true,
                "key": "patterns",
                "label": await helpers.translate("Patterns"),
                "type": "string"
            },
            {
                "cellEditingDisabled": true,
                "key": "status",
                "componentTag": "now-highlighted-value",
                "label": await helpers.translate("Status"),
                "type": "custom"
            }, {
                "cellEditingDisabled": true,
                "key": "anonymization_technique",
                "label": await helpers.translate("Anonymization technique"),
                "type": "string"
            }
        ]
    };

    api.setState('columnDefinition', columnDefinition);
}
