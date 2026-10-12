function transform(input) {
    const {
		configurationId,
		enableCellFiltering,
		enableColumnSorting,
		enableDeclarativeActions,
		enableReferenceLinks,
		enableQuickEdit,
		featureFlags: currentFeatureFlags,
		groupBy,
		infiniteCurrentPage,
		limit,
		menuLoaded,
		onlyEnableSelectionWhenRequiredByActions,
		infiniteQuery,
		requestMetadata: {
			requestId
		},
		table,
		listType,
    childQuery,
    currentPageForChild,
    nestBy,
    expandAllGroups,
    childrenRowLimit,
    enableBadgeCount,
    columnFilteringPopoverDisplay,
    enableOnlySingleSelection,
    enableCardClickOpen,
    layouts
    } = input;
    var {
        enableInfiniteScroll,
        enableColumnCalculations,
        enableRelatedHierarchy,
        query,
        fixedQuery,
        currentPage
    } = input;
    var {
        enableRowDragDrop,
        enableSelectAll,
        enableToggleAllGroups,
        enableInfiniteScroll: enableInfiniteScrollFromCurrentFlag,
        enableColumnCalculations: enableColumnCalculationsFromCurrentFlag,
        enableRelatedHierarchy: enableRelatedHierarchyFromCurrentFlag,
        liveUpdates: liveUpdatesFromCurrentFlag
    } = currentFeatureFlags;

  let {
    enableColumnFiltering,
    enableColumnGrouping,
    enableDataVisualization,
  } = input;

  switch (columnFilteringPopoverDisplay) {
    case 'allowBoth':
        enableColumnFiltering = true;
        enableColumnGrouping = true;
        break;
    case 'allowOnlyFiltering':
        enableColumnFiltering = true;
        enableColumnGrouping = false;
        break;
    case 'allowOnlyGrouping':
        enableColumnFiltering = false;
        enableColumnGrouping = true;
        break;
    case 'disallowColumnFilteringPopover':
        enableColumnFiltering = false;
        enableColumnGrouping = false;
        break;
    default:
      break;
  }
	const firstLoad = requestId === null;
  // for  menulist enableInfiniteScroll will never be set in the inputTransform on firstLoad.
  // this strictly handles case where input is set by the controller. ie non menulists.
  if(firstLoad && enableInfiniteScroll) {
    currentPage = 0;
  }
  // this will only be set to true if set by menuList config
  if (enableInfiniteScrollFromCurrentFlag === true) {
    enableInfiniteScroll = true;
  }

  function shouldEnableColumnCalculations() {
      const liveUpdates = liveUpdatesFromCurrentFlag !== 'off' ? liveUpdatesFromCurrentFlag : input.liveUpdates || 'off';
      let enableColumnCalculations = input.enableColumnCalculations;
      const isGalleryOnlyLayout = layouts === 'gallery';

      if (enableColumnCalculationsFromCurrentFlag === true) {
        // When different menu item is selected for which enableColumnCalculations is true
        enableColumnCalculations = true;
      } else if (listType !== 'withMenu') {
        // Existing pages in upgraded instance will have enableColumnCalculations as null.
        // Since we want column calculations to be enabled by default, this check ensures that behavior.
        enableColumnCalculations = enableColumnCalculations !== false;
      }

      return enableColumnCalculations && !isGalleryOnlyLayout && !nestBy && !enableInfiniteScroll && liveUpdates === 'off';
  }

  enableColumnCalculations = shouldEnableColumnCalculations();

  if (enableRelatedHierarchyFromCurrentFlag === true) {
    enableRelatedHierarchy = true;
  }

  if(enableInfiniteScroll) {
     // this check is needed in the case where users click back or forward navigation button
     // on browser. state_persistence force updates the controller state with the url query and currentPage.
     // if this query is different then the last infiniteQuery then reset currentPage
     // infiniteQuery is set to the query in the "List controller fetch update" script: b99fcd2e47607ac05c81f02dcab8427c
    if(query !== infiniteQuery) {
      currentPage = 0;
    } else {
      // infiniteCurrentPage is needed to keep currentPage in state as zero so that when
      // user navigates with back or forward button, the page number is reset back to 0 in the above
      // query logic.
      currentPage = infiniteCurrentPage;
    }
  }


  let currentGrouping = enableInfiniteScroll ? '' : groupBy;

   const featureFlags =
		firstLoad
		?
			{
				...currentFeatureFlags,
				enableSelectAll: enableInfiniteScroll ? false : enableSelectAll !== false,
				enableRowDragDrop: enableInfiniteScroll ? false : enableRowDragDrop !== false,
				enableCellFiltering: enableCellFiltering !== false,
				enableColumnFiltering: enableColumnFiltering !== false,
				enableColumnGrouping: enableInfiniteScroll ? false : enableColumnGrouping !== false,
				enableDataVisualization: enableDataVisualization !== false,
				enableColumnSorting: enableColumnSorting !== false,
				enableDeclarativeActions: enableDeclarativeActions !== false,
				enableInfiniteScroll,
				enableColumnCalculations,
				enableQuickEdit: enableQuickEdit !== false,
				enableReferenceLinks: enableReferenceLinks !== false,
				enableToggleAllGroups: (enableInfiniteScroll || nestBy || enableRelatedHierarchy) ? false : enableToggleAllGroups !== false,
				enableRowSelector: true,
				onlyEnableSelectionWhenRequiredByActions: onlyEnableSelectionWhenRequiredByActions !== false,
        enableOnlySingleSelection: enableOnlySingleSelection !== false,
        enableCardClickOpen: enableCardClickOpen !== false,
        enableRelatedHierarchy
			}
		: 	currentFeatureFlags;

   function getRowLimitData() {
	const JAVA_MAX_INT_LIMIT = 2147483647;
        const rowsPerPage = gs.getProperty('glide.ui.per_page');
        let rowLimitOptions = [10, 20, 50, 100];
        let rowLimit;
        if (rowsPerPage && rowsPerPage.trim()) {
            rowLimitOptions = Array.from(
                new Set(
                    rowsPerPage
                    .split(',')
                    .map(Number)
                    .filter(isValidLimitValue)
                )
            );
        }

        function isValidLimitValue(val) {
            return Number.isInteger(val) && val > 0 && val <= JAVA_MAX_INT_LIMIT;
        }

        function addLimitToOptions(val) {
            if (isValidLimitValue(val) && !rowLimitOptions.includes(val)) {
                rowLimitOptions.push(val);
            }
        }

        function getRowCountPreference() {
            let rowLimitUserPref = gs.getUser().getPreference('rowcount') || 0;
            if (rowLimitUserPref) {
                rowLimitUserPref = parseInt(rowLimitUserPref);
                rowLimitUserPref = rowLimitOptions.includes(rowLimitUserPref) ?
                    rowLimitUserPref :
                    0;
            }
            return rowLimitUserPref;
        }
        //add limit if not exists
        addLimitToOptions(limit);
        rowLimit = limit || getRowCountPreference();
        if (!rowLimit || rowLimit > JAVA_MAX_INT_LIMIT) {
            //add default limit to limit options
            rowLimit = 20;
            addLimitToOptions(rowLimit);
        }
        rowLimitOptions = rowLimitOptions.sort(function (a,b) {
            return a-b;
	});
        return {
            rowLimitOptions,
            rowLimit
        };
    }

     const {
        rowLimit,
        rowLimitOptions
    } = getRowLimitData();

	const GROUP_BY_LIMIT = 20;

    function isGrouped (query) {
		if (enableInfiniteScroll) return false;

		const groupRegex = /\^GROUPBY[a-z_]+\^|\^GROUPBY[a-z_]+$|^GROUPBY[a-z_]+\^|^GROUPBY[a-z_]+$/;
		const regex = new RegExp(groupRegex);
		return regex.exec(query) != null || !!groupBy;
	}

    function getOffset (page, _limit, q) {
		const grouped = isGrouped(q);

		if (grouped || input.aiGroupInfo?.requestedType == "grouped") return parseInt(page) * GROUP_BY_LIMIT;

		return page * _limit;
	}

	const offset = getOffset(currentPage, rowLimit, query);

    // DEF0601769: If live-list is enabled, set recordCountLimit to liveListThreshold
    // to prevent fuzzyCount from interfering with live-list functionality.
	let { recordCountLimit } = input;
	const ignoreTotalCount = Number.isInteger(recordCountLimit) && recordCountLimit >= 0;
	const isLiveListEnabled = gs.getProperty('glide.lists.live_list_enabled', 'false') === 'true';
	if (ignoreTotalCount && isLiveListEnabled) {
		recordCountLimit = parseInt(gs.getProperty('glide.lists.live_list_threshold', 20000));
	}

	// 1 is added to identify if recordCountLimit <= total number of records and so to decide if "+"
	// should be appended to the displayed count or not
	// Case (when total records > rowLimit > recordCountLimit):
	// page has more records to display than the recordCountLimit, and so to the graphQL we send rowLimit + offset.
	const getAdjustedRecordCountLimit = () => {
		if (!ignoreTotalCount)
			return null;
		const adjustedLimit = rowLimit > recordCountLimit ? rowLimit : recordCountLimit;
		return adjustedLimit + 1;
	};

   // While fetching child rows, we use query as full query and set fixedQuery to empty
   const isNestedChildrenRow = childQuery && nestBy;
   const childOffset = 0;
   const childLimit = childrenRowLimit;
   var totalItemsFetched;
   if (isNestedChildrenRow) {
     query = childQuery;
     if (query.includes('GROUPBY')) {
            var delimiterIndex = query.indexOf('^');
            query = query.substring(delimiterIndex + 1, query.length);
            delimiterIndex = query.indexOf('^');
            query = delimiterIndex > -1 ? query.substring(delimiterIndex + 1, query.length) : query;
      }
     fixedQuery = '';
     // Here we calculate total items to be fetched by multiplying Child Limit with page number and then adding childlimit.
     totalItemsFetched = (currentPageForChild) ? (childLimit * currentPageForChild) + childLimit : childLimit;
  }
  var aiListConfig = {};
  try {
    aiListConfig = new sn_now_list_common.ListAIConfigBuilder().buildMRAConfig(input.skillConfiguration, table, input.aiGroupInfo) || {};
  } catch (e) {
    gs.warn('Now List Input Transform: Failed to build AI list config. ' + e.message);
  }
 
	return {
		...input,
		currentPage,
		enableInfiniteScroll,
		enableColumnCalculations,
		fixedQuery: fixedQuery,
		allowSharing: configurationId?.length > 0 && !menuLoaded,
		featureFlags,
		ignoreTotalCount,
		isDeclarativeActionsRequired: featureFlags.enableDeclarativeActions,
		limit: isNestedChildrenRow ? totalItemsFetched : rowLimit,
		offset: isNestedChildrenRow ? childOffset : offset,
		query: query.includes('GROUPBY') || !currentGrouping ? query : `${query}^GROUPBY${groupBy}`,
		recordCountLimit: getAdjustedRecordCountLimit(),
		rowLimitOptions,
		currentPageForChild,
		table: configurationId && !menuLoaded ? '' : table,
		source: listType === 'related' ? 'related_list' : 'list',
		enableRelatedHierarchy,
		aiListConfig: JSON.stringify(aiListConfig)
	};
}
