/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {

    var tables = api.context.props.allTables;
    if (!tables || tables.length == 0)
        return [];

    var activeRules = api.context.props.allRuleCounts;

    function applySearch(tables) {
        var searchText = api.state.searchText || '';
        // If searchtext is not empty, apply search
        if (searchText.length) {
            searchText = searchText.toLowerCase();
            tables = tables.filter(table => table.label.toLowerCase().includes(searchText) || table.name.toLowerCase().includes(searchText));
        }
        return tables;
    }

    function getGrowthPercent(table) {
        if (isNaN(table.growthPercent) || !Number.isFinite(table.growthPercent))
            return Number.MAX_SAFE_INTEGER + "%";

        const growth = table.growthPercent.toFixed(2);
        const sign = growth > 0 ? "+" : "";
        return sign + growth + "%";
    }

    function getRows(tables) {
        return tables.map((table) => {
            var growthPercent = getGrowthPercent(table);
            var tableSize = table.size.toFixed(2);
            var activeRulesCount = activeRules[table.name] ? activeRules[table.name] : 0;
            var liveTablesUIConfigMap = {
                action: helpers.translateSync("View records"),
                status: helpers.translateSync("Active"),
                color: "green"
            };
            var arhivedTablesUIConfigMap = {
                action: helpers.translateSync("View records"),
                status: helpers.translateSync("Archive"),
                color: "purple"
            };

            return {
                cells: {
                    table: {
                        tableName: table.name,
                        value: table.label
                    },
                    size: {
                        value: tableSize
                    },

                    growth: {
                        value: growthPercent
                    },
                    activeRules: {
                        value: activeRulesCount
                    },
                    status: {
                        "highlightedValue": {
                            "color": table.tableCategory && table.tableCategory == "archive" ? arhivedTablesUIConfigMap.color : liveTablesUIConfigMap.color,
                            "value": table.tableCategory && table.tableCategory == "archive" ? arhivedTablesUIConfigMap.status : liveTablesUIConfigMap.status
                        }
                    },
                    action: {
                        "value": "view_tables_action",
                        "componentProps": {
                            "label": table.tableCategory && table.tableCategory == "archive" ? arhivedTablesUIConfigMap.action : liveTablesUIConfigMap.action,
                            "size": "sm",
                            "variant": "secondary"
                        }
                    }
                },
                key: table.name
            };
        });
    }

    tables = applySearch(tables);
    var rows = getRows(tables);

    var currentPage = api.state.currentPage;
    var rowsPerPage = api.state.rowsPerPage;

    var startIndex = currentPage * rowsPerPage;
    var endIndex = Math.min(startIndex + rowsPerPage, rows.length);

    return {
        customCellEmittedActions: [
            'NOW_BUTTON#CLICKED'
        ],
        rows: rows.filter((obj, index) => {
            return index >= startIndex && index < endIndex;
        })
    };
}
