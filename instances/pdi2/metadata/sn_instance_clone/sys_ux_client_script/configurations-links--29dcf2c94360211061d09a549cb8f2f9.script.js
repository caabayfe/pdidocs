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
        eventName,
        eventPayload
    } = event.payload;

    const {
        generateNavigationPayload,
        navigateToList
    } = imports['sn_instance_clone.InstanceCloneUtils']();

    var nav_payload;
    switch (eventName) {
        case 'CLONE_INSTANCES_VIEW_ALL':
            nav_payload = {
                route: 'list',
                fields: {
                    table: "instance"
                },
                params: {
                    aceNav: "clone_instance",
                    fixedFilter: "source=false",
                },
            };
            navigateToList(api, nav_payload.fields.table, nav_payload.params);
            break;

        case 'CLONE_PROFILES_VIEW_ALL':
            nav_payload = {
                route: 'list',
                fields: {
                    table: "clone_profile"
                },
                params: {
                    aceNav: "clone_profile"
                }
            };
            navigateToList(api, nav_payload.fields.table, nav_payload.params);
            break;

        // case 'MIF_INSTANCES_VIEW_ALL':
        //     homePageUtil.callUtilAPI({
        //         operation: "IS_MIF_ENABLED"
        //     }, true);
        //     break;

        // case 'MIF_SETUP_STATUS':
        //     nav_payload = {
        //         route: 'list',
        //         fields: {
        //             table: "sn_instance_clone_mif_enabled_instance"
        //         },
        //         params: {
        //             aceNav: "clone_mif_instance"
        //         }
        //     };
        //     navigateToList(api, nav_payload.fields.table, nav_payload.params);
        //     break;
    }
}
