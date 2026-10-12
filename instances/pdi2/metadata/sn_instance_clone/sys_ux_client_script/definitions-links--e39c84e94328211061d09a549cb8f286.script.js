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
        case 'EXCLUSIONS_VIEW_ALL':
            nav_payload = {
                route: 'list',
                fields: {
                    table: "clone_data_exclude"
                },
                params: {             
                    aceNav:"clone_data_exclude"
                }
            };
            navigateToList(api, nav_payload.fields.table, nav_payload.params);
            break;
        case 'CLEANUP_SCRIPTS_VIEW_ALL':
            nav_payload = {
                route: 'list',
                fields: {
                    table: "clone_cleanup_script"
                },
                params: {                  
                    aceNav:"clone_cleanup_script"
                }
            };
            navigateToList(api, nav_payload.fields.table, nav_payload.params);
            break;

        case 'PRESERVERS_VIEW_ALL':
            nav_payload = {
                route: 'list',
                fields: {
                    table: "clone_data_preserver"
                },
                params: {           
                    aceNav:"clone_data_preserver"
                }
            };
            navigateToList(api, nav_payload.fields.table, nav_payload.params);
            break;
    }
}
