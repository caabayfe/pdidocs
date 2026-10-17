function script({
    api,
    event,
    imports
}) {
    const {
        table,
        currentPage,
        query,
        groupByColumn,
        columns,
        view,
        listTitle,
        featureFlags,
        requestId,
        appendRows = false,
        rowLimit,
        fixedQuery,
        maxColumns,
        hideLoader = false,
        fromButton = false,
        ignoreColumnPreferences = false,
        infiniteCurrentPage,
        refreshRequested = false,
        listId,
        listInstanceId,
        listTargetTable,
        menuItems,
        menuLoaded,
        menuClickFromBrowserNav,
        pageId,
        childQuery,
        currentPageForChild,
        fetchHighlightedValues
    } = event.payload;
    
    // Ignore empty payloads to preserve requestMetadata
    if (!Object.keys(event.payload).length) return;
    
    const enableInfiniteScroll = api?.state?.featureFlags?.enableInfiniteScroll
      || featureFlags?.enableInfiniteScroll
      || api?.state?.enableInfiniteScroll;
    const setListColumnsTarget = (listId) => {
        const { listColumnsTarget } = api.state;

        if (typeof listTargetTable !== 'undefined') {
            if (listColumnsTarget !== listTargetTable)
                api.setState('listColumnsTarget', listTargetTable);
            return;
        }

        const menuItem = menuItems?.[listId];
        if (menuItem?.targetTable === 'sys_ux_my_list' && menuItem.columns) {
            if (listColumnsTarget !== 'sys_ux_my_list')
                api.setState('listColumnsTarget', 'sys_ux_my_list');
        }
        else if (menuItem?.columns) {
            if (listColumnsTarget !== 'sys_user_preference')
                api.setState('listColumnsTarget', 'sys_user_preference');
        }
        else if (listColumnsTarget !== 'sys_ui_list')
            api.setState('listColumnsTarget', 'sys_ui_list');
    };

    //certain inputs will need to be set everytime to ensure it resets to default
    api.setState('ignoreColumnPreferences', ignoreColumnPreferences);
    api.setState('hideLoader', hideLoader);
    if (typeof menuLoaded !== 'undefined') {
        api.setState('menuLoaded', menuLoaded);
    }
    if (typeof rowLimit !== 'undefined') {
        api.setState('rowLimit', parseInt(rowLimit));
    }
    if (typeof childQuery !== 'undefined') {
        api.setState('childQuery', childQuery);
    }
    if (typeof currentPageForChild !== 'undefined') {
        api.setState('currentPageForChild', currentPageForChild);
    }
    if (typeof featureFlags !== 'undefined') {
        api.setState('featureFlags', featureFlags);
    }    
    if (typeof fixedQuery !== 'undefined') {
        api.setState('fixedQuery', fixedQuery);
    }
    if (typeof groupByColumn !== 'undefined') {
        api.setState('groupBy', groupByColumn);
    }    
    if (typeof columns !== 'undefined') {
        api.setState('columns', columns);
    }
    if (typeof table !== 'undefined') {
        api.setState('table', table);
    }
    if (typeof fetchHighlightedValues !== 'undefined') {
        api.setState('fetchHighlightedValues', fetchHighlightedValues);
    }    

    // temporary fix for persistence issue. we'll need to refactor this once persistence has a
    // interceptor for state updates. this case handles when a user navigates back/forward in the browser
    // to a query = "". this empty state doesnt not get passed into the state update.
    if (query === undefined && api?.state?.query !== undefined && enableInfiniteScroll) {
        api.setState('infiniteQuery', api?.state?.query);
    }

    if (typeof query !== 'undefined') {
        api.setState('query', query);
        // infiniteQuery is needed to handle state_persistence back and next navigation button edge case
        api.setState('infiniteQuery', query);
    }

    if (typeof currentPage !== 'undefined') {
        if(enableInfiniteScroll) {
          api.setState('infiniteCurrentPage', currentPage);
        } else {
          api.setState('currentPage', currentPage);
        }
    }

    if (typeof maxColumns !== 'undefined') {
        api.setState('columnLimit', parseInt(maxColumns));
    }
    if (typeof view !== 'undefined') {
        api.setState('view', view);
    }
    if (typeof listInstanceId !== 'undefined') {
        api.setState('listInstanceId', listInstanceId);
    }
    if (typeof pageId !== 'undefined') {
        api.setState('pageId', pageId);
    }
    
    if (typeof listId !== 'undefined') {
        if(listId !== api.state.listId) {
            api.setState('aiGroupInfo',{});
            //update url only if listId change is more menu_item_click
            if (!menuClickFromBrowserNav) {
                api.emit('LIST_CTRL#SELECTED_LIST_UPDATED', { listId });
                api.setState('listIdUpdateFromMenuClick', true, false);
            }
            // if the listId is different from the current one, reset the infiniteCurrentPage to 0
            if(enableInfiniteScroll) {
              api.setState('infiniteCurrentPage', 0);
            }
            setListColumnsTarget(listId);
            api.setState('listId', listId);
            // api.state.listId is undefined when listTemplate initially loads. When user using bottom arrow navigation button
            // in the form reaches bottom of first page, currentPage is then iterated to the 1 and
            // listId !== api.state.listId condition is true, while currentPage becomes 1.
            if(api.state.listId == undefined) {
              api.setState('currentPage', (currentPage || 0)); // do this preemptively or pagination component will dispatch set page to 0 and trigger another fetch
            } else {
                // in all cases where listId and api.state.listId are not undefined, currentPage is set to 0
                // Check if currentPage is in the URL, if not set it to 0
                const currentPageInURL = api.context.props.nowUxfPersistedState?._?.currentPage;
                api.setState('currentPage', currentPageInURL || 0);
            }
        }
        else if (!api.state.listColumnsTarget)
            setListColumnsTarget(listId);
    }
    //metadata needs to be redetermined for all fetches
    api.setState('requestMetadata', {
        fromButton,
        hideLoader,
        refreshRequested,
        requestId,
        appendRows,
    });       
}
