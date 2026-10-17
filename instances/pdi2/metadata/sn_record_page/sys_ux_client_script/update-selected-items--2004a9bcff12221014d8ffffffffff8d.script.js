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
    const selectedItems = api.state.selectedItems || [];
    const curExternalEmail = api.state.curExternalEmail;

    if (curExternalEmail.length == 0) {
        return;
    }
    const isDuplicate = selectedItems.flat().some(item => item.id === curExternalEmail);
    if (!isDuplicate) {
        const finalSelectedItems = [...selectedItems, [{
            label: curExternalEmail,
            id: curExternalEmail
        }]];
        api.setState("selectedItems", finalSelectedItems);
    }

    api.setState('curExternalEmail', "");
}
