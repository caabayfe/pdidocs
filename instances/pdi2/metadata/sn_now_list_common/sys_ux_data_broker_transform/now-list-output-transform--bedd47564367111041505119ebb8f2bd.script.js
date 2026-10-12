function transform(input) {
	const isLoggedIn = gs.isLoggedIn();
	var isExternalUser = gs.getUser().getRoles().includes('snc_external');
	const exportActionDispatch = 'DA#EXPORT_MODAL';
	var aiListConfig = {};
	try {
		aiListConfig = JSON.parse(input.aiListConfig) || {};
	} catch (e) {
		gs.warn('Now List Output Transform: Failed to parse aiListConfig. ' + e.message);
	}

	//support for Catalog Variables EPIC1037618
	const isCatVarField = (fieldName) => fieldName?.startsWith('variables.');
	const isLookupCatVarTypeId = (typeId) => '18' == typeId || '22' == typeId;
	const getCatVarSysId = (fieldName) => isCatVarField(fieldName) && fieldName?.replace('variables.', '');

	function menuTransform(input) {
		try {
			const {
				listMenuLayout,
			} = input?.graphqlData?.data?.GlideNowListLayoutComposite_Query?.getNowListLayoutComposite || {};

			if (!listMenuLayout) return null;

			var listMenuData = listMenuLayout.listMenu;
			var listTreeContent = [];
			var myListTreeContent = [];
			var expandedItems = [];
			var listMenuItems = {}; // key value pairs of all list menu items for easy access in state when reacting to actions in controller
			var MY_LIST_ID = 'my_lists';
			var MY_LIST_SHARED_ID = 'shared_lists';
			var MY_LIST_OPENED_BY_LINK_ID = 'lists_opened_by_link';
			var selectedListMenuItem = listMenuData.selectedListMenuItem || {};
			var selectedTabId = listMenuData.selectedListMenuItem
				? listMenuData.selectedListMenuItem.targetTable
				: 'sys_ux_list';

			// Ensures list creation is enabled unless explicitly set to false.
			const isListCreationEnabled = input.showListCreation !== false;

			function mapOldFlagsToNewFlags(flags, menuItem) {
				var wrapCellContent;
				if (flags.overrideWordWrapUserPref) {
					wrapCellContent = flags.wordWrap ? 'wrapOn' : 'wrapOff';
				} else {
					wrapCellContent = 'useLineBreaksUserPref';
				}
				var fetchHighlightedValues =
					flags.hideHighlightedValues === false;

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
					showColumnPersonalization:
						flags.hidePersonalization !== true,
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
					showRowsPerPageSelector:
						flags.hideRowsPerPageSelector !== true,
					showRowCount: flags.hideRowCount !== true,
					wrapCellContent: wrapCellContent,
					liveUpdatesForListMenu: flags.liveUpdates,
					enableInfiniteScroll: flags.enableInfiniteScroll,
					showFilterOverview: flags.showFilterOverview,
					enableColumnCalculations: flags.enableColumnCalculations,
					enableRelatedHierarchy: flags.enableRelatedHierarchy,
				};
			}

			function transformMenuItem(menuItem) {
				menuItem.featureFlags = mapOldFlagsToNewFlags(
					menuItem.featureFlags || {},
					menuItem
				);
				var groupBy = menuItem.groupByColumn;
				menuItem.query =
					(menuItem.conditions || '') +
					(groupBy ? '^GROUPBY' + groupBy : '');
			}

			listMenuData.categoryItems.forEach(function (category, index, arr) {
				if (category.children.length == 0) return;
				if (category.isExpanded) expandedItems.push([category.id]);
				var children = [];
				category.children.forEach(function (child) {
					if (
						Object.keys(selectedListMenuItem).length > 0 &&
						selectedListMenuItem.id === child.id
					) {
						var actions = [];
						if (!isExternalUser && isListCreationEnabled) {
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
							label: child.displayValue,
						});
					}
					transformMenuItem(child);
					listMenuItems[child.id] = child;
				});
				listTreeContent.push({
					id: category.id,
					label: category.displayValue,
					actionable: false,
					children: children,
				});
			});

			if (!isExternalUser) {
				myListTreeContent.push({
					id: MY_LIST_ID,
					label: sn_i18n.Message.getMessage('sn_now_list_common', 'Created by me'),
					actionable: false,
					disableDrag: true,
					disableDrop: true,
					children: listMenuData.menuItems.filter(menuItem => !menuItem.openedByLink).map(function (child) {
						child.selectionPath.unshift(MY_LIST_ID);
						var statuses = [];
						if (
							child.sharedUsers.length > 0 ||
							child.sharedGroups.length > 0
						) {
							statuses.push({
								type: 'icon',
								icon: 'group-outline',
							});
						}
						let content = {
							id: child.id,
							label: child.displayValue,
							statuses: statuses, // We should include statuses even if not current selected list
						};
						if (
							selectedListMenuItem &&
							selectedListMenuItem.id === child.id
						) {
							selectedListMenuItem.selectionPath.unshift(MY_LIST_ID);
							if (isListCreationEnabled) {
								content.actions = [
									{
										icon: 'ellipsis-vertical-fill',
										label: 'Menu item actions',
										clickActionType:
											'NOW_LIST_MENU#SHOW_ACTION_OPTIONS',
									},
								];
							}
						}
						transformMenuItem(child);
						listMenuItems[child.id] = child;
						return content;
					}),
				});
				myListTreeContent.push({
					id: MY_LIST_SHARED_ID,
					label: gs.getMessage('Shared with me'),
					actionable: false,
					disableDrag: true,
					disableDrop: true,
					children: listMenuData.sharedMenuItems.map(function (menuItem) {
						let content = {
							id: menuItem.id,
							label: menuItem.displayValue,
						};
						menuItem.selectionPath.unshift(MY_LIST_SHARED_ID);
						transformMenuItem(menuItem);
						listMenuItems[menuItem.id] = menuItem;
						// if selectedItem is shared item, append shared id to selection path
						if (
							selectedListMenuItem &&
							selectedListMenuItem.id === menuItem.id
						) {
							selectedListMenuItem.selectionPath.unshift(
								MY_LIST_SHARED_ID
							);
							if (isListCreationEnabled) {
								content.actions = [
									{
										icon: 'ellipsis-vertical-fill',
										label: 'Menu item actions',
										clickActionType:
											'NOW_LIST_MENU#SHOW_ACTION_OPTIONS',
									},
								];
							}
						}
						return content;
					}),
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
								if (isListCreationEnabled) {
									content.actions = [{
										icon: 'ellipsis-vertical-fill',
										label: 'Menu item actions',
										clickActionType: 'NOW_LIST_MENU#SHOW_ACTION_OPTIONS'
								}];
							}
						}
						return content;
					})
				});

				if (Object.keys(selectedListMenuItem).length > 0) {
					selectedListMenuItem['actionItems'] = [];
					selectedListMenuItem['actionItems'].push({
						id: 'save',
						label: gs.getMessage('Save'),
						disabled: true
					});
					if (isListCreationEnabled) {
						selectedListMenuItem['actionItems'].push({
							id: 'save_a_copy',
							label: gs.getMessage('Save a copy'),
						});
					}
					if (
						selectedTabId == 'sys_ux_my_list' &&
						(
							selectedListMenuItem.selectionPath.indexOf(MY_LIST_SHARED_ID) == -1 ||
							selectedListMenuItem.selectionPath.indexOf(MY_LIST_OPENED_BY_LINK_ID) == -1
						)
					) {
						selectedListMenuItem['actionItems'].push(
							{
								id: 'rename',
								label: gs.getMessage('Rename'),
							},
							{
								id: 'share',
								label: gs.getMessage('Share'),
							},
							{
								id: 'delete',
								label: gs.getMessage('Delete'),
							}
						);
					}
				}
			}

			transformMenuItem(selectedListMenuItem);
			var myListExpandedItems = myListTreeContent.map(
				(listTreeContent) => [listTreeContent.id]
			);
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
					tabActions: isListCreationEnabled ? [{
						key: "create-new-list",
						label: gs.getMessage("Create new list")
					}] : [],
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
			throw new Error(
				'List menu controller data broker transform error: ' +
					error.message
			);
		}
	}

	const isColumnGrouped = function (columnName, groupedColumn, isGrouped) {
		return isGrouped && groupedColumn === columnName;
	};

	const AI_VIRTUAL_GROUP_INFO_BY_KEY = {
		"-1": "Items that aren't currently part of any AI-generated group, including newly added items and those that didn't fit existing groups. They may not be in order.",
		"excluded": "Items that were filtered out during AI skill setup and aren't included in AI-generated groups."

	};

	const addAiGroupedRowInfoMessage = function(row) {
		const message = AI_VIRTUAL_GROUP_INFO_BY_KEY[row.key];
		if (message) {
			row.groupInfoMessage = message;
		}
	};

	const buildGroupActions = function(row) {
		const groupActions = [];

		if (row.isAiGroupedRow) {
			if (row.key !== "-1" && row.key !== "excluded") {
				groupActions.push({
					id: 'ai_summarize',
					label: gs.getMessage('Summarize group'),
					action: 'AI_GROUP_SUMMARIZE',
					icon: 'sn-sparkmoji-logo-outline',
					groupRowHref: row.nowListGroupedRowMetaData.groupLink,
					groupSysId: row.nowListGroupedRowMetaData.groupQuery.includes('=') ? row.nowListGroupedRowMetaData.groupQuery.split('=')[1] : row.nowListGroupedRowMetaData.groupQuery,
					groupId: row.key,
					groupedRowLabel: row.groupedRowLabel
				});
			} else {
				//pushing empty object to make "summarize" unavailable for outlier group
				groupActions.push({});
			}

			groupActions.push({
				id: 'ai_view_all',
				label: gs.getMessage('View group'),
				action: 'AI_GROUP_VIEW_ALL',
				groupRowHref: row.nowListGroupedRowMetaData.groupLink,
				groupSysId: row.key && row.key.toLowerCase().includes('exclude')
							? 'excluded'
							: (
								row.nowListGroupedRowMetaData.groupQuery.includes('=')
									? row.nowListGroupedRowMetaData.groupQuery.split('=')[1]
									: row.nowListGroupedRowMetaData.groupQuery
							),
				groupId: row.key,
				groupedRowLabel: row.groupedRowLabel
			});
		} else {
			groupActions.push({
				id: 'show_all',
				label: gs.getMessage('Show All'),
				action: 'GROUP_SHOW_ALL',
				groupRowHref: row.nowListGroupedRowMetaData.groupLink
			});
		}

		return groupActions;
	};

	const getColumnSort = function(orderBys, columnName) {
	    return orderBys.find(({
	        column_name
	    }) => column_name === columnName);
	};
 
	const isColumnFiltered = function (field, fieldCountMap) {
		if (fieldCountMap[field] > 0) {
			return true;
		}

		const fieldPrefix = field + '.';	// DEF0576586 - Check if any key in the fieldCountMap starts with the field followed by a dot (.) in case for reference field
		for (const key in fieldCountMap) {
			if (key.startsWith(fieldPrefix) && fieldCountMap[key] > 0) {
				return true;
			}
		}
		return false;
	};

	const getIsAllGroupsCollapsed = function (table, groupByColumn, userPref) {
		let preferenceName =
			'workspace.list.' +
			table +
			'.groupBy.' +
			groupByColumn +
			'.defaultAsOpen';
		let prefIndex = userPref
			.map(function (pref) {
				return pref.name;
			})
			.indexOf(preferenceName);
		if (prefIndex < 0) return true;
		let userPrefValue = userPref[prefIndex].value;
		if (userPrefValue == null) return true;
		return userPrefValue === 'false';
	};

	const getExceptionGroupIds = function (table, groupByColumn, userPref) {
		let preferenceName =
			'workspace.list.' +
			table +
			'.groupBy.' +
			groupByColumn +
			'.exceptions';
		let prefIndex = userPref
			.map(function (pref) {
				return pref.name;
			})
			.indexOf(preferenceName);
		if (prefIndex < 0) return [];
		let exceptions = userPref[prefIndex].value || '';
		if (!exceptions) return [];
		return exceptions.split(',');
	};

	const buildFieldCountMap = function (encodedQuery) {
		let decodedQuery = JSON.parse(gs.base64Decode(encodedQuery));
		let fieldMap = {};
		function countFields(items) {
			items.forEach(function (item) {
				if (item.subpredicates) {
					countFields(item.subpredicates);
				} else {
					fieldMap[item.field] = fieldMap[item.field] + 1 || 1;
				}
			});
		}
		countFields(decodedQuery.predicates);
		return fieldMap;
	};

	const buildOrderByArray = function(encodedQuery, orderByColumn, orderByIsDescending) {
	    const decodedQuery = JSON.parse(gs.base64Decode(encodedQuery));
	    const orderBys = decodedQuery.order_by;
	    if (orderBys.length === 0 && orderByColumn) {
	        orderBys.push({
	            ascending: !orderByIsDescending,
	            column_name: orderByColumn
	        });
	    }

	    return orderBys;
	};

	const areAllGroupsExpandedOrCollapsed = function (
		expandAllGroups,
		exceptionGroupIds,
		key
	) {
		if (!(exceptionGroupIds.indexOf(key) > -1)) {
			return expandAllGroups;
		}
		return !expandAllGroups;
	};

	const setRecordLinkForRowCell = function (cell) {
		const { table, sysId } = cell.metadata?.openRecordMetadata || {};
		if (table && sysId) {
			cell.href = '/' + table + '.do?sys_id=' + sysId;
		}
	}

	const setCellValues = function (row) {
		let cells = {};
		let highlightedData = row.highlightedData || [];
		let transformedHighlightedData = highlightedData.map(function (value) {
			let newHighlightedObject = {
				color: value.colorName,
				variant: value.variantName,
				size: value.size,
			};
			for (let key in value) {
				if (key !== 'colorName' && key !== 'variantName') {
					newHighlightedObject[key] = value[key];
				}
			}
			return newHighlightedObject;
		});
		let highlightedValue = {};
		transformedHighlightedData.forEach(function (item) {
			highlightedValue[item.field] = item;
		});
		row.cells.forEach(function (cell) {
            if (cell.value.metadata.internalType === 'glide_duration' && gs.getProperty('glide.list.duration_zero_default', 'true') !== 'false') {
                    cell.value.value = cell.value.value || `0 ${gs.getMessage('Seconds')}`;
            }
			switch (cell.value.type) {
				case 'boolean':
					cell.value.value = cell.value.value == 'true';
					break;
				case 'number':
					var cellValue = cell.value.value;
					cell.value.value = cellValue ? parseFloat(cellValue) : null;
					break;
				case 'pills':
					cell.value.value = cell.value.pills;
					break;
				case 'workflow':
					cell.value.componentProps = {
						showInfoButton: true,
						stages: cell.value.stages,
						renderer: cell.value.renderer,
						showApprovers: cell.value.showApprovers
					};
					cell.value.label = cell.value.currentStageLabel;
			}
			cell.value.highlightedValue = highlightedValue[cell.name];

			// ==== EPIC1037618 ==== start: applying value/label overrides
			// These overrides and transformations are intended to allow Cat Var "string" values (singular field type)
			// to be treated as if they were a variety of glide field types.
			var cv = cell.value;
			if (isCatVarField(cell.name)) {
				var catVarMeta = CatVarMetaBySysId[getCatVarSysId(cell.name)];
				var catVarConfig = CatVarConfigByTypeId[catVarMeta?.typeId];
				if (!!catVarMeta && !!catVarConfig) {
					switch (catVarConfig.type) {
						case 'boolean':
							if (cv.value == 'false') { //value needs to evaluate to false
								cv.value = false;
							}
							break;
						case 'choice':
							if (cv.value) {
								if (isLookupCatVarTypeId(catVarMeta.typeId)) {
									cv.label = catVarMeta.lookupLabelsByValue[cv.value]; //retrieve the label
								} else {
									cv.label = cv.value; //make the label reflect the value
									cv.value = cv.metadata.internalValue;
								}
							}
							break;
						case 'string':
							cv.label = cv.value;
							break;
						case 'html':
							if (catVarConfig.escapeHtml) { //this was set because the original data is not truly HTML
								cv.value = cv?.value?.replace(/&/g, '&amp;') //escape markup to display appropriately
									.replace(/</g, '&lt;')
									.replace(/>/g, '&gt;')
									.replace(/"/g, '&quot;')
									.replace(/'/g, '&#039;')
									.replace(/\r\n/g, '<br/>');
							}
							break;
						case 'link':
							if ('33' == catVarMeta.typeId) { //attachment
								cv.metadata.openRecordMetadata.table = 'sys_attachment';
								cv.metadata.openRecordMetadata.sysId = cv?.metadata?.internalValue;
								cv.label = cv?.value;
							} else {
								cv.metadata.openRecordMetadata.table = catVarMeta.reference;
							}
					}
				}
			}
			// ==== EPIC1037618 ==== end

			setRecordLinkForRowCell(cell.value);
			cells[cell.name] = cell.value;
		});
		return cells;
	};

	const foundDAsRequiringSelection = function (actions) {
		let found = null;
		for (let i = 0, l = actions.length; i < l; i++) {
			let action = actions[i];
			if (action.recordSelectionRequired === true) {
				found = action;
				break;
			}
			if (action.groupedActions) {
				if (foundDAsRequiringSelection(action.groupedActions)) {
					found = action;
					break;
				}
			}
		}
		return found !== null;
	};

	const isPluginActive = function (pluginId) {
		var pluginManager = new GlidePluginManager();
		return pluginManager.isActive(pluginId);
	};

	const shouldShowAiFilterAssist = function () {
		let showAiFilterAssist = false;

		try {
			const hasAiFilterAssistRole = gs.getUser().hasRole('sn_ai_filter_assist.user');

			if (hasAiFilterAssistRole && isPluginActive('sn_ai_list_exp')) {
				var gr = new GlideRecord("sn_nowassist_skill_config_status");
				if (gr.get("488ab74853f07e1000bdfc6230e5e615")) {
					showAiFilterAssist = gr.getValue("active") === '1';
				}
			}
		} catch (error) {
			showAiFilterAssist = false;
		}

		return showAiFilterAssist;
	};

	// Filter out Declarative Actions that are not supported for eg: export action for non-logged in users
	const filterOutDA = function (actions, actionDispatch) {
		let resultActions = [];
		for (let i = 0, l = actions.length; i < l; i++) {
			let action = actions[i];
			if (action.groupedActions) {
				const groupedActions = filterOutDA(action.groupedActions, actionDispatch);
				if (!groupedActions.length) {
					continue;
				}
				action.groupedActions = groupedActions;
			} else if (action.actionDispatch === actionDispatch) {
				continue;
			}
			resultActions.push(action);
		}
		return resultActions;
	};

	try {
		const {
			currentPage,
			limit,
			recordCountLimit,
			requestMetadata,
			rowLimitOptions,
			transformScriptArgs = {},
			transformScriptSysId,
			nestBy,
			layouts,
			listType,
			cardFieldMapping,
			pageSysId,
			listControllerId
		} = input;

		let { featureFlags = {} } = input;
		// Disable quick edit and cell editing if user is not logged in
		if (!isLoggedIn) {
			featureFlags.enableQuickEdit = false;
			featureFlags.enableCellEditing = false;
		}

		const {
			declarativeActionsLayout: declarativeActions,
			fuzzyListCount,
			nowListLayout,
		} = input?.graphqlData?.data?.GlideNowListLayoutComposite_Query?.getNowListLayoutComposite || {};

		// STRY60554459 - We are pulling these objects into the record list header when the filter overview component is enabled
		const decodedQuery = input?.decodedQueryData?.data?.GlidePredicateBuilder_Query?.getDecodedQuery?.decodedQuery;
		const fixedDecodedQuery = input?.fixedDecodedQueryData?.data?.GlidePredicateBuilder_Query?.getDecodedQuery?.decodedQuery;

		const listMenuTransform = menuTransform(input);
		const menuItem = listMenuTransform?.selectedListMenuItem;

		let { 
			enableInfiniteScroll, 
			liveUpdates, 
			enableLiveList, 
			showFilterOverview, 
			enableColumnCalculations, 
			enableRelatedHierarchy 
		} = input;
		// Disabling live list for non-logged in users
		enableLiveList = enableLiveList && isLoggedIn;
		// If list menu feature flag enableInfiniteScroll exists, set enableInfiniteScroll
		// setting enableInfiniteScroll needs to be returned from output transform into recordListDataBroker
		if (typeof listMenuTransform?.featureFlags?.enableInfiniteScroll === 'boolean') {
			enableInfiniteScroll = listMenuTransform.featureFlags.enableInfiniteScroll;
		}
		if (typeof listMenuTransform?.featureFlags?.enableColumnCalculations === 'boolean') {
			enableColumnCalculations = listMenuTransform.featureFlags.enableColumnCalculations;
		}
		if (typeof listMenuTransform?.featureFlags?.enableRelatedHierarchy === 'boolean') {
			enableRelatedHierarchy = listMenuTransform.featureFlags.enableRelatedHierarchy;
		}

		// If list menu feature flag contains liveUpdatesForListMenu, set liveUpdates to the value of liveUpdatesForListMenu
		if (typeof listMenuTransform?.featureFlags?.liveUpdatesForListMenu === 'string') {
			liveUpdates = listMenuTransform.featureFlags.liveUpdatesForListMenu;
		} else if (typeof featureFlags?.liveUpdatesForListMenu === 'string') {
			liveUpdates = featureFlags?.liveUpdatesForListMenu || "off";
		} else if (enableLiveList) {
			// STRY59314760 - Backward compatibility: If enableLiveList is true, set liveUpdates to 'manual_refresh'.
			liveUpdates = "manual_refresh";
		}

		// If list menu feature flag contains showFilterOverview, set showFilterOverview to the value of showFilterOverview
		if (typeof listMenuTransform?.featureFlags?.showFilterOverview === 'boolean') {
		    showFilterOverview = listMenuTransform.featureFlags.showFilterOverview;
		}

		let result = {
			recordCountLimit,
			rowLimitOptions,
			requestMetadata: {
				...requestMetadata,
				currentPage,
				limit,
			},
			listMenuTransform,
			GlideClientScriptingEnvironment_Query:
				input?.graphqlData?.data?.GlideClientScriptingEnvironment_Query,
			GlideDomain_Query: input?.graphqlData?.data?.GlideDomain_Query,
			GlideUIScript_Query: input?.graphqlData?.data?.GlideUIScript_Query,
			GlideRegisteredModalQuery_Query:
				input?.graphqlData?.data?.GlideRegisteredModalQuery_Query,
		};

		if (!nowListLayout) {
			return result;
		}

		const {
			columnDefinitions,
			legacyListLayout,
			rowDefinitions,
			tableMetadata,
			tableMetadata: {
				encodedConcatenatedQuery,
				encodedFixedQuery,
				encodedQuery,
				groupByDisplayValue,
				groupedColumn,
				isChoiceAggregate,
				isDBView,
				isGrouped,
				isOmitCount,
				areColumnsPersonalized,
				orderByColumn,
				orderByIsDescending,
				preferences,
			},
		} = nowListLayout;

		if (menuItem) {
			tableMetadata.table = menuItem.table;
			tableMetadata.query = menuItem.query;
			tableMetadata.columns = menuItem.columns;
			tableMetadata.view = menuItem.view;
			tableMetadata.tableLabel = menuItem.label;
			tableMetadata.listId = menuItem.id;
			featureFlags = {
				...featureFlags,
				...menuItem.featureFlags,
			};
		}

		let expandAllGroups = false;
		let exceptionGroupIds = [];
		const { table: tableName, viewName, query } = tableMetadata;

		if (isGrouped) {
			let isAllGroupsCollapsed = getIsAllGroupsCollapsed(
				tableName,
				groupedColumn,
				preferences
			);
			exceptionGroupIds = getExceptionGroupIds(
				tableName,
				groupedColumn,
				preferences
			);
			expandAllGroups = !isAllGroupsCollapsed;
		}
		// Check if user has permission to personalize lists (required for column calculations)
		const hasPersonalizeListPermission = gs.hasRightsTo('ui/configure.personalize_list/write', null);
		const columnCalcEnabled = enableColumnCalculations && !nestBy && (liveUpdates || 'off') === 'off' && !enableInfiniteScroll && hasPersonalizeListPermission;

		const fieldCountMap = buildFieldCountMap(encodedConcatenatedQuery);
		const orderBys = buildOrderByArray(encodedQuery, orderByColumn, orderByIsDescending);
		columnDefinitions.columnHeaderTextTooltip = gs.getMessage('Sort');
		const GLIDE_FX_CURRENCY = 'currency2';
		const GLIDE_JOURNAL_INPUT = 'journal_input';
		const GLIDE_JOURNAL = 'journal';
		const GLIDE_RELATED_TAGS = 'related_tags';
		/* Filter & grouping should be disabled (hide button in header,
		 * disable context menu in cells) for columns having below internalTypes.
		 * This was added in NRLC, adding similar logic here.
		 * Details for changes in NRLC:
		 *   PRB1361480
		 *   https://code.devsnc.com/dev/now-record-list/pull/129/files
		 */
		const NO_CELL_FILTER_OR_GROUP_COLUMNS = [
			GLIDE_FX_CURRENCY,
			GLIDE_JOURNAL_INPUT,
			GLIDE_JOURNAL,
			GLIDE_RELATED_TAGS
		];
		const buildColumnHeaderActions = function (column, {
			doColumnGrouping,
			doColumnCalculations,
			excludeFromFilterAndGroupBy,
			isCurrentColumnGrouped
		}) {
			const rules = [
				{
					condition: doColumnGrouping && !excludeFromFilterAndGroupBy,
					action: {
							id: isCurrentColumnGrouped ? 'ungroup_by_column' : 'group_by_column',
							label: isCurrentColumnGrouped
								? gs.getMessage('Ungroup by {0}', column.label)
								: gs.getMessage('Group by {0}', column.label),
							action: 'GROUP_BY_COLUMN',
					}
				},
				{
					condition: doColumnCalculations,
					action: {
						id: 'column_calculation',
						label: gs.getMessage('Calculate'),
						action: 'COLUMN_CALCULATIONS',
					}
				}
			];
			return rules.filter(r => r.condition).map(r => r.action);
		}
		columnDefinitions.columnFilterCustomValueEditorEmittedActions = ["NOW_BUTTON#CLICKED"];

		// ==== EPIC1037618 ==== start: setting up variable type metadata
		const UNHANDLED_CAT_VAR_INFO = {
			type: 'invalidTypeForList', //this will act as a marker for types deemed unhandle-able
			metadata: {                 //set metadata to disable all special features that may cause errors
				isFilterable: false,
				isGroupable: false,
				isSortable: false,
				isChoice: false,
				internalType: 'string'
			}
		};
		// STRY59834345
		const COMMON_VAR_METADATA = {
			isFilterable: false, //ideally/eventually, the norm will be true; subject to more testing
			isGroupable: true,
			isSortable: true,
			isChoice: false,
			internalType: 'string'
		};
		// STRY59834760
		var CatVarConfigByTypeId = {
			'1': {type: 'boolean'},                   // yes_no
			'2': {type: 'html', escapeHtml: true, metadata: {isGroupable: false}}, // multi_line_text
			'3': {type: 'choice'},                    // multiple_choice
			'4': {type: 'integer'},                   // numeric_scale
			'5': {type: 'choice'},                    // select_box
			'6': {type: 'string', metadata: {isGroupable: false}}, // single_line_text
			'7': {type: 'boolean'},                   // check_box
			'8': {type: 'link', renderAsLink: true},  // reference
			'9': {type: 'glide_date'},                // date
			'10': {type: 'glide_date_time', metadata: {isGroupable: false}}, // date_time
			'11': UNHANDLED_CAT_VAR_INFO,             // label
			'12': UNHANDLED_CAT_VAR_INFO,             // break
			'14': UNHANDLED_CAT_VAR_INFO,             // macro
			'15': UNHANDLED_CAT_VAR_INFO,             // ui_page
			'16': {type: 'wideText', metadata: {isGroupable: false}}, // wide_single_line_text
			'17': UNHANDLED_CAT_VAR_INFO,             // macro_with_abel
			'18': {type: 'choice'},                   // lookup_select_box
			'19': UNHANDLED_CAT_VAR_INFO,             // container_start
			'20': UNHANDLED_CAT_VAR_INFO,             // container_end
			'21': {type: 'glide_list'},               // list_collector
			'22': {type: 'choice'},                   // lookup_multiple_choice
			'23': {type: 'html', metadata: {isGroupable: false}}, // html
			'24': UNHANDLED_CAT_VAR_INFO,             // container_split
			'25': {type: 'mask_code', metadata: {isGroupable: false, isSortable: false, isFilterable: false}}, // masked
			'26': {type: 'email', metadata: {isGroupable: false}}, // email
			'27': {type: 'url', metadata: {isGroupable: false}}, // url
			'28': {type: 'ip_addr'},                  // ip address
			'29': {type: 'glide_duration', metadata: {isGroupable: false}}, // duration
			'30': UNHANDLED_CAT_VAR_INFO,             // table
			'31': {type: 'link', renderAsLink: true}, // requested_for
			'32': UNHANDLED_CAT_VAR_INFO,             // rich_text_label
			'33': {type: 'link'},                     // attachment
			'40': UNHANDLED_CAT_VAR_INFO,             // table_name
		};
		for (id in CatVarConfigByTypeId) {
			let catVarConfig = CatVarConfigByTypeId[id];
			if (catVarConfig !== UNHANDLED_CAT_VAR_INFO) {
				if (!catVarConfig.metadata) {
					catVarConfig.metadata = {};
				}
				//create a metadata object that gives precedence to catVarConfig info over the "common"/shared one
				let tempMetadata = Object.assign({}, COMMON_VAR_METADATA, catVarConfig.metadata);
				catVarConfig.metadata = tempMetadata;
			}
		}

		const catVarSysIds = [];
		columnDefinitions.columns.forEach(column => { //gather all catVar sys_id's
			if (isCatVarField(column.key)) {
				catVarSysIds.push(getCatVarSysId(column.key));
			}
		});
		var CatVarMetaBySysId = {};
		if (0 < catVarSysIds.length) {
			var catVarGR = new GlideRecord('item_option_new'); //retrieve configuration of catVars used
			catVarGR.addEncodedQuery('sys_idIN' + catVarSysIds.join(','));
			catVarGR.query();
			while (catVarGR.next()) {
				let catVarMeta = {};
				catVarMeta.typeId = `${catVarGR.type}`;
				catVarMeta.reference = `${catVarGR.reference}`;
				catVarMeta.lookup_table = `${catVarGR.lookup_table}`;
				catVarMeta.lookup_valueField = `${catVarGR.lookup_value}`;
				catVarMeta.reference_qual = `${catVarGR.reference_qual}`;
				if (isLookupCatVarTypeId(catVarGR.type)) { //for header filter drop-down, we fetch the possible options
					let choices = [];
					let labelsByValue = {};
					let lookupGR = new GlideRecord(catVarGR.lookup_table);
					// if there were qualifiers, like for references, then these would apply here
					lookupGR.addEncodedQuery(catVarMeta.reference_qual);
					lookupGR.orderBy(catVarGR.lookup_value);
					lookupGR.query(); // we don't save/cache the result, presume that no variables on list have same choices
					while (lookupGR.next()) {
						let choice = {};
						choice.key = '' + lookupGR.getValue(catVarGR.lookup_value);
						choice.label = '' + lookupGR.getValue(catVarGR.lookup_value);
						choices.push(choice);
						labelsByValue[choice.key] = choice.label;
					}
					catVarMeta.lookupChoices = choices;
					catVarMeta.lookupLabelsByValue = labelsByValue;
				}
				CatVarMetaBySysId[catVarGR.getUniqueValue()] = catVarMeta;
			}
		}
		// ==== EPIC1037618 ==== end

		columnDefinitions.columns.forEach(function (column) {
			// Check for workflow type columns
			if (column.type === 'workflow') {
				// if workflow type column is first column, we want it just render the current stage display value so we make it link
				if (column.renderAsLink == true)
					column.type = 'link';
				else {
					// Configure column to use sn-flow-stage-renderer component if it's not the first column
					column.type = 'custom';
					column.componentTag = 'sn-flow-stage-renderer';
					column.defaultComponentProps = {
						showInfoButton: true,
					};
					column.cellContentDimensions = {
						width: 'auto',
						height: 'auto',
					};
				}
			}
			
			// ==== EPIC1037618 ==== start: applying variable type metadata
			if (isCatVarField(column.key)) {
				var catVarSysId = getCatVarSysId(column.key);
				var catVarConfig = CatVarConfigByTypeId[CatVarMetaBySysId[catVarSysId].typeId];
				column.type = catVarConfig.type;
				if (catVarConfig.renderAsLink) {
					column.renderAsLink = true;
				}
				// STRY59834345
				Object.assign(column.metadata, catVarConfig.metadata); //overwrite metadata with configured metadata
				if ('choice' == column.type) {
					column.metadata.isChoice = true;
					let choices = [];
					let catVarMeta = CatVarMetaBySysId[catVarSysId];
					if (isLookupCatVarTypeId(catVarMeta.typeId)) { //these choices have already been retrieved
						choices = catVarMeta.lookupChoices;
					} else { //options for the catVar (question) need to be retrieved
						let choiceValGR = new GlideRecord('question_choice');
						choiceValGR.addQuery('question', catVarSysId);
						choiceValGR.query();
						while (choiceValGR.next()) {
							let choice = {};
							choice.key = `${choiceValGR.getValue('value')}`;
							choice.label = `${choiceValGR.getValue('text')}`;
							choices.push(choice);
						}
					}
					column.choices = choices;
				}
			}
			// ==== EPIC1037618 ==== end

			const excludeFromFilterAndGroupBy = NO_CELL_FILTER_OR_GROUP_COLUMNS.includes(column.metadata.internalType);
			if (
				column.metadata.isFilterable &&
				featureFlags.enableCellFiltering &&
				!excludeFromFilterAndGroupBy
			) {
				var cellActions = [
					{
						id: 'show_matching',
						label: gs.getMessage('Show matching'),
						action: 'LIST_CTRL#SHOW_MATCHING_CLICKED',
					},
					{
						id: 'filter_out',
						label: gs.getMessage('Filter out'),
						action: 'LIST_CTRL#FILTER_OUT_CLICKED',
					},
				];
				column.cellActions = cellActions;
			}
			var doColumnFiltering =
				column.metadata.isFilterable &&
				featureFlags.enableColumnFiltering;
			var doColumnGrouping =
				column.metadata.isGroupable &&
				featureFlags.enableColumnGrouping && nestBy !== column.key
				&& !aiListConfig?.aiGroupingEnabled;
			var isSortable = column.metadata.isSortable;
			var isCurrentColumnGrouped = isColumnGrouped(column.key, groupedColumn, isGrouped);
			var doColumnCalculations = columnCalcEnabled && column.metadata?.columnAggregatesInfo?.length;
			column.columnHeaderActions = buildColumnHeaderActions(column, {
				doColumnGrouping,
				doColumnCalculations,
				excludeFromFilterAndGroupBy,
				isCurrentColumnGrouped
			});
			if(featureFlags.enableDataVisualization && isSortable && (column.metadata.isGroupable &&!isColumnGrouped(column.key, groupedColumn, isGrouped))){
				column.columnHeaderActions.push({
					id: 'show_visualization_clicked',
					label: gs.getMessage('Show visualization'),
					action: 'SHOW_VISUALIZATION_CLICKED',
				});
			}

			if (
				!isSortable ||
				featureFlags.enableColumnSorting === false
			) {
				column.headerTextDisabled = true;
			}
			if (!column.icons)
				column.icons = {
					endIcons: [],
				};
			if (!column.icons.endIcons) column.icons.endIcons = [];

			if (!column.sortDirection) {
				column.sortDirection = "none";
			}

			const columnSort = getColumnSort(orderBys, column.key);
			if (columnSort) {
				var sortIcons = [];
				column.metadata.isSorted = true;
				column.metadata.isDescending = !columnSort.ascending;;
				sortIcons.push({
					value: !columnSort.ascending
						? 'sort-descending-fill'
						: 'sort-ascending-fill',
				});
				column.icons.endIcons = sortIcons.concat(column.icons.endIcons);

				column.sortDirection = orderByIsDescending ? "descending" : "ascending";
			} else {
				column.sortDirection = "none";
			}
			if (isColumnFiltered(column.key, fieldCountMap)) {
				column.metadata.isFiltered = true;
				column.icons.endIcons.push({
					value: 'filter-fill',
				});
			} else {
				column.metadata.isFiltered = false;
			}
			if (
				column.metadata.isGroupable &&
				isColumnGrouped(column.key, groupedColumn, isGrouped)
			) {
				var groupIcons = [];
				groupIcons.push({
					value: 'folder-fill',
				});
				column.icons.endIcons = column.icons.endIcons.concat(
					groupIcons
				);
			}
		});

		function attachRelatedLists(row){
			if (row.type === 'custom') {
				return;
			} else if(row.type === 'grouped' || row.children){
				row.children?.forEach(function (childRow) {
					attachRelatedLists(childRow);
				});	
			} else {
				row.children = [];
				row.children.push({
					type: 'relatedLists',
					key: 'related-lists',
					componentTag: 'sn-related-lists',
					componentProps: {
						table: tableName,
						query,
						view: viewName,
						rowSysId: row.key.split('@').pop(),
					},
					rowContentDimensions: {
						width: '100%'
					}
				})
			}
		}

		if (enableRelatedHierarchy) {
			rowDefinitions.rows.forEach(attachRelatedLists);
		}

		rowDefinitions.rows.forEach(function (row) {
			if (row.type === 'grouped') {
				var children = row.children;
				row.groupActions = buildGroupActions(row);
				if (isChoiceAggregate) {
					// When grouped by choice, choices can have the same value across different tables
					// For example, lets say we are on task table. On task table we have a choice defined as
					// value: 1, display: New. On incident we can have value:1, display: Open. Because they
					// have the same value, we have to make sure to give a unique key. In this case a combination
					// of the value, displayvalue, and the choice table.
					// eg:
					//    taskNew1
					//    incidentOpen1
					var choiceTable =
						row.nowListGroupedRowMetaData.groupChoiceTable;
					row.key = choiceTable + groupByDisplayValue + row.key;
				}

				let catVarSysId = isCatVarField(groupedColumn) && getCatVarSysId(groupedColumn);
				let catVarMeta;
				if (catVarSysId && !!row.groupedRowLabel && (catVarMeta = CatVarMetaBySysId[catVarSysId]) &&
						isLookupCatVarTypeId(catVarMeta.typeId)) { // ==== EPIC1037618 ==== use retrieved labels for GroupRow
					row.groupedRowLabel = `${groupByDisplayValue}: ${catVarMeta.lookupLabelsByValue[row.groupedRowLabel]}`;
				} else if (row.isAiGroupedRow){
				 row.groupedRowLabel = `${row.groupedRowLabel}`;
				 addAiGroupedRowInfoMessage(row);
				} else if (!row.groupedRowLabel && !row.key) {
					row.groupedRowLabel = `${groupByDisplayValue}: ${gs.getMessage('(empty)')}`
				} else if (!row.groupedRowLabel && !!row.key) { // if groupedRowLabel is empty but key is not for some values (images)
					row.groupedRowLabel = `${groupByDisplayValue}: ${row.key}`;
				} else {
					row.groupedRowLabel = `${groupByDisplayValue}: ${row.groupedRowLabel}`;
				}

				row.isGroupExpanded =
					exceptionGroupIds.length == 0
						? expandAllGroups
						: areAllGroupsExpandedOrCollapsed(
								expandAllGroups,
								exceptionGroupIds,
								row.key
						  );
				if (children.length > 0) {
					children.forEach(function (row) {
						row.cells = setCellValues(row);
					});
				}

				if (recordCountLimit > 0 && row.groupedRowCount >= recordCountLimit) {
					row.groupedRowCount = recordCountLimit - 1; // input transform script added 1 to recordCountLimit
					row.groupedRowCountChar = '+';
				}
			} else {
				row.cells = setCellValues(row);
			}
		});

		if (featureFlags.enableQuickEdit !== false) {
			rowDefinitions.actions = {
				actionsItems: [
					{
						id: 'quick-edit',
						icon: 'pencil-outline',
						label: gs.getMessage('Edit form'),
						action: 'QUICK_EDIT_FORM_OPENED',
					},
				],
			};
		}
		if (layouts.includes('gallery')) {
			// Adding open record action for gallery layout if row selection is enabled
			rowDefinitions.actions = rowDefinitions.actions || {};
			rowDefinitions.actions.actionsItems = rowDefinitions.actions.actionsItems || [];
			rowDefinitions.actions.actionsItems.push({
				// This ID will be used in client databroker to filter out when switched to list layout
				id: 'sn-list-gallery-open-record', 
				icon: 'open-link-right-outline',
				label: gs.getMessage('Open record'),
				action: 'OPEN_RECORD_CLICKED',
			});
		}
		if (
			featureFlags.enableHighlightContent &&
			featureFlags.highlightContent &&
			featureFlags.highlightContent.patterns
		) {
			rowDefinitions.highlightedContent =
				featureFlags.highlightContent.patterns;
		}

		if (featureFlags.enableReferenceLinks === false) {
			if (columnDefinitions?.columns) {
				columnDefinitions.columns.forEach(function (column, index) {
					// disable all reference links having column type as link, person or url but ignore first column
					if (
						(column.type === 'link' || column.metadata?.internalType === 'reference') &&
						!column.renderAsLink
					) {
						column.disabled = true;
					}
				});
			}
		}

		if(layouts.includes('gallery')) {
			const galleryConfig = {
				options: {
					enableOnlySingleSelection: featureFlags.enableOnlySingleSelection, 
					galleryItemTooltip: featureFlags.enableCardClickOpen ? gs.getMessage('Open Record'): '',
					cardType: cardFieldMapping?.cardType || 'default',
					fullWidth: cardFieldMapping?.fullWidth || false
				},
				fields: {}
			};
			// Removing fields if listType is withMenu
			if (listType !== 'withMenu' && cardFieldMapping) {
				const {
					media = '',
					heading = '',
					tagline = '',
					caption = '',
					metadata = '',
					bodyText = '',
					supplementaryFields = '',
					footer = '',
				} = cardFieldMapping;
				galleryConfig.fields = {
					media: {
						column: media,
						options: {
							aspectRatio: cardFieldMapping?.aspectRatio || '1/1',
							fit: cardFieldMapping?.fit || 'contain',
						},
					},
					heading: { column: heading },
					tagline: { column: tagline },
					caption: { column: caption },
					metadata: { column: metadata },
					bodyText: { column: bodyText },
					supplementaryFields: [
						...supplementaryFields
							.trim()
							.split(',')
							.map((column) => ({
								column,
							})),
					],
					footer: { column: footer },
				};
			}
			columnDefinitions.galleryConfig = galleryConfig;
		}

		var tableLabel = tableMetadata.tableLabel;

		const preTransformScriptResults = {
			columnDefinitions,
			rowDefinitions,
			declarativeActions,
			tableName
		};

		const utils = new sn_now_list_common.ListTransformUtils();
		const processed = transformScriptSysId
			? utils.processTransform(
					transformScriptSysId,
					transformScriptArgs,
					preTransformScriptResults,
					featureFlags
			  )
			: utils.processFeatureFlags(
					preTransformScriptResults,
					featureFlags
			  );

		let actions = processed.declarativeActions?.declarativeActions || [];
		if (!isLoggedIn) {
			actions = filterOutDA(actions, exportActionDispatch);	
			processed.declarativeActions.declarativeActions = actions;
		}
		const hasDAsRequiringSelection = foundDAsRequiringSelection(actions);
		// first time loading: aiListConfig is empty as table is not available.
		if (aiListConfig?.isAISupported == undefined) {
			try {
				var isAISupported = new sn_now_list_common.ListAIConfigBuilder().resolveIsAISupported(input.skillConfiguration, tableName);
				aiListConfig = {
					"aiLayoutMode": "",
					"isAISupported": isAISupported,
					"aiGroupInfo": input.aiGroupInfo || {},
				};
			} catch (e) {
				gs.warn('Now List Output Transform: Failed to resolve AI support. ' + e.message);
				aiListConfig = { "aiLayoutMode": "", "isAISupported": false, "aiGroupInfo": input.aiGroupInfo || {} };
			}
		} else {
			if (aiListConfig?.isAISupported && aiListConfig?.aiLayoutMode == 'single') {
				tableLabel = aiListConfig?.label;
			}
		}
		featureFlags.showAiFilterAssist = shouldShowAiFilterAssist();

		return {
			...result,
			columnDefinitions: processed.columnDefinitions,
			rowDefinitions: processed.rowDefinitions,
			overlayDefinition: processed.overlayDefinition,
			declarativeActions: processed.declarativeActions,
			tableLabel,
			expandAllGroups: enableInfiniteScroll ? false : expandAllGroups,
			tableMetadata,
			enableInfiniteScroll,
			enableColumnCalculations: columnCalcEnabled,
			enableLiveList,
			liveUpdates,
			encodedQuery,
			encodedConcatenatedQuery,
			encodedFixedQuery,
			decodedQuery,
			enableOmitCount: isOmitCount,
			fixedDecodedQuery,
			areColumnsPersonalized,
			isDBView,
			legacyListLayout,
			featureFlags,
			hasDAsRequiringSelection,
			listCount: {
				getListCount: fuzzyListCount,
			},
			pageSysId,
			listControllerId,
			aiListConfig,
			enableUserPreferences: isLoggedIn,
			enableRelatedHierarchy,
			isExternalUser,
			shouldAggregatesRowBeSticky: processed.shouldAggregatesRowBeSticky,
		};
	} catch (error) {
		throw new Error(
			'List controller data broker transform error: ' + error.message
		);
	}
}
