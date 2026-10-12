var SOWRecordTabUtilSNC = Class.create();
SOWRecordTabUtilSNC.prototype = {
    initialize: function() {},

    PAGE_COLLECTION: {
        '493dc40c43fa2110f20fff53e9b8f238': {
            'position': 'left'
        },
        '353dc40c43fa2110f20fff53e9b8f206': {
            'position': 'middle'
        },
        'd7ec000c43fa2110f20fff53e9b8f269': {
            'position': 'right'
        }
    },

    TABLE: {
        SYS_UX_APP_ROUTE: {
            NAME: "sys_ux_app_route",
            FIELD: {
                EXTENSION_POINT: 'extension_point',
                ROUTE_TYPE: 'route_type',
                ORDER: 'order'
            }
        }
    },
    CATALOG_TABLES: ["sc_cat_item", "sc_cat_item_producer", "sc_cat_item_guide"],
    EXCLUDED_TABLES: ["incident", "incident_task", "problem", "problem_task", "change_request", "change_task", "sc_request", "sc_task", "interaction", "sc_req_item"],

    getHorizontalTabsInfo: function() {
        var output = {
            left: [],
            middle: [],
            right: []
        };
        var encodedQuery = this.TABLE.SYS_UX_APP_ROUTE.FIELD.EXTENSION_POINT + 'IN' + Object.keys(this.PAGE_COLLECTION).join();
        var appRouteGR = new GlideRecord(this.TABLE.SYS_UX_APP_ROUTE.NAME);
        appRouteGR.addEncodedQuery(encodedQuery);
        appRouteGR.orderBy(this.TABLE.SYS_UX_APP_ROUTE.FIELD.ORDER);
        appRouteGR.query();
        while (appRouteGR.next()) {
            var pageCollectionObj = this.PAGE_COLLECTION[appRouteGR.getValue(this.TABLE.SYS_UX_APP_ROUTE.FIELD.EXTENSION_POINT)];
            if (gs.nil(pageCollectionObj) || typeof pageCollectionObj != 'object')
                continue;
            output[pageCollectionObj.position].push(appRouteGR.getValue(this.TABLE.SYS_UX_APP_ROUTE.FIELD.ROUTE_TYPE));
        }
        return output;
    },

    getPageVariantForRecordTable: function(params) {
        if (this.EXCLUDED_TABLES.includes(params.table)) {
            return {
                variantToLoad: ""
            };
        }
        if (this.CATALOG_TABLES.includes(params.table)) {
            return {
                variantToLoad: "CatalogItemPageSNC"
            };
        }
        var result = "";

        for (var i = 0; i < this.CATALOG_TABLES.length; i++) {
            var table = new GlideTableHierarchy(this.CATALOG_TABLES[i]);
            var childTables = table.getTableExtensions();
            if (childTables.indexOf(params.table) >= 0) {
                result = "CatalogItemPageSNC";
                break;
            }
        }
        return {
            variantToLoad: result
        };

    },

    type: 'SOWRecordTabUtilSNC'
};
