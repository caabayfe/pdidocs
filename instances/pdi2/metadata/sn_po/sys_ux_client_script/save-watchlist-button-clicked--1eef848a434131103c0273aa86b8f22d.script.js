/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const sysIds = api.state.selectedWatchlistUsers.map(user => user.id);
    const projectPayload = JSON.stringify({
        watch_list: sysIds.toString(),
    });
    api.data.save_watchlist.execute({
        'sys_id': api.context.props.projectId,
        'projectPayload': projectPayload,
    });
}
