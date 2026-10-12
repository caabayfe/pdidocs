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
    const uiConstants = imports["sn_instance_clone.InstanceCloneUIConstants"]();
    const {
        navigateToPage
    } = imports["sn_instance_clone.InstanceCloneUtils"]();

    if (event.name == uiConstants.EVENT.NOW_CARD_CLICKED) {
        navigateToPage(api,
            'clone-status', {
                'sysId': event.context.item.value.key,
                't': Date.now()
            }, {

            });
    }
    if (event.name == uiConstants.EVENT.NOW_LIST_CELL_LINK_CLICKED) {
        var operation = uiConstants.OPERATION.GET_CLONE_REQUEST_SYS_ID;
        helpers
            .snHttp(uiConstants.SERVER_PATH, {
                method: "POST",
                body: {
                    operation: operation,
                    request_id: event.payload.cell.value
                },
            })
            .then((response) => {
                var request_sys_id = response.response.result.sys_id;
                navigateToPage(api, 'clone-status', {
                    'sysId': request_sys_id,
                    't': Date.now()
                }, {});

            })
            .catch((resp) => {
                if (!!resp.error) {
                    try {} catch (e) {}
                }
            });
    }

}
