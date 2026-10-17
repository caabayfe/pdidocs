/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { CONSTANTS: STREAM_TYPE_UP, STREAM_TYPE_DOWN } = imports['sn_cmdb_ws.CiRelationshipViewUtils'](...arguments);
    const { elementId, payload: { value } } = event;
    const { ciToRelCache } = api.state;
    let latestItem = value[value.length - 1];
    
    // Extract ciSysId from the string format `${relationTypeSysId}-${ciSysId}`
    // Also handles the case where the string might directly be a sysId without a dash
    let itemValue = latestItem[latestItem.length - 1];
    let sysId = '';
    
    if (itemValue && typeof itemValue === 'string') {
        const dashIndex = itemValue.indexOf('-');
        if (dashIndex !== -1 && dashIndex < itemValue.length - 1) {
            // Format is "${relationshipTypeSysId}-{ciSysId}"
            sysId = itemValue.substring(dashIndex + 1);
        } else if (itemValue.trim() !== '') {
            // If no dash is found and string is not empty, assume it's a direct sysId
            sysId = itemValue;
        }
    }
    
    // If we found a sysId and we don't have its relationships in the cache, trigger fetch
    if (sysId && !ciToRelCache.hasOwnProperty(sysId))
        api.setState('ciSysId', sysId);
    let direction;
    if (elementId == 'tree_view_downstream') {
        direction = STREAM_TYPE_DOWN;
    } else if (elementId == 'tree_view_upstream') {
        direction = STREAM_TYPE_UP;
    }

    api.setState('treeContents', ({currentValue}) => {
        return {
            ...currentValue,
            [direction]: {
                ...currentValue[direction],
                expandedItems: value
            }
        };
    });
}
