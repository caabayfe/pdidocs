/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('appName', '');
    api.setState('appUrl', '');
    api.setState('loadDemoData', true);
    const initialTasks = {
        "CREATE_EXPERIENCE": {
            "weight": 3,
            "completed": false
        },
        "UPDATE_PARENT_APP": {
            "weight": 1,
            "completed": false
        },
        "CREATE_ACE_APP": {
            "weight": 2,
            "completed": false
        },
        "CREATE_UX_PAGE_PROPS": {
            "weight": 1,
            "completed": false
        },
        "CREATE_PAGES": {
            "weight": 4,
            "completed": false
        },
        "PATCH_PAGES": {
            "weight": 4,
            "completed": false
        }
    };
    api.setState('tasks', initialTasks);
    api.setState('creationInProgress', false);
    api.emit('SCREEN_STATUS_CHANGED', { isDirty : false });
    helpers.modal.close('create_ace_app_modal');
}
