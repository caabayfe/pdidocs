var ProductInfoHelper = Class.create();
ProductInfoHelper.prototype = {
    initialize: function() {
        this.pluginInfoHelper = new PluginInfoHelper();
        this.productsData = new ProductsData();
        this.productsDao = new ProductsDao();
    },

    _getProductsFromPlugins: function(searchExpression, filterParams) {
        var map = {};
        var products = [];
        var plugins = this.pluginInfoHelper.getAllMatchedPluginsByProductName(searchExpression, filterParams);
        plugins.forEach(function(plugin) {
            if (!map[plugin.lineage_id]) {
                map[plugin.lineage_id] = {
                    productId: plugin.lineage_id,
                    productName: plugin.lineage_name,
                    source: 'platform'
                };
                products.push(map[plugin.lineage_id]);
            }
        });
        return products;
    },

    _getProductsFromAvailableApps: function(searchExpression, filterParams, apiUtil) {
        return this.productsDao.getProducts(searchExpression, filterParams, apiUtil);
    },

    getProducts: function(apiUtil) {
        var params = apiUtil.getRequestParams();
        var searchExpression = params.queryParams[Constants.SEARCH_EXPRESSION];
        var filterParams = apiUtil.getRequestBody();

        var pluginProducts = this._getProductsFromPlugins(searchExpression, filterParams);
        var appProducts = this._getProductsFromAvailableApps(searchExpression, filterParams, apiUtil);
        var products = CommonUtils.getUnionOfProducts(pluginProducts, appProducts);
        products.sort(this._sortProductsByName);

        var response = CommonUtils.getResultByParams(products, params.queryParams);
        apiUtil.addTotalCountHeader(products.length);
        return response;
    },

    getProduct: function(params) {
        var productId = params.pathParams[Constants.PRODUCT_ID];
        var source = CommonUtils.getProductSource(params.queryParams);
        return this._getProductById(productId, source);
    },

    _getProductById: function(productId, source) {
        var productScheduleDetails = this._getProductScheduleDetailsById(productId);
        var tracker = new ProgressTracker().getInProgressInstallationByAppId(productId);
        if (source == Constants.PLATFORM) {
            var plugins = this.pluginInfoHelper.getAllPluginsByProductId(productId);
            return {
                productId: productId,
                install_tracker_id: tracker.id,
                productName: this._getProductNameByPlugins(plugins),
                plugins: plugins,
                productScheduleDetails: productScheduleDetails,
                userDateFormat: gs.getDateFormat()
            };
        } else {
            var apps = this.getAllAppsByProductId(productId);
            return {
                productId: productId,
                install_tracker_id: tracker.id,
                productName: this._getProductNameByApps(apps, productId),
                apps: apps,
                productScheduleDetails: productScheduleDetails,
                userDateFormat: gs.getDateFormat()
            };
        }
    },

    getAllAppsByProductId: function(productId) {
        return this.productsDao.getAllAppsByProductId(productId);
    },

    _getProductNameByApps: function(apps, productId) {
        var app = apps[0] || {};
        var productFamilies = app.products || [];
        for (var idx in productFamilies) {
            if (productFamilies[idx].productId == productId)
                return productFamilies[idx].productName;
        }
    },

    _getProductNameByPlugins: function(plugins) {
        return plugins[0] && plugins[0].lineage_name;
    },

    _sortProductsByName: function(x, y) {
        var a = x.productName.toLowerCase();
        var b = y.productName.toLowerCase();
        if (a < b)
            return -1;
        else if (a > b)
            return 1;
        return 0;
    },

    _getProductScheduleDetailsById: function(productId) {
        var allSchedules = new ScheduledInstallService().fetchAllActiveScheduledItems();
        var productScheduleDetails = {};
        if (allSchedules.hasOwnProperty(productId)) {
            var productScheduleId = allSchedules[productId].schedule_id;
            for (var key in allSchedules) {
                if (allSchedules[key].schedule_id == productScheduleId) {
                    productScheduleDetails[key] = allSchedules[key];
                    if (productScheduleDetails[key].hasOwnProperty("scheduled_on")) {
                        var scheduledTime = productScheduleDetails[key].scheduled_on.split('|')[0];
                        if (scheduledTime) {
                            var glideDateTime = new GlideDateTime(scheduledTime);
                            glideDateTime.setDisplayValue(scheduledTime);
                            productScheduleDetails[key].schedule_time_ui = glideDateTime ? glideDateTime.getDisplayValueLang("medium") : "";
                            productScheduleDetails[key].schedule_date_default_format = glideDateTime ? glideDateTime.getLocalDate().getByFormat("yyyy-MM-dd") : "";
                            productScheduleDetails[key].schedule_time_default_format = glideDateTime ? glideDateTime.getLocalTime().getByFormat("HH:mm:ss") : "";
                        }
                    }
                }
            }
        }
        return productScheduleDetails;
    },

    type: 'ProductInfoHelper'
};
