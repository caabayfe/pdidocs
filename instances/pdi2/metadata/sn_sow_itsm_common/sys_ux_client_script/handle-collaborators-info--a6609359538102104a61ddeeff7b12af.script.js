/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const users = api.data.fetch_all_contributors_on_an_incident.output.contributorsInfo;
    const emptyCollabList = {
        "rows": []
    };

    if (users && users.length > 0) {
        users.sort((a, b) => {
            const fa = a.userDisplayValue.toLowerCase(),
                fb = b.userDisplayValue.toLowerCase();
            return (fa < fb) ? -1 : (fa > fb) ? 1 : 0;
        });
        const listRows = emptyCollabList;
        for (let i = 0; i < users.length; i++) {
            const contributorObject = users[i];
            listRows.rows[i] = {};
            listRows.rows[i].cells = {};
            listRows.rows[i].cells.userDisplayValue = {};
            listRows.rows[i].cells.title = {};
            listRows.rows[i].key = i;
            listRows.rows[i].sysId = contributorObject.sys_id;
            const title = contributorObject.title ? contributorObject.title : "";
            listRows.rows[i].cells.userDisplayValue = {
                "label": contributorObject.userDisplayValue,
                "value": '#',
                "sysId": contributorObject.sys_id
            };
            listRows.rows[i].cells.title = {
                "value": title
            };
        }
        api.setState('allAdditionalCollaboratorsList', listRows);
    } else {
        api.setState('allAdditionalCollaboratorsList', emptyCollabList);
    }
    if (users && users.length <= api.state.recordsPerPage) { 
        api.setState('hideNextAndLastPageButton', true);
    }
    api.setState('hideCollabList', false);
}
