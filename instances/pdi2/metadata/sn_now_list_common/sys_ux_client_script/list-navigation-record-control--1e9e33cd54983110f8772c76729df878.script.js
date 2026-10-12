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
    const {
        validateDirtyStatus
    } = imports['sn_now_list_common.ListControllerUtils']();
    if (validateDirtyStatus(...arguments))
        return;

    const {
        typeOfRecord,
        sysId
    } = event.payload;
    const {
        navigationPaneState = {},
        hasPageChanged,
        navigationType,
    } = api.state;

    const isWorkspaceFuzzyCountEnabled = api.data.sn_record_list_data_broker.out?.tableMetadata?.workspaceFuzzyCount > 0;
    const INFINITE_SCROLL_END_OF_LIST_ROW_KEY = 'infiniteScrollEndOfListRow';
    const DEFAULT_ROW_TYPE = 'default';

    const {
        totalRecordCount,
        currentPage,
        rowLimit,
        omitCountData,
        fuzzyCount,
        groupCount
    } = api.data.sn_record_list_data_broker.out?.paginationProps;

    const {
        enableInfiniteScroll
    } = api.data.sn_record_list_data_broker.out;

    const isFuzzyCountEnabled = api.context.props.recordCountLimit > 0;
    const isGrouped = groupCount > 0;

    const allRows = api.data.sn_record_list_data_broker.out?.rowDefinitions?.rows || [];
    const rowsOnPage = !enableInfiniteScroll && !isGrouped
        ? filterNonRecordRows(allRows)
        : allRows;

    let hasPreviousPage = currentPage > 0;
    // Set hasNextPage based on whether omit count or fuzzy count is enabled
    let hasNextPage;
    if (isGrouped || enableInfiniteScroll) {
        hasNextPage = false;
        hasPreviousPage = false;
    } else if (omitCountData != null) {
        hasNextPage = omitCountData.hasNextPage
    } else if (isFuzzyCountEnabled || isWorkspaceFuzzyCountEnabled) {
        hasNextPage = !fuzzyCount.hideGoToNext
    } else {
        hasNextPage = currentPage < Math.ceil(totalRecordCount / rowLimit) - 1;
    }

    // Set resultRecordSysId,isFirstRecord,isLastRecord and update state when new page got loaded through navigation pane
    if (hasPageChanged && typeOfRecord == 'pageNavigated') {
        setIntialStateOnNewPage({
            rowsOnPage,
            hasPreviousPage,
            hasNextPage,
            navigationType,
            navigationPaneState
        });
    } else if (['current', 'next', 'previous'].includes(typeOfRecord)) {
        // Set resultRecordSysId,isFirstRecord,isLastRecord and update state when record navigation operation happens
        setInitialStateOnNavigationOperation({
            rowsOnPage,
            hasPreviousPage,
            hasNextPage,
            currentPage,
            navigationPaneState,
            typeOfRecord
        });
    }

    // find disabled state for pane buttons and previous/next record sys_ids and update navigationPaneState.
    function updateStateNavigationPane(rowsOnPage, resultRecordSysId, isFirstRecord, isLastRecord, hasPreviousPage, hasNextPage, isEndOfInfiniteScrollPageReached) {
        var navigationPaneState = {};
        const rowIndex = rowsOnPage.findIndex(row => row['key'] === resultRecordSysId);
        const previousRowIndex = rowIndex - 1;
        const nextRowIndex = rowIndex + 1;

        const disablePreviousRecordNavigation = rowsOnPage[previousRowIndex] ? false : (isFirstRecord && !hasPreviousPage ? true : false);
        let disableNextRecordNavigation;
        if (enableInfiniteScroll) {
            disableNextRecordNavigation = !rowsOnPage[nextRowIndex] || rowsOnPage[nextRowIndex]?.key === INFINITE_SCROLL_END_OF_LIST_ROW_KEY;
        } else {
            disableNextRecordNavigation = rowsOnPage[nextRowIndex] ? false : (isLastRecord && !hasNextPage ? true : false);
        }

        navigationPaneState.previousRecordSysId = disablePreviousRecordNavigation ? null : (isFirstRecord ? null : rowsOnPage[previousRowIndex]?.key);
        navigationPaneState.nextRecordSysId = disableNextRecordNavigation ? null : (isLastRecord ? null : rowsOnPage[nextRowIndex]?.key);
        navigationPaneState.currentRecordSysId = resultRecordSysId;
        navigationPaneState.disablePreviousRecordNavigation = disablePreviousRecordNavigation;
        navigationPaneState.disableNextRecordNavigation = disableNextRecordNavigation;
        navigationPaneState.isEndOfInfiniteScrollPageReached = isEndOfInfiniteScrollPageReached;
        api.setState('navigationPaneState', navigationPaneState);

        api.emit('LIST_CTRL#SET_HIGHLIGHTED_ROWS', {
            rowKeys: [resultRecordSysId]
        });

        // Prevents reopening of the panel when navigating using up/down arrows
        if (sysId) {
            api.emit('LIST_CTRL#OPEN_PANEL', {
                route: 'quick-edit',
                fields: {
                    sysId: resultRecordSysId
                }
            });
        }
    }

    function setIntialStateOnNewPage(navigationObj) {
        let resultRecordSysId;
        let isLastRecord;
        let isFirstRecord;
        let isEndOfInfiniteScrollPageReached;
        const {
            rowsOnPage,
            hasPreviousPage,
            hasNextPage,
            navigationType,
            navigationPaneState
        } = navigationObj;

        if (navigationType == 'nextPage' && enableInfiniteScroll) {
            resultRecordSysId = navigationPaneState.currentRecordSysId;
            isLastRecord = resultRecordSysId === rowsOnPage[rowsOnPage.length - 1]?.key || rowsOnPage[rowsOnPage.length - 1]?.key === INFINITE_SCROLL_END_OF_LIST_ROW_KEY; 
            isEndOfInfiniteScrollPageReached = isLastRecord;
        } else if (navigationType == 'nextPage') {
            resultRecordSysId = rowsOnPage[0].key;
            isFirstRecord = true
            isLastRecord = resultRecordSysId === rowsOnPage[rowsOnPage.length - 1].key
        } else if (navigationType == 'previousPage') {
            resultRecordSysId = rowsOnPage[rowsOnPage.length - 1]?.key
            isLastRecord = true
        }
        updateStateNavigationPane(rowsOnPage, resultRecordSysId, isFirstRecord, isLastRecord, hasPreviousPage, hasNextPage, isEndOfInfiniteScrollPageReached);
        api.setState('hasPageChanged', false);
    }

    function setInitialStateOnNavigationOperation(navigationObj) {
        let resultRecordSysId;
        let isLastRecord;
        let isFirstRecord;
        const {
            hasPreviousPage,
            hasNextPage,
            currentPage,
            navigationPaneState,
            typeOfRecord
        } = navigationObj;
        let {
            rowsOnPage
        } = navigationObj;

        const nextRecordSysId = navigationPaneState?.nextRecordSysId;
        const previousRecordSysId = navigationPaneState?.previousRecordSysId;
        const isEndOfInfiniteScrollPageReached = !!navigationPaneState?.isEndOfInfiniteScrollPageReached;

        if (typeOfRecord == 'current') resultRecordSysId = sysId;
        else if (typeOfRecord == 'next') resultRecordSysId = nextRecordSysId
        else if (typeOfRecord == 'previous') resultRecordSysId = previousRecordSysId

        if (isGrouped) {
            rowsOnPage = getCurrentGroupRows(rowsOnPage, resultRecordSysId);
        }

        isLastRecord = resultRecordSysId === rowsOnPage[rowsOnPage.length - 1]?.key;
        isFirstRecord = resultRecordSysId === rowsOnPage[0]?.key;

        if (
            enableInfiniteScroll &&
            !isGrouped &&
            isLastRecord &&
            typeOfRecord == 'next' &&
            !isEndOfInfiniteScrollPageReached
        ) {
            // Ensures that next records are loaded when the user navigates to the last record using arrow keys, in scenarios where scrolling fails due to an unspecified height.
            api.emit('LIST_CTRL#VIRTUALIZED_SCROLL_BOTTOM_REACHED');
            api.setState('hasPageChanged', true);
            api.setState('navigationType', 'nextPage');
        } else if (nextRecordSysId == null && hasNextPage && typeOfRecord == 'next') {
            api.emit('LIST_CTRL#SET_PAGE', {
                currentPage: currentPage + 1
            });
            api.setState('hasPageChanged', true);
            api.setState('navigationType', 'nextPage');
            return;
        } else if (previousRecordSysId == null && hasPreviousPage && typeOfRecord == 'previous') {
            api.emit('LIST_CTRL#SET_PAGE', {
                currentPage: currentPage - 1
            });
            api.setState('hasPageChanged', true);
            api.setState('navigationType', 'previousPage');
            return;
        }
        updateStateNavigationPane(rowsOnPage, resultRecordSysId, isFirstRecord, isLastRecord, hasPreviousPage, hasNextPage, isEndOfInfiniteScrollPageReached)
    }

    function getCurrentGroupRows(groupedRows, recordSysId) {
        for (const row of groupedRows) {
            const rowIndex = row.children?.findIndex(
                (row) => row['key'] === recordSysId
            );
            if (rowIndex > -1) {
                return filterNonRecordRows(row.children || []);;
            }
        }
        return [];
    }

    function filterNonRecordRows(rows) {
        return rows.filter(row => row.type === DEFAULT_ROW_TYPE);
    }
}
