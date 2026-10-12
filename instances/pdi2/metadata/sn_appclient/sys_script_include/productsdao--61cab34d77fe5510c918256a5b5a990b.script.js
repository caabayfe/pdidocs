var ProductsDao = Class.create();
ProductsDao.prototype = {
    initialize: function() {
        this.appsData = new AppsData();
    },

    getProducts: function(searchExpression, filterParams, apiUtil) {
        var products = [];
        var gr = new GlideRecord("sn_appclient_product");
        var encodedQuery = "";
        if (searchExpression)
            encodedQuery = CommonUtils.getEncodedQueryFromExpression(searchExpression, "name");
        var productFamily = this.getProductFamily(filterParams);
        if (productFamily && productFamily.length > 0)
            encodedQuery = CommonUtils.appendEncodedQueryFromproductFamily(searchExpression, encodedQuery, productFamily);
        if (encodedQuery.length !== 0) {
            gr.addEncodedQuery(encodedQuery);
            gr.query();
            while (gr.next()) {
                var productId = gr.getValue("id");
                var productName = gr.getValue("name");
                var family = gr.getValue("family");
                products.push({
                    productId: productId,
                    productName: productName,
                    productFamily: family,
                    source: 'store'
                });
            }
        }
        var productsForFilters = this.getProductForApps(apiUtil);
        var filteredProducts = CommonUtils.getUnionOfProducts(products, productsForFilters);
        return filteredProducts;
    },
    getProductFamily: function(filterParams) {
        var productFamily = [];
        if (filterParams.hasOwnProperty('productFamily'))
            productFamily = filterParams['productFamily'];
        return productFamily;
    },
    getProductForApps: function(appManagerAPIUtil) {
        var args = {};
        args.searchTerm = appManagerAPIUtil.getSearchTerm();
        args.filterParams = appManagerAPIUtil.getRequestBody();
        args.encodedQuery = this._getEncodedQueryBySearchContext(args);
        var gr = new GlideRecord('sys_remote_app');
        gr.addEncodedQuery(args.encodedQuery);
        gr.query();
        var productsForFilters = [];
        var productIdMap = {};
        while (gr.next()) {
            var products = JSON.parse(gr.products);
            if (products && products.length > 0)
                for (var i = 0; i < products.length; i++) {
                    var productFamily = products[i];
                    var productList = productFamily.productList;
                    for (var proIndex = 0; proIndex < productList.length; proIndex++) {
                        var newProduct = productList[proIndex];
                        if (!productIdMap.hasOwnProperty(newProduct.productId)) {
                            productIdMap[newProduct.productId] = newProduct;
                            productsForFilters.push({
                                productId: newProduct.productId,
                                productName: newProduct.productName,
                                productFamily: newProduct.product_family,
                                source: 'store'
                            });
                        }
                    }
                }
        }
        return productsForFilters;
    },
    _getEncodedQueryBySearchContext: function(args) {
        var encodedQuery = "shared_internally=" + !!args.sharedInternally;
        if (args.searchTerm)
            encodedQuery += "^GOTO123TEXTQUERY321=" + args.searchTerm;
        if (args.filterParams && Object.keys(args.filterParams).length > 0)
            encodedQuery = this._appendEncodedQueryByFilterParams(encodedQuery, args.filterParams);
        if (!gs.getUser().hasRole("maint"))
            encodedQuery += "^hide_on_ui=false";
        return encodedQuery;
    },
    _appendEncodedQueryByFilterParams: function(encodedQuery, filterParams) {
        var LOBs = [];
        var productFamily = [];
        var adoptionBluePrint = [];
        var offeredBy = [];
        var listings = [];
        if (filterParams.hasOwnProperty('productFamily'))
            LOBs = filterParams['productFamily'];
        if (filterParams.hasOwnProperty('productFamily'))
            productFamily = filterParams['productFamily'];
        if (filterParams.hasOwnProperty('offeredBy'))
            offeredBy = filterParams['offeredBy'];
        if (filterParams.hasOwnProperty('adoptionBlueprint'))
            adoptionBluePrint = filterParams['adoptionBlueprint'];
        if (filterParams.hasOwnProperty('listings'))
            listings = filterParams['listings'];

        var isfreeToTryPresent = listings.indexOf('free_to_try') != -1;
        if (isfreeToTryPresent) {
            encodedQuery += "^price_type=free";
        }
        if (offeredBy != null && offeredBy.length == 1)
            if (offeredBy[0] === 'partners')
                encodedQuery += "^vendor!=" + 'servicenow';
            else
                encodedQuery += "^vendor=" + offeredBy[0];

        if (LOBs != null && LOBs.length > 0)
            for (i = 0; i < LOBs.length; i++) {
                if (i > 0) encodedQuery += "^OR";
                else encodedQuery += "^";
                encodedQuery += "lobLIKE" + LOBs[i];
            }
        if (productFamily != null && productFamily.length > 0)
            for (i = 0; i < productFamily.length; i++) {
                if (i > 0 || (LOBs && LOBs.length > 0)) encodedQuery += "^OR";
                else encodedQuery += "^";
                encodedQuery += "productsLIKE" + productFamily[i];
            }
        if (adoptionBluePrint != null && adoptionBluePrint.length > 0) {
            adoptionBluePrintQuery = this.getEncodedQueryByAdoptionBluePrint(adoptionBluePrint);
            appNames = new AppManagerFiltersUtil().getFilteredIdsWithAdoptionBluePrint(adoptionBluePrintQuery);
            if (appNames != null && appNames.length > 0)
                for (i = 0; i < appNames.length; i++) {
                    if (i > 0) encodedQuery += "^OR";
                    else encodedQuery += "^";
                    encodedQuery += "name=" + appNames[i];
                }
        }
        return encodedQuery;
    },
    getEncodedQueryByAdoptionBluePrint: function(adoptionBluePrint) {
        var adoptionBluePrintQuery = "";
        for (var i = 0; i < adoptionBluePrint.length; i++) {
            if (i > 0) adoptionBluePrintQuery += "^OR";
            adoptionBluePrintQuery += "objective.sys_id=" + adoptionBluePrint[i];
        }
        return adoptionBluePrintQuery;
    },
    getAllAppsByProductId: function(productId) {
        // get Installed apps
        var gr = new GlideRecord("sys_store_app");
        var versionComparator = new sn_appclient.VersionComparator();
        gr.addEncodedQuery('active=true^products!=[]^productsLIKE' + productId);
        gr.query();
        var installedAppsMap = {};
        while (gr.next()) {
            var sourceAppId = gr.sys_id;
            var app = this.appsData.getAppInfoFromInstance(sourceAppId, gr, true);
            app.hide_on_ui = gr.getValue('hide_on_ui');
            app.licensable = gr.getValue('licensable');
            app.isUpdateAvailable = versionComparator.isUpgrade(app.version , app.latest_version);
            if (this.appsData.isVisible(gr)) installedAppsMap[sourceAppId] = app;
        }

        // get available apps
        gr = new GlideRecord("sys_remote_app");
        gr.addEncodedQuery('products!=[]^productsLIKE' + productId);
        gr.query();
        var availableAppsMap = {};
        while (gr.next()) {
            sourceAppId = gr.source_app_id;
            if (!installedAppsMap[sourceAppId]) {
                app = this.appsData.getAppInfoFromInstance(sourceAppId, gr, true);
                app.hide_on_ui = gr.getValue('hide_on_ui');
                app.licensable = gr.getValue('licensable');
                if (this.appsData.isVisible(gr)) availableAppsMap[sourceAppId] = app;
            }
        }
        var installedApps = CommonUtils.getValues(installedAppsMap);
        var availableApps = CommonUtils.getValues(availableAppsMap);
        return installedApps.concat(availableApps);
    },
    _getAppDetails: function( /*GlideRecord sys_remote_app | sys_store_app */ gr) {
        var app = {};
        app.block_install = gr.getValue('block_install');
        app.compatibilities = gr.getValue('compatibilities');
        app.dependencies = gr.getValue('dependencies');
        app.enforce_license = gr.getValue('enforce_license');
        app.hide_on_ui = gr.getValue('hide_on_ui');
        app.source_app_id = gr.getValue('source_app_id');
        app.installed_as_dependency = gr.getValue('installed_as_dependency');
        app.is_store_app = gr.getValue('is_store_app');
        app.licensable = gr.getValue('licensable');
        app.logo = this.appsData.getLogo(gr);
        app.short_description = gr.getValue('short_description');
        app.needs_app_engine_licensing = gr.getValue('needs_app_engine_licensing');
        app.name = gr.getValue('name');
        app.price_type = gr.getValue('price_type');
        app.latest_version = gr.getValue('latest_version');
        app.uninstall_blocked = gr.getValue('uninstall_blocked');
        app.product = JSON.parse(gr.getValue('products'));
        app.scope = gr.getValue('scope');
        return app;
    },

    /**
     * Synchronize products data from sys_remote_app, and sys_store_app tables
     */
    syncProductsData: function() {
        gs.debug("Running Product Data Sync");
        //prepare product map from sys_remote_app table
        var encodedQuery = 'products!=[]';
        var map = this._getProductMap(Constants.TABLE_SYS_REMOTE_APP, encodedQuery, {});
        //prepare product map from sys_store_app table
        encodedQuery = 'active=true^products!=[]';
        map = this._getProductMap(Constants.TABLE_SYS_STORE_APP, encodedQuery, map);
        //reset products data table with product map
        gr = new GlideRecord("sn_appclient_product");
        gr.query();
        var deleteCount = 0;
        var insertCount = 0;
        while (gr.next()) {
            var productId = gr.getValue("id");
            if (map[productId]) {
                delete map[productId];
            } else {
                gr.deleteRecord();
                deleteCount++;
            }
        }
        for (var key in map) {
            gr.setValue("id", key);
            gr.setValue("name", map[key].productName);
            gr.setValue("family", map[key].product_family);
            gr.insert();
            insertCount++;
        }
        gs.debug("Completed Product Data Sync with {0} insertions, and {1} deletions", insertCount, deleteCount);
    },

    _getProductMap: function(table, encodedQuery, productMap) {
        var map = productMap || {};
        var gr = new GlideRecord(table);
        gr.addEncodedQuery(encodedQuery);
        gr.query();
        while (gr.next()) {
            productFamilies = JSON.parse(gr.getValue("products"));
            productFamilies.forEach(function(family) {
                var productList = family.productList || [];
                productList.forEach(function(product) {
                    map[product.productId] = product;
                });
            });
        }
        return map;
    },

    type: 'ProductsDao'
};
