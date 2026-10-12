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
    var data = api.data.sow_remediate_get_playbook_activity_context.output;
    var startTime, endTime;
    for (var i = 0; i < data.length; i++) {
        var label = '';
        if (data[i].label.includes('start'))
            startTime = data[i].sys_updated_on;
        else
            endTime = data[i].sys_updated_on;
    }
    if (startTime != null && endTime != null) {
        var labelValuePair = [{
            "label": await helpers.translate("Started on"),
            "value": {
                "type": "string",
                "value": startTime,
            }
        }, {
            "label": await helpers.translate("Ended on"),
            "value": {
                "type": "string",
                "value": endTime,
            }
        }];
        let message = await helpers.translate("{0} was successful!", [api.context.props.experienceProperties.button_label.value]);
        api.setState('alertMsg', message);
        api.setState('labelValuePair', labelValuePair);
    }
}
