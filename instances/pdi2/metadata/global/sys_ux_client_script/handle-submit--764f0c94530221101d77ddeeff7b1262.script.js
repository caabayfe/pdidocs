/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        curStartDate,
        newStartDate,
        newEndDate,
        difference,
        sysId
    } = api.context.props;

    const {
        selectedId
    } = api.state;

    let payload = {};
    if (selectedId == 'all_occurrences') {
        payload = {
            event_id: sysId,
            time_diff: difference,
            update_single_occurrence: false
        };
    } else {
        payload = {
            current_start_date: curStartDate,
            event_id: sysId,
            new_end_date: newEndDate,
            new_start_date: newStartDate,
            update_single_occurrence: true
        };
    }
    await helpers.snHttp('/api/now/schedule_page/event/schedule', {
            method: 'PUT',
            body: payload
        })
        .then(({
            response
        }) => {
            api.emit('SCHEDULE#MOVE_EVENT_NOTIFICATION');
        })
        .catch(({
            error
        }) => {
            const message = `Error: ${error.data.error.message}`;
            console.error(message);
        });
}
