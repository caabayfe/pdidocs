/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // Edit configuration button
    if (event.elementId === 'button_8'){
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: "/now/configuration/iar/wizard/e06b0afdeb7281102b57e53069522852/params/record-id/" + event.context.item.value.sysId,
                target: "_self"
            }
        });
    }
    // Get started button
    else {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: "/now/conversation/iar/home",
                target: "_self"
            }
        });
    }
}
