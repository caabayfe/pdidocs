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


    const filter = {
        ...api.state.filter
    };
    const listItems = api.state.listItems;
    const translatedMessage = api.state.translatedMessage;

    function pageReadyHandler() {
        let style = Object.assign({
            height: "16",
            width: "16"
        }, api.context.props.listStyle);

        style.width += "rem";
        style.height = (parseInt(style.height) - 8.375) + 'rem';
        api.setState("style", style);
        prepareData(api.context.props.listItems);
        helpers.translate("Show filter").then(label => translatedMessage.showFilter = label);
        helpers.translate("Hide filter").then(label => translatedMessage.hideFilter = label);
    }


    function prepareData(listItems) {
        listItems = listItems || [];
        if (listItems.length > 0) {
            var sel = 0;
            let li = [];
            listItems.forEach(item => {
                if (item.selected) {
                    sel++;
                }
                li.push({
                    ...item,
                    prevState: item.selected,
                    defaultState: item.selected
                });
            });
            api.setState("listItems", li);
        }

        filter.selectedItemCount = sel;
        filter.badgeCount = sel;
        filter.searchInput = "";
        filter.applied = false;
        api.setState("filter", filter);
        setTooltip(false);
    }

    function propertyChangeHandler() {
        let value = event.payload.value;
        if (!value)
            return;
        switch (event.payload.name) {
            case "listItems":
                prepareData(value);
                break;
        }
    }

    function openFilter() {
        filter.opened = true;
        filter.enableApplyButton = false;
        filter.diffCount = 0;
        setTooltip(true);
        api.setState("filter", filter);
    }

    function applyFilter() {
        var sel = 0;

        listItems.forEach(item => {
            item.prevState = item.selected;
            if (item.selected) {
                sel++;
            }
        });

        filter.selectedItemCount = sel;
        filter.badgeCount = sel;
        filter.applied = true;
        closeFilter();
        _raiseEvent({
            action: 'applyFilter',
            filteredList: listItems
        });
    }

    function closeFilter() {
        filter.opened = false;
        setTooltip(true);
        api.setState("filter", filter);
    }

    function listItemSelected() {
        var item = listItems[event.context.item.index];
        item.selected = event.payload.value;
        filter.diffCount += (item.selected === item.prevState) ? -1 : 1;
        filter.selectedItemCount += (item.selected) ? 1 : -1;
        updateFilter();
    };


    function selectAll(isSelected) {
        var diff = filter.diffCount;
        listItems.forEach(item => {
            if ((isSelected && item.selected === false) || (!isSelected && item.selected === true)) {
                item.selected = isSelected;
                diff += (item.selected === item.prevState) ? -1 : 1;
                filter.selectedItemCount += (item.selected) ? 1 : -1;
            }

        });
        filter.diffCount = diff;
        updateFilter();
    }


    function updateFilter() {
        filter.enableApplyButton = filter.diffCount > 0 && filter.diffCount <= listItems.length && filter.selectedItemCount > 0;
        api.setState("filter", filter);
    }

    function resetListItems(key) {
        let li = [...listItems];
        let selected = 0;
        li.forEach(item => {
            item.selected = item[key];
            item.prevState = item.selected;
            if (item.selected) {
                selected++;
            }
        });
        filter.selectedItemCount = selected;
        filter.badgeCount = selected;
        api.setState("filter", filter);
        api.setState("listItems", li);
    }

    function popoverVisibleOrHiddenHandler() {
        switch (event.name) {
            case "NOW_POPOVER#CONTENT_VISIBLE":
                break;
            case "NOW_POPOVER#CONTENT_HIDDEN":
                filter.enableApplyButton = false;
                setTooltip(false);
                api.setState("filter", filter);
                resetListItems('prevState');
        }
    }

    function setTooltip(isFilterOpen) {
        filter.tooltip = isFilterOpen ? translatedMessage.hideFilter : translatedMessage.showFilter;
    }

    function removeFilter() {
        filter.applied = false;
        resetListItems('defaultState');
        closeFilter();
        _raiseEvent({
            action: 'removeFilter'
        });
    }

    function _raiseEvent(payload) {
        payload.ts = Date.now();
        helpers.navigate.setRouteParams({
            params: {
                payload: payload
            }
        });
    }

    const fnMap = {
        MACROPONENT_READY: pageReadyHandler,
        MACROPONENT_PROPERTY_CHANGED: propertyChangeHandler,
        btnFilter: openFilter,
        applyFilter: applyFilter,
        listItemCheckbox: listItemSelected,
        recordFilter: popoverVisibleOrHiddenHandler,
        filterSelectAll: () => selectAll(true),
        filterDeselectAll: () => selectAll(false),
        buttonClose: closeFilter,
        removeFilter: removeFilter
    };

    const fn = fnMap[event.name] || fnMap[event.elementId];
    if (fn)
        fn();
}
