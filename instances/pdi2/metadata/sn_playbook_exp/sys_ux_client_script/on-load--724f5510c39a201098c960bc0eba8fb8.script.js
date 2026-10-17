/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        context,
        emit,
        data,
        setState
    } = api;

    if (!context.props.table ||
        !context.props.sysId ||
        !context.props.experience ||
        context.props.compact === undefined)
        setState('show_config_panel', true);

    if (context.props.compact == 'true') {
        setState('compact_mode', true);
        setState('inner_divider_position', api.state.compact_divider_position);
    }

    if (!context.props.experience)
        api.emit('PLAYBOOK#SET_DEFAULT_EXPERIENCE', {
            params: { ...context.props,
                experience: '98e09a560f2200102920c912d4767e1a'
            }
        });
}
