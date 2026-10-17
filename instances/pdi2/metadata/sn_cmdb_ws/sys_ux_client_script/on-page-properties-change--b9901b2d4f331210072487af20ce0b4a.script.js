/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        NAVIGATION_ITEM_KEY,
        setResources,
        setAttributes
    } = imports["sn_cmdb_ws.ExploreCIUtils"](...arguments);

    const { name, value } = event.payload;
    if (name == NAVIGATION_ITEM_KEY.RESOURCES) {
        setResources(value);
    } else if (name == 'attributeSections') {
        setAttributes(value);
    } else if (name == 'selectedNav') {
        let {
            navSelectedItem,
            expandedItems,
            navItems
        } = api.state;

        let selectedItemPath = event.payload.value.item;
        if (navSelectedItem != selectedItemPath) {
            let selectedItem = event.payload.value.context;
            api.setState("navSelectedItem", selectedItemPath);

            api.setState('expandedItems', ({ currentValue }) => {
                const _currentValue = JSON.parse(JSON.stringify(currentValue));
                const _expandedItems = _currentValue.flatMap(i => i);
                if (!_expandedItems.includes(selectedItemPath[0])) { // if the item was not expanded, expand it
                    return [
                        ..._currentValue,
                        [selectedItemPath[0][0]]
                    ];
                }
            });

            api.emit("EXPLORE_CI_NAV_ITEM_SELECTED", {
                item: selectedItemPath,
                context: selectedItem
            });
        }
    }
}
