function include({imports}) {
        const handleNavigation = (api, event, helpers) => {
            let table;
            let sysId;
            let url;
            const actionRoute = {
                kb_knowledge: 'kb_view'
            };
            const action = event.payload.action;
            if (action && action.actionDispatch && (action.actionDispatch === 'NAVIGATION' || action.actionDispatch === 'NAVIGATION_TO_PARENT_RECORD')) {
                table = action.actionPayload.table;
                sysId = action.actionPayload.sysId;
                url = action.actionPayload.url;
            } else if (event.payload.actionPayload) {
                table = event.payload.actionPayload.table;
                sysId = event.payload.actionPayload.sysId;
                url = event.payload.actionPayload.url;
            } else if (event.payload) {
                table = event.payload.table;
                sysId = event.payload.sysId;
                url = event.payload.url;
            }
            if (url) {
                api.emit('NAV_ITEM_SELECTED', {
                    "route": "",
                    "fields": null,
                    "params": null,
                    "redirect": "",
                    "passiveNavigation": "",
                    "title": "",
                    "targetRoute": "",
                    "multiInstField": "",
                    "external": {
                        url
                    },
                });
                return;
            }
            if (table && sysId) {
                if (!(table in actionRoute)) {
                    api.emit('NAV_ITEM_SELECTED', {
                    route: "record",
                    fields: {
                        table,
                        sysId
                     }
                    });
                } else {
                     helpers.navigate.to(actionRoute[table], {
                        table,
                        sysId,
                        }, {},
                        false,
                        false
                    );
                }
                return;
            }
         }

         const SEARCH_CONSTANTS = {
            GLOBAL_SEARCH_VIEW_CONFIG_ID: "fcb22ff12b9622106fdfff32f291bff7"
         }

         const handlePageNavigation = (helpers, route, fields, params, redirect = false, passiveNavigation = false, targetRoute) => {
             helpers.navigate.to(route, fields, params, redirect, passiveNavigation, targetRoute);
         }

         return {
            handleNavigation: handleNavigation,
            SEARCH_CONSTANTS: SEARCH_CONSTANTS,
            handlePageNavigation: handlePageNavigation
         };
 }
