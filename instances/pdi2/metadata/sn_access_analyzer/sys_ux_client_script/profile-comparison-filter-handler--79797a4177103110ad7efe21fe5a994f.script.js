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

    const { state } = api;
    const filter = { ...state.filter};
    var tabDef = state[state.props.tabName];

    function prepareFilterData() {
        setTooltip(false);
        var list = event.payload.list;
        if (event.payload.id != "FILTER_COMPONENT_PREPARE_LIST" || list == null || list == 0) {
            api.setState("filter", filter);
            return;
        }
        filter.disableCloseButton = true;
        var sel = 0;
        var selected = event.payload.selected;
        list.forEach(item => {
            if (selected) {
                item.selected = selected;
            }
            if (item.selected) {
                sel++;
            }
            item.visible = true;
            item.prevState = item.selected;
        });

        filter.selectedItemCount = sel;
        filter.listItem = list;
        filter.inputPlaceHolder =  api.state.translatedMessages[tabDef.name + "FilterPlaceHolder"] || tabDef.filterComponent.inputPlaceHolder;
        filter.searchInput = "";
        filter.applied = tabDef.filterComponent.filteredItemCount > 0;
        api.setState("filter", filter);
    }

    //--------------------------------------------------------------------------------//

    function filterOpenedOrClosed() {
        if (event.name == "NOW_POPOVER#CONTENT_HIDDEN") {
            if (filter.isOpen == true) {
                filter.enableApplyButton = false;
                filter.disableCloseButton = true;
                setTooltip(false);
                resetListItems();
            }
            return;
        }
        helpers.timing.setTimeout(function() {
            filter.disableCloseButton = false;
            api.setState("filter", filter);
        }, 200);
    }

    //--------------------------------------------------------------------------------//

    function filterIconClicked() {
        filter.isOpen = true;
        filter.enableApplyButton = false;
        filter.diffCount = 0;
        setTooltip(filter.isOpen);
        api.setState("filter", filter);
    }

    //--------------------------------------------------------------------------------//

    function listItemSelected() {
        var item = filter.listItem[event.context.item.index];
        item.selected = event.payload.value;
        filter.diffCount += (item.selected == item.prevState) ? -1 : 1;
        filter.selectedItemCount += (item.selected) ? 1 : -1;
        updateFilter();
    };

    //--------------------------------------------------------------------------------//

    function searchInputOnEnterKeyPressed() {
        helpers.timing.clearTimeout(state.props.timeoutId);
        state.props.timeoutId = helpers.timing.setTimeout(function() {
            var list = filter.listItem;
            var input = event.payload.fieldValue.toLowerCase();
            if (input.length == 0) {
                list.forEach(item => item.visible = true);
            } else {
                list.forEach(item => item.visible = item.name.label.toLowerCase().includes(input));
            }
            updateFilter();
        }, 700);
    }

    //--------------------------------------------------------------------------------//

    function selectListItem(isSelected) {
        var list = filter.listItem;
        var diff = filter.diffCount;
        list.forEach(item => {
            if (!item.visible) {
                return;
            }
            if ((isSelected && item.selected == false) || (!isSelected && item.selected == true)) {
                item.selected = isSelected;
                diff += (item.selected == item.prevState) ? -1 : 1;
                filter.selectedItemCount += (item.selected) ? 1 : -1;
            }

        });
        filter.diffCount = diff;
        updateFilter();
    }
    //--------------------------------------------------------------------------------//

    function applyFilter() {
        if (filter.selectedItemCount == filter.listItem.length) {
            removeFilter();
        }
        filter.isOpen = false;
        var sel = 0;

        filter.listItem.forEach(item => {
            item.prevState = item.selected;
            item.visible = true;
            if (item.selected) {
                sel++;
            }
        });
        filter.disableCloseButton = true;
        filter.selectedItemCount = sel;
        tabDef.filterComponent.filteredItemCount = sel ==  filter.listItem.length ? 0 : sel;
        filter.applied = filter.listItem.length != sel;

        getPListCtrl(tabDef).filter(row => row.selected == true);
        api.setState("filter", filter);
        closeFilter();

    }

    //--------------------------------------------------------------------------------//

    function removeFilter() {
        filter.listItem.forEach(item => {
            item.visible = true;
            item.selected = true;
            item.prevState = true;
        });
        filter.isOpen = false;
        filter.applied = false;
        tabDef.filterComponent.filteredItemCount = 0;
        filter.selectedItemCount = filter.listItem.length;
        getPListCtrl(tabDef).filter(row => row.selected == true);
        api.setState("filter", filter);
        closeFilter();
    }

    //--------------------------------------------------------------------------------//

    function updateFilter() {
        filter.enableApplyButton = filter.diffCount > 0 && filter.diffCount < filter.listItem.length && filter.selectedItemCount > 0;
        api.setState("filter", filter);
    }

    //--------------------------------------------------------------------------------//
    function getPListCtrl(tabDef) {
        return imports["sn_access_analyzer.PresentationListController"](api, helpers).getController(tabDef.name);
    }

    //--------------------------------------------------------------------------------//

    function closeFilter() {
        filter.isOpen = false;
        setTooltip(filter.isOpen);
        resetListItems();
    }

    function resetListItems() {
        api.setState("filter", filter);
        filter.listItem.forEach(item => {
            item.selected = item.prevState;
            item.visible = true;
        });
    }

    //--------------------------------------------------------------------------------//

    function setTooltip(isFilterOpen) {
        const actionText = isFilterOpen ? api.state.translatedMessages.hideFilterPanel : api.state.translatedMessages.showFilterPanel;
        const countText = getCountTextForTooltip();
        filter.tooltip = `${actionText} ${countText}`;
    }

    function getCountTextForTooltip() {
        const itemCount = tabDef.filterComponent.filteredItemCount;
        if (itemCount == 0) {
            return "";
        }
        if (itemCount == 1) {
            return `(${itemCount} ${tabDef.messages.tooltip.tabdesc.singular})`;
        }
        return `(${itemCount} ${tabDef.messages.tooltip.tabdesc.plural})`;
    }


    ({
        recordFilter: filterOpenedOrClosed,
        filterSelectAll: () => selectListItem(true),
        filterDeselectAll: () => selectListItem(false),
        searchInput: searchInputOnEnterKeyPressed,
        listItemCheckbox: listItemSelected,
        applyFilter: applyFilter,
        userAttrFilter: filterIconClicked,
        roleFilter: filterIconClicked,
        groupFilter: filterIconClicked,
        removeFilter: removeFilter,
        buttonClose: closeFilter,
        ace_action_performed: prepareFilterData
    } [event.elementId || event.name.toLowerCase()])();
}
