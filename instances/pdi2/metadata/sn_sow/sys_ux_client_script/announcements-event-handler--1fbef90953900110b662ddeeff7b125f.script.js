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

    const eventName = event.name;
    const elementId = event.elementId;
    const processActionPayloads = function(item, actions) {
        const fields = item.propValues.fields;
        if (item && actions && fields) {
            for (let i in actions) {
                const action = actions[i];
                if (action) {
                    const payload = action.actionPayload;
                    const actionName = action.name;
                    if ("sow_announcement_open_banner_link" == actionName) {
                        payload.url = fields.link_url.value;
                    } else if ('sow_announcement_open_outage_task' == actionName) {
                        const taskClassName = item.propValues.task_sys_class_name;
                        const taskTable = taskClassName ? taskClassName : 'task';
                        payload.table = taskTable,
                            payload.sysId = fields.task_number.value;
                        payload.sys_id = fields.task_number.value;
                    }
                }
            }
        }
    };
    if ('ANNOUNCEMENT_EVAM_ACTION' === eventName) {
        api.setState('debounceTimeoutId', ({
            currentValue
        }) => {
            let timeoutId = currentValue || null;
            if (timeoutId) {
                helpers.timing.clearTimeout(timeoutId);
            }
            timeoutId = helpers.timing.setTimeout(() => {
                api.setState('debounceTimeoutId', null);
                api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
                    event: 'Announcement Widget Clicks',
                    value: {
                        'Source Table': event.payload.table
                    }
                });
            }, 500);
            return timeoutId;
        });
        if (event.payload) {
            const table = event.payload.table;
            const sysId = event.payload.sys_id;
            const url = event.payload.url;
            const route = 'sys_ux_banner_announcement' === table ? url : 'record';
            const fields = 'sys_ux_banner_announcement' === table ? null : {
                table: table,
                sysId: sysId
            };
            let nav = null;
            if (route) {
                nav = {};
                if (route.startsWith("http")) {
                    nav.external = {
                        url: route
                    }
                } else {
                    nav.route = route;
                    if (fields) {
                        nav.fields = fields;
                    }
                }
            }
            if (nav) {
                api.emit('NAV_ITEM_SELECTED', nav);
            }
        }
    } else if ('look_up_user_preferences_1' === elementId) {
        if ("DATA_FETCH_SUCCEEDED" === eventName) {
            if (api.state.gridViewSelected == true) {
                api.setState('announcementsPageSize', 1);
            }
        }
    } else if ("announcements_data_set" === elementId && "NOW_DATA_SET#PAGINATION_BUTTON_CLICKED" === eventName) {
        if (event.payload.pageCursor) {
            api.setState('announcementsPageCursor', () => event.payload.pageCursor);
        }
        if (event.payload.pageNumber) {
            if (event.payload.pageCursor && (event.payload.pageCursor === "init")) {
                api.setState('announcementsPageNumber', () => 1);
            } else {
                api.setState('announcementsPageNumber', () => event.payload.pageNumber);
            }
        }
    } else if ("sow_announcement_fetch_and_transform__1" === elementId) {
        if ("DATA_FETCH_SUCCEEDED" === eventName) {
            const payload = api.data.sow_announcement_fetch_and_transform__1.announcementTransform;
            // Because EVAM seems to only return display values we need to substitute the corrrect payloads in
            // for the actions if present
            if (payload) {
                const items = payload.items;
                if (items) {
                    for (let i in items) {
                        const item = items[0];
                        processActionPayloads(item, item.propValues.mainActions);
                        processActionPayloads(item, item.propValues.overflowActions);
                        processActionPayloads(item, [item.propValues.clickAction]);
                    }
                }
                if (api.state.gridViewSelected == false) {
                    api.setState('listViewData', payload.items);
                }
                api.setState('announcementsData', payload);
                const showAnnouncements = payload && payload.items && payload.items.length > 0;
                api.emit('SHOW_ANNOUNCEMENT', {
                    'value': showAnnouncements
                });
            }
            api.setState('announcementsDataSetLoading', false);
        } else {
            api.setState('announcementsDataSetLoading', true);
        }
    }
}
