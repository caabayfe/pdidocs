/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(event.payload.context === "modal-create") {
        const pcName = api.state.pcName;
        const pcExpShell = api.state.selectedAppShell.id;
        const componentId = api.state.selectedComponent.macroponentSysId;
        const controllerId = api.state.selectedController.id;
        const description = api.state.pcDescription;
        const controllerName = api.state.controllerName;
        const depKey = api.state.depKey;
        const controllerDep = Object.values(api.state.controllerDepObj);

        const isViewport = componentId === "VIEWPORT";

        const payload = {
                "appShell": pcExpShell,
                "component": isViewport ? '' : componentId,
                "type": isViewport ? 'viewport' : '',
                "controllerDependencies" : controllerDep,
                "name": pcName,
                "description": description
            };
        api.data.create_page_collection_1.execute(payload);
        }
}
