(function executeQuery(v_table, v_query) {

    const DASHBOARD_TABLE = {
        'dashboard-type-par': 'par_dashboard',
        'dashboard-type-legacy': 'pa_dashboards'
    };
    const VISUALIZATION_TABLE = {
        'REPORT': 'sys_report',
        'VISUALIZATION': 'par_visualization'
    };
    const PREFIX = "[PA Certified Artifacts Table Script] - ";

    try {
        const analyticsCenterUtils = new global.AnalyticsCenterUtil();

        // Add certified dashboards to the v_table rows
        var dashboardReq = {
            tableName: "par_dashboard",
            sortField: "last_updated_on",
            sortDir: "desc",
            perPage: 1000,
            page: 1,
            visibility: "08c73d60537101100834ddeeff7b1287",
            filters: {
                encodedQuery: "active=true",
                quickAccessFilterType: "certified",
                filterConfigurations: [],
                searchQuery: ""
            }
        };
        var dashboardRes = analyticsCenterUtils.getAnalyticsCenterData(dashboardReq);
        dashboardRes?.entities?.forEach(dashboard => {
            try {
                var row = {
                    sys_id: dashboard?.sysId,
                    name: dashboard?.name,
                    document_id: dashboard?.sysId,
                    table_name: DASHBOARD_TABLE[dashboard?.type],
                    libraries: 'dashboards',
                    description: dashboard?.description || '',
                    created_by: dashboard?.createdBy
                };
                v_table.addRow(row);
            } catch (e) {
                gs.error(PREFIX + `Error while adding the dashboard record ${dashboard?.name} - ${dashboard?.sysId}. ` + e);
            }
        });

        // Add certified data visualizations/ reports to the v_table rows
        var vizReq = {
            tableName: "par_visualization",
            sortField: "last_updated_on",
            sortDir: "desc",
            perPage: 1000,
            page: 1,
            visibility: "08c73d60537101100834ddeeff7b1287",
            filters: {
                encodedQuery: "active=true",
                quickAccessFilterType: "certified",
                filterConfigurations: [],
                searchQuery: ""
            }
        };
        var vizRes = analyticsCenterUtils.getAnalyticsCenterData(vizReq);
        vizRes?.entities?.forEach(viz => {
            try {
                var row = {
                    sys_id: viz?.vizId,
                    name: viz?.name,
                    document_id: viz?.vizId,
                    table_name: VISUALIZATION_TABLE[viz?.origin],
                    libraries: 'data_visualizations',
                    description: viz?.description || '',
                    created_by: viz?.createdBy
                };
                v_table.addRow(row);
            } catch (e) {
                gs.error(PREFIX + `Error while adding the visualization record ${viz?.name} - ${viz?.vizId}. ` + e);
            }
        });

    } catch (e) {
        gs.error(PREFIX + `Error while adding records in the PA Certified Artifacts v_table. ` + e);
    }

})(v_table, v_query);
