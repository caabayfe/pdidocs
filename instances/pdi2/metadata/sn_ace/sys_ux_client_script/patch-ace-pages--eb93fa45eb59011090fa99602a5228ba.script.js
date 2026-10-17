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
    const pages = event.payload.data.output;
    const {
        uxAppConfigId,
        aceConstants,
        aceAppConfigId
    } = api.state;

    pages.forEach((page, index) => {
        helpers
            .snHttp(`/api/now/builder/apps/${uxAppConfigId}/pages`, {
                method: "POST",
                body: JSON.stringify({
                    "name": page.name,
                    "route": page.path,
                    "isActive": true,
                    "order": 0,
                    "icon": "",
                    "fields": page.fields,
                    "parameters": page.params,
                    "rootMacroponentId": page.rootMacroponentId,
                    "copyRootMacroponent": true
                })
            })
            .then(({
                response
            }) => {
                const macroponentId = response.result.macroponentInstance.rootMacroponentId;
                const screenType = response.result.screenType;
                api.data.patch_ace_page.execute({
                    aceAppConfig: aceAppConfigId,
                    pageId: page.sys_id,
                    macroponentId,
                    screenType
                });
                if (index === pages.length - 1) {
                    api.emit('TASK_COMPLETE', {
                        task: 'PATCH_PAGES'
                    });
                    api.emit('ACE_APP_CREATED');
                    
                }
            })
            .catch(({
                error
            }) => {
                api.emit('APP_CREATION_FAILED', {
                    error
                });
            });
    });

}
