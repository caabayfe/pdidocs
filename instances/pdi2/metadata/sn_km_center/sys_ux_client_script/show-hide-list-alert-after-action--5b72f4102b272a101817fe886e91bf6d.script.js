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
    if (event.name === 'DATA_OP_SUCCEEDED') {
        const result = event.payload.data.output;
        api.setState('alertContents', []);
        api.setState('feedbackTaskData', null);
        switch (result.action) {
            case "report_knowledge_gap": 
                if (!result.status) {
                    api.setState('alertContents', result.errorMsg);
                } else {
                    api.emit('OPEN_REPORT_KNOWLEDGE_GAP_MODAL', {
                        "fields": {
                            "selectedSysIds": result.selectedSysIds
                        },
                        "route": "report-knowledge-gap"
                    });
                }
                break;
            case "create_article":
                if (!result.status) {
                    api.setState('alertContents', result.errorMsg);
                } else {
                    api.emit('NAV_ITEM_SELECTED', {
                        "params": {
                            "gapsSysIds": result.selectedSysIds
                        },
                        "route": "kb_interceptor"
                    });
                }
                break;
            case "gap_resolved":
                if (!result.status && result.errorMsg) {
                    api.setState('alertContents', result.errorMsg);
                } else if (!result.status && !result.errorMsg) {
                    api.setState('alertContents', [await helpers.translate('To mark as resolved, select a group from the chart.')]);
                } else {
                    api.setState("selectedGroupMessage", await helpers.translate('This will mark the "{0}" group as resolved and remove the group and all its tasks from the list.', api.state.listTitle));
                    api.emit('OPEN_MARK_AS_RESOLVED_MODAL');
                }
                break;
            case "unmark_as_gap": 
                if (!result.status) {
                    const errorMsg = await helpers.translate('To unmark as gap, select a group from the chart.');
                    api.setState('alertContents', [errorMsg]);
                } else {
                    api.setState("selectedGroupMessage", await helpers.translate('This will permanently remove the "{0}" group, and all its tasks, from the list as a valid group.', api.state.listTitle));
                    api.emit('OPEN_UNMARK_AS_GAP_MODAL');
                }
                break;
        }
    } else if (event.name = 'NOW_ALERT#ACTION_CLICKED') {
        var arr = [...api.state.alertContents];
        arr.splice(event.context.item.index, 1);
        api.setState('alertContents', arr);
    }
}
