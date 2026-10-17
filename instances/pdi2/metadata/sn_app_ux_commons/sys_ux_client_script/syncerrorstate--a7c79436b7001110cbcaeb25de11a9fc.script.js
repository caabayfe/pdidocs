/**
 * A handler for `SN_NODE_MAP_UNIFIED_CTRL#ERROR_STATE_CHANGED`.
 * Resolves out prop "hasError".
 */
function handler({api, event, helpers, imports}) {
    const {showError} = api.context.props;
    const {hasError} = event.payload;

    api.setState('hasError', Boolean(showError || hasError));
}
