/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    var result = api.data.get_task_context_record.results[0];
    if (result && result.context) {
        var context = JSON.parse(result.context.value);
        var allowEmptyFields = context.allowEmptyFields === undefined ? true : context.allowEmptyFields;
        var allowFieldUpdates = context.allowFieldUpdates === undefined ? true: context.allowFieldUpdates;
        var YES = await helpers.translate("Yes");
        var NO = await helpers.translate("No");
        var allowEmptyFieldsLabel = await helpers.translate("Allow empty field values");
        var allowFieldUpdatesLabel = await helpers.translate("Allow field updates");

        api.setState("allowEmptyFieldsLabelValue", [{
            "label": allowEmptyFieldsLabel,
            "value": {
                "type": "string",
                "value": allowEmptyFields ? YES : NO
            }
        }]);

        api.setState("allowFieldUpdatesLabelValue", [{
            "label": allowFieldUpdatesLabel,
            "value": {
                "type": "string",
                "value": allowFieldUpdates ? YES : NO
            }
        }]);
    }
}
