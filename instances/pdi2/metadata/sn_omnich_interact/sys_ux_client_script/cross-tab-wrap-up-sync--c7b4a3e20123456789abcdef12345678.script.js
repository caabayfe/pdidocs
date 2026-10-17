/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
    if (api.state.isOpenWrapUpForCurrentUser !== true) {
        return;
    }
    const record = event?.payload?.data?.record;
    const changes = event?.payload?.data?.changes;
    if (!record || !changes) {
        return;
    }
    // Only close when the state field itself changed AND moved away from 'open'.
    // Config updates change wrap_up_configuration but leave state='open', so
    // checking changes.includes('state') prevents a false close-and-reopen cycle.
    if (changes.includes('state') && record.state !== 'open') {
        api.emit('WRAP_UP#END_WRAP_UP', {});
    }
}
