/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
api.emit("NAV_ITEM_SELECTED", {
            external: {
                url: "now/conversational-studio/builder?table=sys_cb_topic&sysId="+ api.state.cbTopicId,
                target: "_blank"
            }
        });
}
