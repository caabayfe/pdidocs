/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        name,
        payload: {
            eventName,
            eventPayload
        }
    } = event;

    if (name !== 'ACE_ACTION_PERFORMED') {
        return;
    }

    // button clicks are handled here
    if (eventName == "VIEW_CHAT_HISTORY_SETTINGS") {
        api.emit('NAV_ITEM_SELECTED', {
            route: 'conversation-history-settings',
            params: {
                t: Date.now(),
                'aceNav':'agent-chat'
            },
            fields: null,
            external: null
        });
        return;
    }

    if (eventName == "HANDLE_AGENT_CHAT_CONTROL_CHANGE") {
        // all control changes are handled here. store changes in client state
        api.emit('SCREEN_STATUS_CHANGED', {
            isDirty: true
        });
        const {
            chat_setup: {
                sys_id
            }
        } = api.data.ci_chat_settings_1.output;

        const {
            field_name,
            new_value,
            old_value,
            table
        } = eventPayload[sys_id];

        if (new_value !== old_value && api.state.modifiedFields.indexOf(field_name) == -1) {
            api.state.modifiedFields.push(field_name);
            api.setState("modifiedFields", api.state.modifiedFields);
        }

        if (field_name == 'show_agent_details') {
            // get control card for this field
            const getControlCard = (fieldName, blocks = [], controlCard = []) => {
                if (controlCard.length) return;

                blocks.forEach((cb) => {
                    if (cb.props_details && cb.props_details.field === fieldName) {
                        controlCard.push(cb);
                        return;
                    }

                    if (cb.children && cb.children.length > 0)
                        getControlCard(fieldName, cb.children, controlCard);
                });
            };

            const controlCard = [];

            getControlCard('show_agent_name_in_header', api.state.aceContentBlocks, controlCard);

            let agentHeaderControlCard = controlCard[0];
            agentHeaderControlCard.props_details.disabled = !new_value;

            const {
                patchLazyBlock
            } = imports["sn_ace.ACELazyBlocksUtil"]();
            api.setState("aceContentBlocks", ({
                currentValue,
                api
            }) => {
                let contentBlocks = [...currentValue] || [];
                patchLazyBlock(contentBlocks, agentHeaderControlCard);

                return JSON.parse(JSON.stringify(contentBlocks));
            });
        }

        const {
            chat_setup,
            chat_setup: {
                fields
            }
        } = api.state;

        const updatedSetup = {
            ...chat_setup,
            fields: {
                ...fields,
                [field_name]: {
                    value: new_value
                }
            }
        };
        api.setState('chat_setup', updatedSetup);
    }

}
