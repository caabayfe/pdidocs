/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    let activeUsersClientState = [];
    let activeUsersDataBroker = api.data.look_up_active_users.results;
    
    for (let index in activeUsersDataBroker) {
        let userObject = {
            "id": activeUsersDataBroker[index]["sys_id"]["displayValue"],
            "label": activeUsersDataBroker[index]["name"]["value"],
            "subabel": activeUsersDataBroker[index]["user_name"]["value"],
        };
        activeUsersClientState.push(userObject); 
    }
    api.setState("activeUsers", activeUsersClientState);
}
