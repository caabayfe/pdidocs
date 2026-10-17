function transform(input) {
    try {
        var listMenuData = input.listMenuGraphqlData.data.GlideUxListMenuLayout_Query.getListMenuLayout.listMenu;

        var listTreeContent = [];
        var myListTreeContent = [];
        var expandedItems = [];
        var listMenuItems = {}; // key value pairs of all list menu items for easy access in state when reacting to actions in controller
        var MY_LIST_ID = "my_lists";
        var MY_LIST_SHARED_ID = "shared_lists";
        var MY_LIST_OPENED_BY_LINK_ID = 'lists_opened_by_link';
        var selectedListMenuItem = listMenuData.selectedListMenuItem || {};
        var selectedTabId = listMenuData.selectedListMenuItem ? listMenuData.selectedListMenuItem.targetTable : 'sys_ux_list';

        var isExternalUser = gs.getUser().getUserRoles().includes('snc_external');

        function mapOldFlagsToNewFlags(flags, menuItem) {
            var wrapCellContent;
            if (flags.overrideWordWrapUserPref) {
                wrapCellContent = flags.wordWrap ? "wrapOn" : "wrapOff";
            } else {
                wrapCellContent = "useLineBreaksUserPref";
            }

            var fetchHighlightedValues = flags.hideHighlightedValues === false;
            if (menuItem.runHighlightedValuesQuery === null) {
                fetchHighlightedValues = flags.hideHighlightedValues === false;
            } else {
                fetchHighlightedValues = menuItem.runHighlightedValuesQuery;
            }

            return {
                enableCellEditing: flags.hideInlineEditing !== true,
                enableCellFiltering: flags.hideCellFilter !== true,
                enableColumnFiltering: flags.hideColumnFiltering !== true,
                enableColumnGrouping: flags.hideColumnGrouping !== true,
                enableColumnResizing: flags.hideColumnResizing !== true,
                enableColumnSorting: flags.hideColumnSorting !== true,
                enableDeclarativeActions: flags.hideListActions !== true,
                enableEmptyStateImage: flags.hideEmptyStateImage !== true,
                enableHighlightContent: flags.hideHighlightContent !== true,
                enableLinks: flags.hideLinks !== true,
                enableQuickEdit: flags.hideQuickEdit !== true,
                enableReferenceLinks: flags.hideReferenceLinks !== true,
                enableRowSelector: flags.hideRowSelector !== true,
                enableRowDragDrop: flags.hideDragAndDrop !== true,
                enableSelectAll: flags.hideSelectAll !== true,
                fetchHighlightedValues: fetchHighlightedValues,
                highlightContent: flags.highlightContent,
                maxCharacters: flags.maxCharacters,
                onlyEnableSelectionWhenRequiredByActions: true, // menu items cant set this, value is always true,
                showTitle: flags.hideTitle !== true,
                showColumnPersonalization: flags.hidePersonalization !== true,
                showRecordCountBadge: flags.hideRecordCountBadge !== true,
                showSubtitle: flags.hideLastRefreshedText !== true,
                showRefreshButton: flags.hideRefreshButton !== true,
                showHeader: flags.hideHeader !== true,
                showFilterButton: flags.hidePanelButton !== true,
                showPagination: flags.hidePagination !== true,
                showPages: flags.hidePages !== true,
                showRange: flags.hideRange !== true,
                showPreviousPage: flags.hidePreviousPage !== true,
                showNextPage: flags.hideNextPage !== true,
                showFirstPage: flags.hideFirstPage !== true,
                showLastPage: flags.hideLastPage !== true,
                showRowsPerPageSelector: flags.hideRowsPerPageSelector !== true,
                showRowCount: flags.hideRowCount !== true,
                wrapCellContent: wrapCellContent
            };
        }

        function transformMenuItem(menuItem) {
            menuItem.featureFlags = mapOldFlagsToNewFlags(menuItem.featureFlags || {}, menuItem);
            var groupBy = menuItem.groupByColumn;
            menuItem.query = (menuItem.conditions || '') + (groupBy ? '^GROUPBY' + groupBy : '');
        }

        listMenuData.categoryItems.forEach(function(category, index, arr) {
            if (category.children.length == 0) return;

            if (category.isExpanded) expandedItems.push([category.id]);

            var children = [];


            category.children.forEach(function(child) {
                if (Object.keys(selectedListMenuItem).length > 0 && selectedListMenuItem.id === child.id) {
                    var actions = [];
                    if (!isExternalUser) {
                        actions.push({
                            icon: 'ellipsis-vertical-fill',
                            label: 'Menu item actions',
                            clickActionType: 'NOW_LIST_MENU#SHOW_ACTION_OPTIONS'
                        });
                    }
                    children.push({
                        id: child.id,
                        label: child.displayValue,
                        actions: actions,
                    });
                } else {
                    children.push({
                        id: child.id,
                        label: child.displayValue
                    });
                }
                transformMenuItem(child);
                listMenuItems[child.id] = child;
            });

            listTreeContent.push({
                id: category.id,
                label: category.displayValue,
                actionable: false,
                children: children
            });

        });

        if (!isExternalUser) {
            myListTreeContent.push({
                id: MY_LIST_ID,
                label: sn_i18n.Message.getMessage('sn_now_list_common', 'Created by me'),
                actionable: false,
                disableDrag: true,
                disableDrop: true,
                children: listMenuData.menuItems.filter(menuItem => !menuItem.openedByLink).map(function(child) {
                    child.selectionPath.unshift(MY_LIST_ID);
                    var statuses = [];

                    if (child.sharedUsers.length > 0 || child.sharedGroups.length > 0) {
                        statuses.push({
                            "type": "icon",
                            "icon": "group-outline",
                        })
                    }
                    let content = {
                        id: child.id,
                        label: child.displayValue,
                        statuses: statuses // We should include statuses even if not current selected list
                    };

                    if (selectedListMenuItem && selectedListMenuItem.id === child.id) {
                        selectedListMenuItem.selectionPath.unshift(MY_LIST_ID);
                        content.actions = [{
                            icon: 'ellipsis-vertical-fill',
                            label: 'Menu item actions',
                            clickActionType: 'NOW_LIST_MENU#SHOW_ACTION_OPTIONS'
                        }];
                    }

                    transformMenuItem(child);
                    listMenuItems[child.id] = child;
                    return content;
                })
            });
            myListTreeContent.push({
                id: MY_LIST_SHARED_ID,
                label: gs.getMessage("Shared with me"),
                actionable: false,
                disableDrag: true,
                disableDrop: true,
                children: listMenuData.sharedMenuItems.map(function(menuItem) {
                    let content = {
                        id: menuItem.id,
                        label: menuItem.displayValue,
                    }
                    menuItem.selectionPath.unshift(MY_LIST_SHARED_ID);
                    transformMenuItem(menuItem);
                    listMenuItems[menuItem.id] = menuItem;
                    // if selectedItem is shared item, append shared id to selection path
                    if (selectedListMenuItem && selectedListMenuItem.id === menuItem.id) {
                        selectedListMenuItem.selectionPath.unshift(MY_LIST_SHARED_ID);
                        content.actions = [{
                            icon: 'ellipsis-vertical-fill',
                            label: 'Menu item actions',
                            clickActionType: 'NOW_LIST_MENU#SHOW_ACTION_OPTIONS'
                        }];
                    }
                    return content;
                })
            });

            myListTreeContent.push({
                id: MY_LIST_OPENED_BY_LINK_ID,
                label: gs.getMessage("Opened by link"),
                actionable: false,
                disableDrag: true,
                disableDrop: true,
                children: listMenuData.menuItems.filter(menuItem => menuItem.openedByLink).map(function(menuItem) {
                    let content = {
                        id: menuItem.id,
                        label: menuItem.displayValue,
                    }
                    menuItem.selectionPath.unshift(MY_LIST_OPENED_BY_LINK_ID);
                    transformMenuItem(menuItem);
                    listMenuItems[menuItem.id] = menuItem;
                    // if selectedItem is opened by link, append id to the selection path
                    if (selectedListMenuItem && selectedListMenuItem.id === menuItem.id) {
                        selectedListMenuItem.selectionPath.unshift(MY_LIST_OPENED_BY_LINK_ID);
                        content.actions = [{
                                icon: 'ellipsis-vertical-fill',
                                label: 'Menu item actions',
                                clickActionType: 'NOW_LIST_MENU#SHOW_ACTION_OPTIONS'
                        }];
                    }
                    return content;
                })
            });

            if (Object.keys(selectedListMenuItem).length > 0) {
                selectedListMenuItem["actionItems"] = [];
                selectedListMenuItem["actionItems"].push({
                    id: "save_a_copy",
                    label: gs.getMessage("Save a copy")
                });

                if (
                    selectedTabId == 'sys_ux_my_list' &&
                    (
                        selectedListMenuItem.selectionPath.indexOf(MY_LIST_SHARED_ID) == -1 ||
                        selectedListMenuItem.selectionPath.indexOf(MY_LIST_OPENED_BY_LINK_ID) == -1
                    )
                ) {
                    selectedListMenuItem["actionItems"].push({
                        id: "rename",
                        label: gs.getMessage("Rename")
                    }, {
                        id: "share",
                        label: gs.getMessage("Share")
                    }, {
                        id: "delete",
                        label: gs.getMessage("Delete")
                    });
                }
            }
        }

        transformMenuItem(selectedListMenuItem);
        var myListExpandedItems = myListTreeContent.map(listTreeContent => [listTreeContent.id]);
        expandedItems.push(...myListExpandedItems);

        var tabs = [{
            label: gs.getMessage("Default lists"),
            treeContent: listTreeContent,
            tabActions: [],
            reorderable: false,
            id: 'sys_ux_list',
            emptyStateConfig: {
                title: gs.getMessage("No lists available"),
                content: gs.getMessage("You can request list access from your admin."),
            }
        }];

        if (!isExternalUser) {
            tabs.push({
                label: gs.getMessage("My lists"),
                treeContent: myListTreeContent,
                tabActions: [{
                    key: "create-new-list",
                    label: gs.getMessage("Create new list")
                }],
                reorderable: true,
                id: 'sys_ux_my_list',
                emptyStateConfig: {
                    title: gs.getMessage("No custom lists yet"),
                    content: gs.getMessage("Select Create new list to get started."),
                }
            });
        }

        var result = {
            // Array of tabs. Each with a label, tree content in the form that content tree expects
            tabs: tabs,
            // Current selected list menu item
            expandedItems: expandedItems,
            selectedListMenuItem: selectedListMenuItem,
            featureFlags: selectedListMenuItem.featureFlags,
            selectedTabId: selectedTabId,
            menuItems: listMenuItems,
            loading: false,
            canUserAccessList: listMenuData.canUserAccessList,
            isListIdValid: listMenuData.isListIdValid,
            listOwner: listMenuData.listOwner,
        };

        return result;
    } catch (error) {
        throw new Error("List menu controller data broker transform error: " + error.message);
    }
}
