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
    const {
        uxAppConfigId,
        appName,
        aceAppConfigId
    } = api.state;
    const CONTENT_BLOCK_ID = "244ef37553a101102958ddeeff7b1208";
    const context = {
        content_block_id: ''
    };

    helpers.snHttp(`/api/now/builder/apps/${uxAppConfigId}/pages`, {
            method: "POST",
            body: JSON.stringify({
                "name": `${appName} - ACE Content Block`,
                "route": "ace-content-block",
                "isActive": true,
                "order": 0,
                "icon": "",
                "fields": [],
                "rootMacroponentId": CONTENT_BLOCK_ID,
                "copyRootMacroponent": true
            })
        })
        .then(({
            response
        }) => {
            context.content_block_id = response.result.macroponentInstance.rootMacroponentId;
            api.setState('aceFactoryContext', context);
            api.emit('TASK_COMPLETE', {
                task: 'CREATE_CONTENT_BLOCK_FACTORY'
            })
            api.data.create_content_block_sub_pages.execute({
                context,
                screenType: response.result.screenType,
                aceAppConfig: aceAppConfigId,
                uxAppConfigId: uxAppConfigId,
                aceAppName: appName
            });
        })
        .catch(({
            error
        }) => {
            api.emit('APP_CREATION_FAILED', {
                error
            });
        });
}
