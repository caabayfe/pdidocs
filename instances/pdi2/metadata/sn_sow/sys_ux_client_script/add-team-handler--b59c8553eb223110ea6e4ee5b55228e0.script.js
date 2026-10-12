/**
 * Add Team Handler
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

    const payload = {
        name: event.name,
        elementId: event.elementId,
        items: event.items,
        payload: event.payload
    };

    if (!!payload.payload && payload.payload.request_id) {
        const requestId = payload.payload.request_id;
        const requestNum = payload.payload.request_number;
        const requestTable = payload.payload.request_table;
        const requestTeamName = payload.payload.request_team_name;
        
        helpers.translate('A team request for {team} has been submitted for approval', { team: requestTeamName })
        .then((message) => {
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                "items": [{
                    "id": "teams-error-message",
                    "action": {
                        "type": "dismiss"
                    },
                    "header": "",
                    "content": message,
                    textLinkProps: {
                        label: requestNum,
                        href: '/now/sow/record/' + requestTable + '/' + requestId
                    },
                    "status": "positive",
                }]
            });
        })
        .then(() => {
            helpers.timing.setTimeout(() => {
                api.setState("listRefresh", {
                    "list": "requests",
                    "timestamp": new Date() 
                });
            }, 5000);
        });
    }
}
