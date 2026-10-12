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
        guidanceActions,
        guidanceInputs
    } = api.context.props;

    var action = null;
    if (guidanceActions && guidanceActions.length > 0) {
        for (var i = 0; i < guidanceActions.length; i++) {
            if (guidanceActions[i] && guidanceActions[i].primary === true) {
                action = guidanceActions[i];
                break;
            }
        }
    }

    api.emit('GUIDANCE_ACTION_CLICKED', {
        action,
        model: {
            fields: [{
                name: "additional_notes",
                value: api.state.additionalNotes,
            }, ]
        }
    });
}
