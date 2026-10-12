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

    function alertPayloadForResult(result) {
        return result.errorMsg.map(element => ({"header": element}));
    }

    if (event.name === 'DATA_OP_SUCCEEDED') {
        const result = event.payload.data.output;
        api.setState('alertContents', []);
        switch (result.action) {
            case "report_knowledge_gap":
                if (!result.status) {
                    let alert = alertPayloadForResult(result);
                    api.setState('alertContents', alertPayloadForResult(result));
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
                    api.setState('alertContents', alertPayloadForResult(result));
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
                    api.setState('alertContents', alertPayloadForResult(result));
                } else if (!result.status && !result.errorMsg) {
                    api.setState('alertContents', [{"header": await helpers.translate('To mark as resolved, select "Show all" for the group.')}]);
                } else {
                    api.setState("selectedGroupMessage", await helpers.translate('This will mark the "{0}" group as resolved and remove the group and all its tasks from the list.', result.groupDescription));
                    api.emit('OPEN_MARK_AS_RESOLVED_MODAL');
                }
                break;
            case "unmark_as_gap":
                if (!result.status) {
                    const errorMsg = await helpers.translate('To unmark a group as a gap, select "Show all" for the group.');
                    api.setState('alertContents', [{"header": errorMsg}]);
                } else {
                    api.setState("selectedGroupMessage", await helpers.translate('This will permanently remove the "{0}" group, and all its tasks, from the list as a valid group.', result.groupDescription));
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
