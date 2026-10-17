/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const SEARCH = "search";
    const ERROR = "in_error";
    const NEW = "new";
    const COMPLETED = "completed";
    var isGenius = api.state.customExpProps?api.state.customExpProps.isGenius:false;

    if (isGenius) {
        var actionStateValue = api.state.customExpProps ? api.state.customExpProps.actionStateValue : 'new';
        if (actionStateValue == NEW || actionStateValue == COMPLETED || actionStateValue == ERROR) {
            return false;
        } else {
            return true;
        }
    } else {
        return true;
    }
}
