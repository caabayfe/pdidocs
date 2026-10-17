function include(proxyArg, params) {
    const { api, event, helpers, imports } = params;
    const SORT_ASCENDING = "ascending";
    const SORT_DESCENDING = "descending";
    const SORT_NONE = "none";
    const INITIAL_INDEX = { "lastRowIdentifier": "", "lastRowSysId": "" };
    const INITIAL_VISIBLE_PAGES = 2;

    const metadata = {
        "isSortable": true,
        "internalType": "string",
    };
    const getColumnDefinitionsObject = async function() {
        return {
            columns: [
                {
                    key: 'cmdb_policy.name',
                    type: 'link',
                    label: await helpers.translate('Policy instance'),
                    renderAsLink: true
                },
                {
                    key: 'number',
                    type: 'string',
                    label: await helpers.translate('Execution number')
                },
                {
                    key: 'instance_state',
                    type: 'string',
                    label: await helpers.translate('State')
                },
                {
                    key: 'percent_complete',
                    type: 'string',
                    label: await helpers.translate('Percent complete')
                },
                {
                    key: 'due_date',
                    type: 'string',
                    label: await helpers.translate('Date due')
                },
                {
                    key: 'total_task_count',
                    type: 'number',
                    label: await helpers.translate('Total tasks')
                },
                {
                    key: 'completed_task_count',
                    type: 'number',
                    label: await helpers.translate('Complete')
                },
                {
                    key: 'open_task_count',
                    type: 'number',
                    label: await helpers.translate('Open')
                },
                {
                    key: 'unassigned_task_count',
                    type: 'number',
                    label: await helpers.translate('Unassigned')
                }
            ]
        }
    }

    const getHighlightedValue = (instanceState) => {
        const { label, value } = instanceState;
        let color;
        switch (value) {
            case 4:
                color = 'critical';
                break;
            case 3:
                color = 'green';
                break;
            case 2:
                color = 'info';
                break;
            case 1:
                color = 'gray';
                break;
            default:
                return 'gray';
        }
        return {
            value: label,
            variant: 'primary',
            color: color,
            showIcon: false
        }

    }

    const getColumnDefinitions = async function (isDesc, sortColumn) {
        var SORTED_A_Z = await helpers.translate("Sorted A-Z");
        var SORTED_Z_A = await helpers.translate("Sorted Z-A");
        const { columns } = await getColumnDefinitionsObject();
        columns.forEach((column) => {
            column.metadata = metadata;
            if (column.key == sortColumn) {
                if (isDesc) {
                    column.sortDirection = SORT_DESCENDING;
                    column.icons = {
                        "endIcons": [{
                            value: "caret-down-fill",
                            label: SORTED_Z_A
                        }]
                    };
                } else {
                    column.sortDirection = SORT_ASCENDING;
                    column.icons = {
                        "endIcons": [{
                            value: "caret-up-fill",
                            label: SORTED_A_Z
                        }]
                    };
                }
            } else {
                    column.icons = {};
                    column.sortDirection = SORT_NONE;
                }

        });
        return {
            columns: columns,
            columnHeaderTextTooltip: await helpers.translate('Sort')
        }
    }

    const getCertificationDashboardRows = (instanceDataList) => {
        const rowDefinitions = {};
        const rows = instanceDataList.map((instance) => {
            const {
                executionInstanceId,
                instanceNumber,
                policyName,
                totalTaskCount,
                completedTaskCount,
                openTaskCount,
                unassignedTaskCount,
                dueDate,
                instanceState,
                percentComplete
            } = instance;
            return {
                key: executionInstanceId,
                cells: {
                    'cmdb_policy.name': {
                        value: policyName,
                        label: policyName
                    },
                    'number': {
                        value: instanceNumber
                    },
                    'instance_state': {
                        value: instanceState.label,
                        highlightedValue: getHighlightedValue(instanceState)
                    },
                    'percent_complete': {
                        value: percentComplete
                    },
                    'due_date': {
                        value: dueDate
                    },
                    'total_task_count': {
                        value: totalTaskCount
                    },
                    'completed_task_count': {
                        value: completedTaskCount
                    },
                    'open_task_count': {
                        value: openTaskCount
                    },
                    'unassigned_task_count': {
                        value: unassignedTaskCount
                    }
                }
            }
        });
        rowDefinitions['rows'] = rows;
        return rowDefinitions;
    }

    const getSortByFieldOptions = async function() {
        const { columns } = await getColumnDefinitionsObject();
        return columns.map((column) => {
            return { "id": column.key, "label": column.label }
        });
    }

    const resetPaginationIndexes = () => {
        api.setState('currentStartIndex', INITIAL_INDEX);
        api.setState('currentPageNumber', 0);
        api.setState('startIndexHistory', []);
        api.setState('nextStartIndex', INITIAL_INDEX);
        api.setState('visiblePages', INITIAL_VISIBLE_PAGES);
    }

    const areArraysEqual = (arr1 = [], arr2 = []) => {
        if (arr1.length !== arr2.length) return false;

        const sorted1 = [...arr1].sort();
        const sorted2 = [...arr2].sort();

        return sorted1.every((val, index) => val === sorted2[index]);
    }

    return {
        getColumnDefinitions,
        getCertificationDashboardRows,
        getHighlightedValue,
        getSortByFieldOptions,
        resetPaginationIndexes,
        areArraysEqual,
        SORT_ASCENDING,
        INITIAL_INDEX,
        SORT_DESCENDING,
        SORT_NONE
    }
}
