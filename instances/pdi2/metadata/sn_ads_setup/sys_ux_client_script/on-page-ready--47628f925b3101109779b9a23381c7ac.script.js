/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const headerActions = [
        {
            "id": "1",
            "label": await helpers.translate("Guided setup settings"),
            "children": [
                {
                    "id": "basic_info",
                    "label": await helpers.translate("Basic information")
                }
            ]
        }
    ];
    api.setState('headerActions', headerActions);
    api.setState("showNotification", api.context.props.showNotification === "true");
}
