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
    const response = api.data.interaction_query.output.data.GlideRecord_Query.interaction._results[0];
    if (response === undefined)
        return;
    let hasWarning = false;

    if (response.assigned_to.value === api.context.session.user.sys_id && response.active.value &&
        ((response.type.value === 'chat') || (response.type.value === 'messaging' && response.state.value === 'wrap_up')))
        hasWarning = true;

    var modal = "[component-id$='interaction_confirm_modal']";

    if (response.state.value === 'wrap_up')
        helpers.translate("Are you sure you want to close the record tab? This will end wrap up and close the interaction.").then((val) => {
            api.setState('confirmModalText', val);
        });
    else
        helpers.translate("Are you sure you want to close the record tab? This will end the chat and close the interaction.").then((val) => {
            api.setState('confirmModalText', val);
        });

    api.emit('SCREEN_STATUS_CHANGED', {
        hasWarning: hasWarning,
        warningModalId: modal
    });
}
