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
    const {
        isDisplayFieldSelection,
        selectedFields,
    } = api.context.props;

    function convertArray(arr) {
        return arr.map(function(item) {
            if (item.id.includes('.')) {
                var ids = item.id.split('.');
                var labels = item.label.split('.');
                return ids.map(function(id, index) {
                    return {
                        id: id,
                        label: labels[index]
                    };
                });
            } else {
                return [item];
            }
        });
    }
    var listSelectorFields = convertArray(selectedFields);
    if (isDisplayFieldSelection) {
        api.setState("currentAction", "displayFields");
    } else {
        api.setState("currentAction", "certificationFields");
    }
    api.setState("currentSelections", listSelectorFields);
}
