/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        findNavItemByPath
    } = imports["sn_cmdb_ws.ExploreCIUtils"](...arguments);
    const {
        value: selectedItemPath
    } = event.payload || {};

    if (selectedItemPath && selectedItemPath.length === 1) {
        let selectedItem = findNavItemByPath(api.state.navItems, event.payload.value[0]);
        if (selectedItem && selectedItem.children && selectedItem.children.length > 0) { // if the selected item has nested children, expand/collapse the selection
            api.setState('expandedItems', ({ currentValue }) => {
                const _currentValue = JSON.parse(JSON.stringify(currentValue));
                const _expandedItems = _currentValue.flatMap(i => i);
                if (_expandedItems.includes(selectedItem.id)) { // if the item was expanded, collapse the item
                    return _currentValue.filter(c => {
                        return c[0] !== selectedItem.id;
                    });
                } else { // otherwise expand the item
                    return [
                        ..._currentValue,
                        [selectedItem.id]
                    ];
                }
            });
        } else {
            api.setState("navSelectedItem", selectedItemPath);
            api.emit("EXPLORE_CI_NAV_ITEM_SELECTED", {
                item: selectedItemPath,
                context: selectedItem
            });
        }
    }
}
