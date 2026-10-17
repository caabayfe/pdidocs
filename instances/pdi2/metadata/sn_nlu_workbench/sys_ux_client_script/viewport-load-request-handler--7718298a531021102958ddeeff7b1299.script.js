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

    let payload = event.name == 'MACROPONENT_PROPERTY_CHANGED' ? event.payload.value : api.context.props.payload;
    if (!payload) {
        // Adding dummy value for type in case its undefined to avoid type errors in console
        payload = {type : '123'};
    }
    let route = payload.type.route;
    let params = {};

    function renameTypeKey(payload, oldKey, newKey) {
        const {
            [oldKey]: replaceByKey, ...rest
        } = payload;
        return {
            ...rest,
            [newKey]: replaceByKey
        };
    }
    switch (route) {
        case 'ace-tab-set':
            const tabsetPayload = {
                'items': [],
                'contents': []
            };
            payload.children = payload.children.slice(0, 15); //hard check to allow 15 tabs only
            payload.children.forEach((item, index) => {
                tabsetPayload.items.push({
                    'icon': item.props_details.icon,
                    'id': 'ace_tab_id_' + index,
                    'label': item.props_details.tab_label || null,
                    'order': index,
                    'type': 'local',
                });
                item.isRoot = true;
                tabsetPayload.contents.push(item);
            });
            params = {
                payload: tabsetPayload
            };
            break;
        case 'dynamic-container':
            {
                const config = renameTypeKey(payload, 'type', 'ctype');

                let columns = config.props_details.columns; // Ex: string in the format "66,34" (or) "25,25,25,25" (or) "70,30" (percentages)
                const children = config.children || [];
                if (!columns) {
                    columns = '100'; // one-col default
                }
                let colParts = [];
                try {
                    colParts = columns.split(',').map(i => Math.round(i));
                    const sum = colParts.reduce((a, b) => a + b, 0);
                    if (sum < 100) {
                        colParts.push(100 - sum); // pad with dummy area
                    }
                } catch (e) {
                    console.error('Unable to parse columns', e);
                }
                const dynamicItems = children.map((item, i) => ({
                    payload: item,
                    colSize: `${colParts[i % colParts.length]}`
                }));

                params = {
                    payload: {
                        ...config,
                        children: dynamicItems
                    }
                };
                break;
            }
        case 'line':
            {
                route = 'time-series-charts';
                break;
            }

        case 'plugin-install-card':
            {
                if (payload.props_details.action == 'update') {
                    route = 'plugin-update-card';
                }
            }
    }

    if (route) {
        api.emit('MACROPONENT_VIEWPORT_LOAD_REQUESTED', {
            viewportElementId: 'viewport_anb',
            route: route,
            params: (Object.keys(params).length > 0) ? params : {
                payload: renameTypeKey(payload, 'type', 'ctype')
            }
        });
    }
}
