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
    function lazyLoad(api) {
        const {
            getLazyBlockIds
        } = imports["sn_ace.ACELazyBlocksUtil"]();
        const _lazyBlockIds = getLazyBlockIds(api.state.aceContentBlocks);
        _lazyBlockIds.forEach(blockId => {
            api.data.lazy_load.execute({
                blockId: blockId,
                pageParams: api.state.pageParams
            });
        });
    }
    const {
        eventName,
        eventPayload
    } = event.payload;
    switch (eventName) {
        case 'IAR_DROPDOWN_SELECTED':
            lazyLoad(api);
            break;
        case 'PLUGIN_CARD_NOTIFICATION':
            //lazyLoad(api);
            if (event.payload.eventPayload.status == 'Successful') {
                // api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                //     items: [{
                //         id: 'plugin_installation_success_alert',
                //         status: 'positive',
                //         icon: 'check',
                //         content: {
                //             type: "html",
                //             value: `<p> <b>` + event.payload.eventPayload.pluginName + `</b> Installation successful!.<p>`
                //         },
                //         action: {
                //             type: 'acknowledge',
                //             label: 'OK'
                //         }
                //     }]
                // });
                api.emit('NAV_ITEM_SELECTED', {
                    route: 'home',
                });
            } else {
                api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                    items: [{
                        id: 'plugin_installation_failure_alert',
                        status: 'critical',
                        icon: 'info',
                        content: {
                            type: "html",
                            value: `<p> <b>` + event.payload.eventPayload.pluginName + ` Install Failed!</b> Your installation could not complete.<p>`
                        },
                        action: {
                            type: 'dismiss'
                        }
                    }]
                });
            }
            break;
        case 'POST_INSTALL_EVENT':
            var tables = api.state.aceContentBlocks[0].children[1].props_details.iar_tables;

            if (event.payload.eventPayload.app_scope == 'sn_iar_hr') {
                tables = tables.filter(function (table) {
                        return table.id.startsWith('sn_hr');
                    });
            } else if (event.payload.eventPayload.app_scope == 'sn_itsm_va') {
                tables = tables.filter(function (table) {
                        return table.id == 'incident';
                    });
            }
            
            api.setState('iarTables', tables);
            api.setState('selected_record', tables);

            helpers.modal.open("custom_1", {});
            break;

    }
}
