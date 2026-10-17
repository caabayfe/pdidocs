/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({ api, event, helpers, imports }) {
    const actionSysId = event.payload.item.id;
    const actions = api.data.fetch_not_message_type_actions.results;
    let action = actions.find(action => action.action.value == actionSysId);

    const actionReference = action.action._reference;
    const actionType = actionReference.type.value;
    const actionInput = actionReference.input.value;

    switch (actionType) {
        case 'script':
        case 'flow_action':
        case 'subflow':
        case 'scripted_rest_resource':
        case 'rest': {
            const selectedRows = [api.state.row_selected];
            const errorCodeSysId = api.state.error_code_sysid;
            if (actionSysId) {
                api.data.execute_selected_action.execute({
                    actionSysId: actionSysId,
                    errorMsgSysIds: selectedRows,
                    errorCodeSysId: errorCodeSysId,
                });

                const actionInitationMsg = await helpers.translate(
                    'Action execution has been initiated.'
                );

                api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                    items: [{
                        id: 'actionExecution',
                        status: 'positive',
                        content: actionInitationMsg,
                        action: {
                            type: 'dismiss'
                        },
                    }, ],
                });
            }
            break;
        }

        case 'table': {
            table_action_handler(actionInput);
            break;
        }
        case 'open_url': {
            let content;
            try {
                content = JSON.parse(actionInput);
            } catch (_) {
                content = null;
            }
			
            if (!content) {
                const invalidMsg = await helpers.translate(
                    'This Open URL action could not be executed because it is not valid JSON. Contact the administrator for this action.'
                );
                api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                    items: [{
                        id: 'actionOpenUrlInvalid',
                        status: 'critical',
                        content: invalidMsg,
                        action: { type: 'dismiss' },
                    }],
                });
                break;
            }
			
            if (content.external && !is_safe_open_url(content.external.url)) {
                const rejectedMsg = await helpers.translate(
                    'This Open URL action was rejected because the URL contains script execution content. Contact the administrator for this action.'
                );
                api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                    items: [{
                        id: 'actionOpenUrlRejected',
                        status: 'critical',
                        content: rejectedMsg,
                        action: { type: 'dismiss' },
                    }],
                });
                break;
            }
            api.emit('NAV_ITEM_SELECTED', content);
            break;
        }
    }

    function table_action_handler(action_content) {
        const content = JSON.parse(action_content);
        let record = 'record';
        let table = content.table;
        let fields = {};

        if (table && table.endsWith('_list')) {
            record = 'list-page';
            fields.table = table.slice(0, -5);
        } else {
            fields.table = table;
            fields.sysId = '-1';
        }

        const payload = {
            "route": record,
            "size": "lg",
            "fields": fields
        };

        api.emit('NAV_ITEM_SELECTED', payload);
    }

    // Defense-in-depth for external URLs: block dangerous schemes before emitting.
    function is_safe_open_url(url) {
        if (typeof url !== 'string' || !url.trim()) return false;
        const trimmed = url.trim();
        const lower = trimmed.toLowerCase();
        const dangerous = ['javascript:', 'data:', 'file:', 'vbscript:'];
        for (let i = 0; i < dangerous.length; i++) {
            if (lower.indexOf(dangerous[i]) === 0) return false;
        }
        if (trimmed.indexOf('//') === 0) return false;
        return true;
    }
}
