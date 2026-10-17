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
    const externalURL = event.context.item.value.url;
    try {
        const fnConstr = (function() {}).constructor;
        const windowObject = fnConstr('return this')();
        const pathParams = windowObject.location.href.split('/');
        const externalTaskParamKeyIndex = pathParams.indexOf('control-external-task');
        const externalTaskParamValueIndex = externalTaskParamKeyIndex + 1;
        if (externalTaskParamKeyIndex !== -1 && pathParams[externalTaskParamValueIndex] && pathParams[externalTaskParamValueIndex] === 'true') {
            //Sending payload to parent using post message
            var data = {
                'provider': 'GUIDED_SETUP',
                'url': externalURL
            };
            windowObject.parent.postMessage(data, windowObject.parent.origin);
           
        } else {
            windowObject.open(externalURL);
        }
    } catch (e) {
        console.log('Failed to read windowObject :', e);
        //Opening the External task in new browser tab if the windowObject fails
        api.emit("NAV_ITEM_SELECTED", {
            "external": {
                "url": externalURL,
                "target": "_blank"
            }
        });
    }
}
