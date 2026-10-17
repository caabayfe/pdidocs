var ConfigurationHubUtil = Class.create();
ConfigurationHubUtil.prototype = {
    initialize: function() {
        this.CONFIGURATION_HUB_APPLICATION_TABLE_NAME = 'sn_dfc_application';
        this.PACKAGES_TABLE_NAME = 'sys_package';
        this.CONFIGURATION_HUB_PRODUCT_TABLE_NAME = 'sn_dfc_product';
        this.STORE_APP_TABLE_NAME = 'sys_store_app';
        this.UPDATE_TABLE_NAME = 'sys_update';
        this.SCOPE_TABLE_NAME = 'sys_scope';
        this.LICENSE_DETAIL_METRIC_TABLE_NAME = 'st_license_detail_metric';
        this.LICENSE_DETAIL_METRIC_OVER_ALLOCATED = 'over_allocated';
        this.LICENSE_DETAIL_METRIC_SUBSCRIPTION_ALLOTMENT_TYPE = 'subscription_allotment';
        this.SUBSCRIPTION_OVERVIEW_PAGE = '/$pa_dashboard.do?sysparm_dashboard=5e1b81e053031010b643ddeeff7b1266';
        this.SERVICENOW_STORE = 'https://store.servicenow.com/sn_appstore_store.do#!/store/application';
        this.NOW_PLATFORM_PRODUCT_NAME = 'Now Platform';
        this.METRICS_DELTA_NUMBER_OF_DAYS = 7;
    },

    /**
     * Returns all packages ids that are currently installed
     * @param {String} [productId] optional.
     * @param {String} [scopeNames] optional.
     * @param {String} [packageIds] optional.
     */
    getPackageIds: function(productId, scopeNames, packageIds) {
        // If a product is added as a parameter, packages and scope will be ignored
        if (productId)
            return this.getProductApplicationsPackageIds(productId);

        let scopePackageIds = this._getScopePackageIds(scopeNames);
        let allPackageIdsSet = new Set([...scopePackageIds, ...packageIds]);

        return Array.from(allPackageIdsSet);
    },

    /**
     * Returns all seed data products with applications and plugins that are currently installed
     */
    getProductData: function() {
        const products = [];

        const dfcProductGr = new GlideRecord(this.CONFIGURATION_HUB_PRODUCT_TABLE_NAME);
        dfcProductGr.orderBy('name');
        dfcProductGr.query();
        while (dfcProductGr.next()) {
            const productId = dfcProductGr.getUniqueValue();
            let apps = this.getProductApplications(productId);
            if (apps.length > 0)
                products.push({
                    id: productId,
                    label: dfcProductGr.getDisplayValue('name'),
                    packageIds: apps,

                    // children is used by typeahead in the front-end
                    children: apps
                });
        }

        return products;
    },

    /**
     * Returns all seed data applications and plugins that are currently installed
     * @param {String} [productId] optional.
     */
    getProductApplications: function(productId) {
        let packageIds = [];

        const dfcAppGr = new GlideRecord(this.CONFIGURATION_HUB_APPLICATION_TABLE_NAME);
        if (productId)
            dfcAppGr.addQuery('product', productId);
        dfcAppGr.orderBy('name');
        dfcAppGr.query();
        while (dfcAppGr.next()) {
            packageIds = [...packageIds, ...this.getInstalledApplications(dfcAppGr.getValue('package_id'))];
        }

        return packageIds;
    },

    /**
     * Returns all installed applications and plugins
     * @param {String} [packageId] optional.
     */
    getInstalledApplications: function(packageId) {
        const applications = [];

        const packageGr = new GlideRecord(this.PACKAGES_TABLE_NAME);
        if (packageId)
            packageGr.addQuery('source', packageId);
        packageGr.orderBy('name');
        packageGr.query();
        while (packageGr.next())
            applications.push({
                id: packageGr.getUniqueValue(),
                label: packageGr.getDisplayValue('name'),
                sublabel: packageGr.getValue('source')
            });

        return applications;
    },

    /**
     * Returns applications and plugins label
     * @param {String} [packageIds] required.
     */
    getApplicationsLabel: function(packageIds) {
        var applications = [];

        var packageGr = new GlideRecord(this.PACKAGES_TABLE_NAME);

        packageGr.addQuery('sys_id', 'IN', packageIds.join());
        packageGr.query();

        while (packageGr.next()) {
            applications.push({
                id: packageGr.getValue('sys_id'),
                label: packageGr.getDisplayValue('name')
            });
        }

        return applications;
    },

    /**
     * Returns documentation for a product
     * @param {String} [productId] required.
     */
    getProductDocumentation: function(productId) {
        let product = {
            id: productId,
            label: '',
            url: ''
        };

        if (!productId)
            return null;

        const dfcProductGr = new GlideRecord(this.CONFIGURATION_HUB_PRODUCT_TABLE_NAME);

        if (!dfcProductGr.get(productId))
            return null;

        product.name = dfcProductGr.getValue('name');
        product.url = dfcProductGr.getValue('documentation');

        return product;
    },

    /**
     * Returns product label and id
     * @param {Array} [packageIds] required.
     */
    getApplicationsStore(packageIds) {
        let applicationsStoreUrl = [];

        if (!packageIds)
            return applicationsStoreUrl;

        let packageIdToScopeNameMap = this._getScopeNamesForPackageIds(packageIds);

        packageIds.forEach(id => {
            const version = this._getApplicationVersion(id) || '';
            const label = this._getApplication(id)?.label || '';
            const description = this._getApplicationDescription(id);
            const scopeName = packageIdToScopeNameMap[id];

            // If an application cannot be uninstalled, it is core to platform
            const isCore = !sn_app_api.AppStoreAPI.canUninstall(scopeName, id);

            applicationsStoreUrl.push({
                label: label,
                id: id,
                url: `${this.SERVICENOW_STORE}/${id}/${version}`,
                description: description,
                isCore,
                scope: scopeName
            });
        });

        return applicationsStoreUrl;
    },

    /**
     * Returns packages source
     * @param {Array} [productId] required.
     */
    getPackageSources(packageIds) {
        let sources = [];

        if (!packageIds)
            return sources;

        const packageGr = new GlideRecord(this.PACKAGES_TABLE_NAME);
        packageGr.addQuery('sys_id', 'IN', packageIds);
        packageGr.query();

        while (packageGr.next()) {
            sources.push(packageGr.getValue('source'));
        }

        return sources;
    },

    /**
     * Returns number of customizations
     * @param {Array} [packageIds] required.
     */
    getCustomizedMetric(packageIds) {
        if (!packageIds)
            return {};

        let rowCount = 0;
        let delta = 0;
        let query = '';

        const updateGr = new GlideAggregate(this.UPDATE_TABLE_NAME);
        updateGr.addQuery('sys_package', 'IN', packageIds);
        updateGr.addAggregate('COUNT');
        updateGr.query();

        if (updateGr.next()) {
            rowCount = parseInt(updateGr.getAggregate('COUNT'));
            query = updateGr.getEncodedQuery();
        }

        updateGr.initialize();
        updateGr.addQuery('sys_package', 'IN', packageIds);
        updateGr.addQuery('sys_created_on', '>', gs.daysAgo(this.METRICS_DELTA_NUMBER_OF_DAYS));
        updateGr.addAggregate('COUNT');
        updateGr.query();

        if (updateGr.next()) {
            delta = parseInt(updateGr.getAggregate('COUNT'));
        }

        let result = {
            table: this.UPDATE_TABLE_NAME,
            query: query,
            value: rowCount,
            delta: {
                numberOfDays: this.METRICS_DELTA_NUMBER_OF_DAYS,
                value: delta
            }
        };

        return result;
    },

    /**
     * Returns performance data
     * @param {Array} [packageIds] required.
     */
    getPerformanceData(packageIds) {
        if (!packageIds)
            return {};

        let result = {
            table: this.CONFIGURATION_HUB_PRODUCT_TABLE_NAME,
            value: 0
        };

        var referenceTables = [{
                table: 'sys_transaction_pattern',
                scopeColumnName: 'origin_scope'
            },
            {
                table: 'sys_script_pattern',
                scopeColumnName: 'script_scope'
            },
            {
                table: 'sysevent_pattern',
                scopeColumnName: 'event_scope'
            }
        ];

        for (var i = 0; i < referenceTables.length; i++) {
            result.value += this._getTableCount(referenceTables[i].table, referenceTables[i].scopeColumnName + 'IN' + packageIds);
        }
        return result;
    },

    _getTableCount: function(table, query) {
        if (!query)
			return 0;
		var perfGr = new GlideAggregate(table);
		perfGr.addEncodedQuery(query);
		perfGr.addAggregate('COUNT');
		perfGr.query();
		if (perfGr.next()) {
			return parseInt(perfGr.getAggregate('COUNT'), 10);
		}
		return 0;
	},

    /**
     * Returns subscription data
     * @param {Array} [packageIds] required.
     */
    getSubscriptionData(packageIds) {
        if (!packageIds)
            return {};

        let licenseIds = [];
        let rowCount = 0;

        const scopeGr = new GlideRecord(this.SCOPE_TABLE_NAME);
        scopeGr.addQuery('sys_id', 'IN', packageIds);
        scopeGr.addNotNullQuery('license');
        scopeGr.query();

        while (scopeGr.next()) {
            licenseIds.push(scopeGr.getValue('license'));
        }

        if (licenseIds.length > 0) {
            let licenseDetailMetricGr = new GlideRecord(this.LICENSE_DETAIL_METRIC_TABLE_NAME);
            licenseDetailMetricGr.addQuery('name', this.LICENSE_DETAIL_METRIC_OVER_ALLOCATED);
            licenseDetailMetricGr.addQuery('type', this.LICENSE_DETAIL_METRIC_SUBSCRIPTION_ALLOTMENT_TYPE);
            licenseDetailMetricGr.addQuery('license_detail', 'IN', licenseIds);
            licenseDetailMetricGr.query();

            rowCount = licenseDetailMetricGr.getRowCount();
        }


        let result = {
            url: this.SUBSCRIPTION_OVERVIEW_PAGE,
            value: rowCount
        };

        return result;
    },

    getProductApplicationsPackageIds(productId) {
        let productScopeNames = this._getScopeNames(productId);
        let productPackageIds = this._getScopePackageIds(productScopeNames);

        return productPackageIds;
    },

    /**
     * @param {String} [packageId] required.
     * @return {String} a productId having given application OR id for Product "Now Platform"
     */
    getBestProductMatch(packageId) {
        let bestProductMatch = this.getDefaultProductSysId();
        const packageGr = new GlideRecord(this.PACKAGES_TABLE_NAME);

        // Unable to determine product as package is not installed
        if (!packageGr.get(packageId))
            return bestProductMatch;

        let scopeName = packageGr.getValue('source');
        let dfcApplicationGr = new GlideRecord(this.CONFIGURATION_HUB_APPLICATION_TABLE_NAME);
        dfcApplicationGr.addQuery('package_id', scopeName);
        dfcApplicationGr.orderBy('name');
        dfcApplicationGr.query();

        // Best match: product value of first dfcApplication
        if (dfcApplicationGr.next())
            bestProductMatch = dfcApplicationGr.getValue('product');

        return bestProductMatch;
    },

    /**
     * Returns application installed version
     * @param {String} [applicationId] required.
     */
    _getApplicationVersion(applicationId) {
        const storeAppGr = new GlideRecord(this.STORE_APP_TABLE_NAME);

        if (!storeAppGr || !storeAppGr.get(applicationId))
            return '';

        return storeAppGr.getValue('assigned_version');
    },

    /**
     * Returns application label and id
     * @param {String} [applicationId] required.
     */
    _getApplication(applicationId) {
        let application = {};

        const packageGr = new GlideRecord(this.PACKAGES_TABLE_NAME);

        if (!packageGr || !packageGr.get(applicationId))
            return application;

        application = {
            id: applicationId,
            label: packageGr.getDisplayValue('name')
        };

        return application;
    },

    /**
     * Returns application description
     * @param {String} [packageId] required.
     */
    _getApplicationDescription(packageId) {

        var dfcApplicationGr = new GlideRecord(this.CONFIGURATION_HUB_APPLICATION_TABLE_NAME);

        // Joining with package table because we are querying the application sys_id.
        var packageGr = dfcApplicationGr.addJoinQuery(this.PACKAGES_TABLE_NAME, 'package_id', 'source');
        packageGr.addCondition('sys_id', packageId);

        dfcApplicationGr.query();

        if (dfcApplicationGr.next())
            return dfcApplicationGr.getDisplayValue('description');

        return '';
    },

    /**
     * Returns product label, id and documentation
     * @param {String} [productId] required.
     */
    getProduct(productId) {
        let product = null;

        const dfcProductGr = new GlideRecord(this.CONFIGURATION_HUB_PRODUCT_TABLE_NAME);

        if (!dfcProductGr.get(productId))
            return product;

        product = {
            id: productId,
            label: dfcProductGr.getDisplayValue('name'),
            url: dfcProductGr.getValue('documentation'),
            definition: dfcProductGr.getDisplayValue('definition')
        };

        return product;
    },

    _getScopeNames: function(productId) {
        let scopeNames = [];

        if (!productId)
            return scopeNames;

        let dfcApplicationGr = new GlideRecord(this.CONFIGURATION_HUB_APPLICATION_TABLE_NAME);

        dfcApplicationGr.addQuery('product', productId);
        dfcApplicationGr.query();

        while (dfcApplicationGr.next()) {
            scopeNames.push(dfcApplicationGr.getValue('package_id'));
        }

        return scopeNames;
    },

    _getScopePackageIds: function(scopeNames) {
        let scopePackageIds = [];

        if (!scopeNames || (scopeNames && scopeNames.length === 0))
            return scopePackageIds;

        let packageGr = new GlideRecord(this.PACKAGES_TABLE_NAME);

        packageGr.addQuery('source', 'IN', scopeNames.join());
        packageGr.query();

        while (packageGr.next()) {
            scopePackageIds.push(packageGr.getValue('sys_id'));
        }

        return scopePackageIds;
    },

    _getScopeNamesForPackageIds: function(packageIds) {
        let packageIdToScopeNameMap = {};

        if (!packageIds || (packageIds && packageIds.length === 0))
            return packageIdToScopeNameMap;

        let packageGr = new GlideRecord(this.PACKAGES_TABLE_NAME);

        packageGr.addQuery('sys_id', 'IN', packageIds.join());
        packageGr.query();

        while (packageGr.next())
            packageIdToScopeNameMap[packageGr.getValue('sys_id')] = packageGr.getValue('source');

        return packageIdToScopeNameMap;
    },

    /**
     * Returns sys_id of default platform product
     */
    getDefaultProductSysId: function() {
        let defaultProductSysId = null;
        const defaultProductName = this.NOW_PLATFORM_PRODUCT_NAME;
        const dfcProductGr = new GlideRecord(this.CONFIGURATION_HUB_PRODUCT_TABLE_NAME);
        dfcProductGr.addQuery('name', defaultProductName);
        dfcProductGr.query();
        if (dfcProductGr.next())
            defaultProductSysId = dfcProductGr.getUniqueValue();

        return defaultProductSysId;
    },

    type: 'ConfigurationHubUtil'
};
