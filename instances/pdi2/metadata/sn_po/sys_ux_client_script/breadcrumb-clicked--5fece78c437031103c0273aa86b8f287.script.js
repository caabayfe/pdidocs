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
    let currentView = { ...api.state.currentView
    };

    if (event.elementId === 'breakdown_form_breadcrumbs') {
        switch (event.payload.item.id) {
            case 'breakdowns':
                {
                    currentView = {
                        view: api.state.VIEWS.BREAKDOWNS_LIST,
                        params: {
                            mode: '',
                        },
                    };
                    api.setState('currentView', currentView);
                    break;
                }
        }
    } else if (event.elementId === 'activity_form_breadcrumbs') {
        switch (event.payload.item.id) {
            case 'activity-definitions':
                {
                    currentView = {
                        view: api.state.VIEWS.ACTIVITIES_LIST,
                        params: {
                            mode: '',
                        },
                    };
                    api.setState('currentView', currentView);
                    break;
                }
        }
    }


}
