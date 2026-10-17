/**
 * @param {params} params
 * @param {api} params.api
 * @param {event} params.event
 * @param {imports} params.imports
 */
function handler({ api, event, imports, helpers }) {
    const {
        name,
        payload: { route, fields, params, size = 'md', ariaLabel, bare = true, actionType, enableFullScreenInMobile = true},
    } = event;
    if (name === 'LIST_CTRL#CLOSE_MODAL') {
        api.setState('contents', null);
        // Only close all modals on the page when actionType is discard/cancel
        if (actionType === 'cancel' || actionType === 'discard') helpers.modal.close();
    } else if (name === 'LIST_CTRL#OPEN_MODAL') {
        if (!route) return;

        if (route === 'edit-filters') {
            const { validateDirtyStatus } = imports['sn_now_list_common.ListControllerUtils']();
            if (validateDirtyStatus(...arguments))
                return;
        }

        api.setState('bare', bare);
        api.setState('displayOptions', {
            size: size,
            label: ariaLabel || fields?.label,
            enableFullScreenInMobile: enableFullScreenInMobile,
        });
        api.setState('contents', {
            route: route,
            fields: fields,
            params: params,
        });
    }
}
