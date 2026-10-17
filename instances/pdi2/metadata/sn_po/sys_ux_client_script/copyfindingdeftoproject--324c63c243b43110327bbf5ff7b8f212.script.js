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
    if (event.name == "DATA_OP_SUCCEEDED") {
        const messagesArray = event.payload.data.output.data.GlidePromin_Mutation.copySelectedFindingDefinitionsToProject;
        messagesArray.forEach(async ({
            messages,
            status
        }) => {
            let content =  status != "SUCCESS" ? `<div>${messages[0]}<ol>` : `<div>${messages[0]}`;

            // collects finding def id messages for WARNING and ERROR case 
            for (let i = 1; i < messages.length; i++) {
                content += `<li>${messages[i]}</li>`;
            }           
            content += status != "SUCCESS" ? '</ol></div>' : '</div>';

            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    status: status == "SUCCESS" ? 'positive' : 'warning',
                    icon: 'info-circle-outline',
                    header: '',
                    content: {
                        type: 'html',
                        value: content,
                    },
                    action: {
                        type: 'dismiss'
                    }
                }]
            });
        });

        api.setState('iscurrentView', {
            landing: true
        });
        helpers.modal.close("[component-id$='add_from_library']");
        api.data.get_project_details_1.refresh();
        api.setState('overlayMessage', {});
        api.data.list_controller.data_refresh_requested();
    } else {
        const messages = event.payload.errors;
        messages.forEach(async (message, errorType) => {
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: [{
                    status: 'critical',
                    icon: 'info-circle-outline',
                    header: errorType,
                    content: message,
                    action: {
                        type: 'dismiss'
                    }
                }]
            });
        });
    }
    const newData = api.state.templateListData.rows.map((data) => {
        return { ...data,
            'isSelected': false
        };
    });
    api.setState('templateListData', {
        "rows": newData
    });

}
