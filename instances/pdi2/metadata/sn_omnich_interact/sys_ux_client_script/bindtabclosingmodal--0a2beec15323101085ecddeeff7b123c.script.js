function handler({
    api,
    helpers
}) {
    if (api.data.interaction_query.output.data.GlideRecord_Query.interaction._results.length == 0)
        return;

    const response = api.data.interaction_query.output.data.GlideRecord_Query.interaction._results[0];
    let hasWarning = false;

    if (response.assigned_to.value === api.context.session.user.sys_id && response.active.value &&
        ((response.type.value === 'chat') || (response.type.value === 'messaging' && response.state.value === 'wrap_up')))
        hasWarning = true;

    var modal = "[component-id$='custom_1']";
    if (response.state.value === 'wrap_up')
        modal = "[component-id$='custom_2']";

    api.emit('SCREEN_STATUS_CHANGED', {
        hasWarning: hasWarning,
        warningModalId: modal
    });
}
