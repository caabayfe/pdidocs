/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.state.modalButtonClicked) {
        api.data.ace_fetch_content_blocks.refresh();
        api.data.check_if_any_assistants_are_public.refresh();
    }
    else {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: 'now/conversation/settings/general',
                target: "_self"
            }
        });
    }

}
