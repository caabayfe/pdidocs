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

    const payload = event.payload.value;
    let route = payload.type.route;
    let params = {};

    function getChecklistCardItems(payload) {
        const formatProgressBar = function(items) {
            if (!items.length) return [];
            return items.map(function(item) {
                return {
                    "icon": item.props_details.header_icon,
                    "title": item.title,
                    "status": item.status && item.status.toLowerCase() || "start",
                    "children": formatProgressBar(item.children)
                };
            });
        };

        const checklistItems = formatProgressBar(payload.children);
        checklistItems.forEach(function(item) {
            const numOfCompletedItems = item.children.filter(function(item) {
                return item.status == 'complete';
            }).length;
            const totalItems = item.children.length;
            item.percentage = totalItems ? (numOfCompletedItems / totalItems) * 100 : 0;
        });
        return checklistItems;
    }

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
        case 'checklist-card':
            {
                params = {
                    payload: getChecklistCardItems(payload)
                };
                break;
            }

        case 'area': //fall through
        case 'line': //fall through  
        case 'scatter': //fall through  
        case 'spline': //fall through  
        case 'step': //fall through
        case 'column':{
            route = 'time-series-charts';
            break;
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
