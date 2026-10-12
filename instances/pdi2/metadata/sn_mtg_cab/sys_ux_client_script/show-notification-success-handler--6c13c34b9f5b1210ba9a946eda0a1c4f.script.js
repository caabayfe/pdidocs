/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({api, event, helpers, imports}) {
    const notifications = {
        'update_cab_meeting_notes': {
            id: 'saveNotesSuccess',
            status: 'positive',
            icon: 'check-circle-outline',
            content: await helpers.translate('Meeting notes saved'),
            action: {
                type: 'dismiss'
            }
        },
        'restore_agenda_item': {
            id: 'restoreAgendaItem',
            status: 'info',
            icon: 'check-circle-outline',
            content: {
                type: 'html',
                value: await helpers.translate('<span><b>{0}</b> was restored and moved to the <b>Up next</b> tab</span>', api.state.selectedAgendaItem.task.display_value)
            },
            action: {
                type: 'dismiss'
            }
        }
    };

    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        items: [notifications[event.elementId]]
    });
}
