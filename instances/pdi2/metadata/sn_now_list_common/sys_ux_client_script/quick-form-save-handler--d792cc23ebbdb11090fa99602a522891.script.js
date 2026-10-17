/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({ api, event, helpers, imports }) {
    api.setState('isDirty', false);
    
    const { actionType } = event.payload;
    if (actionType === 'success') {
        api.emit('LIST_CTRL#ADD_NOTIFICATIONS', {
            items: [
                {
                    status: 'positive',
                    content: await helpers.translate(
                        'Record successfully updated'
                    ),
                    action: {
                        type: 'dismiss',
                    },
                },
            ],
        });
        api.emit('LIST_CTRL#REFRESH_REQUESTED');
        api.emit('LIST_CTRL#LIST_DATA_UPDATED');
    } else if (actionType === 'failure') {
        api.emit('LIST_CTRL#ADD_NOTIFICATIONS', {
            items: [
                {
                    status: 'critical',
                    content: await helpers.translate(
                        'Record not updated'
                    ),
                    action: {
                        type: 'dismiss',
                    },
                },
            ],
        });
    }

    api.emit('LIST_CTRL#CLOSE_PANEL');
}
