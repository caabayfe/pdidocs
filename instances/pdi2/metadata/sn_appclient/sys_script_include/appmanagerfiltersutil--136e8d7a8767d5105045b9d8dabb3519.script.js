var AppManagerFiltersUtil = Class.create();
AppManagerFiltersUtil.prototype = {
    initialize: function() {},
    getFilters: function() {
        var result = {
            filters: []
        };
        var filterList = [{
                name: gs.getMessage('Listings'),
                value: 'listings',
                data: [{
                        label: gs.getMessage('Applications'),
                        value: 'applications',
                    },
                    {
                        label: gs.getMessage('Plugins'),
                        value: 'plugins',
                    },
                    {
                        label: gs.getMessage('Free Trials'),
                        value: 'free_to_try',
                    },
                    {
                        label: gs.getMessage('Products'),
                        value: 'products',
                    },
                ],
            },
            {
                name: gs.getMessage('Offered By'),
                value: 'offeredBy',
                data: [{
                        label: gs.getMessage('Partners'),
                        value: 'partners',
                    },
                    {
                        label: gs.getMessage('ServiceNow'),
                        value: 'servicenow',
                    },
                ],
            },
            {
                name: gs.getMessage('Price Type'),
                value: 'priceType',
                data: [{
                        label: sn_i18n.Message.getMessage('app_client_plugin_price', 'Free{? used as a Price - Free or Paid}'),
                        value: 'free',
                    },
                    {
                        label: gs.getMessage('Paid'),
                        value: 'paid',
                    },
                ],
            },
            {
                name: gs.getMessage('My Apps'),
                value: 'myApps',
                data: [{
                        label: gs.getMessage('Licensed'),
                        value: 'licensed',
                    },
                    {
                        label: gs.getMessage('Compatible'),
                        value: 'compatible',
                    },
                    {
                        label: gs.getMessage('Upcoming Renewal'),
                        value: 'upcomingrenewal',
                    },
                    {
                        label: gs.getMessage('Trial Started'),
                        value: 'trialstarted',
                    },
                ],
            },
        ];

        var products = {};
        var options = [];

        this.getLOBs(products, options);
        this.getProductFamily(products, options);

        var productFamilyFacet = {
            name: gs.getMessage('Product Family'),
            value: 'productFamily',
            data: options,
        };
        result.filters = filterList;
        result.filters.push(productFamilyFacet);
        try {
            var adoptionBlueprintFacet = this.getAdoptionBlueprint();
            result.filters.push(adoptionBlueprintFacet);
        } catch (error) {
            gs.debug("error while fetching adoption blueprint");
            return result;
        }
        return result;
    },
    getLOBs: function(products, options) {
        var lobCategories = new global.PluginsData().getLOBCategories();
        for (var i = 0; i < lobCategories.length; i++) {
            var option = {
                label: lobCategories[i].lob_name,
                value: lobCategories[i].lob_name
            };
            if (!(lobCategories[i].lob_name in products)) {
                options.push(option);
                products[lobCategories[i].lob_name] = lobCategories[i].lob_name;
            }
        }
    },
    getProductFamily: function(products, options) {
        var gr = new GlideRecord('sn_appclient_product');
        gr.query();

        while (gr.next()) {
            var productFamily = gr.getValue('family');
            if (!(productFamily in products)) {
                var productOption = {
                    label: productFamily,
                    value: productFamily
                };
                options.push(productOption);
                products[productFamily] = productFamily;
            }
        }
    },
    getAdoptionBlueprint: function() {
        var options = [];
        var gr = new GlideRecord('sn_admin_center_business_objective');
        gr.query();
        while (gr.next()) {
            var adoptionBlueprintName = gr.getValue('name');
            var adoptionBlueprintSysId = gr.getValue('sys_id');
            var adoptionBlueprintOption = {
                label: adoptionBlueprintName,
                value: adoptionBlueprintSysId
            };
            options.push(adoptionBlueprintOption);
        }
        var adoptionBlueprintFacet = {
            name: gs.getMessage('Adoption Blueprint'),
            value: 'adoptionBlueprint',
            data: options,
        };
        return adoptionBlueprintFacet;
    },
    getFilteredIdsWithAdoptionBluePrint: function(adoptionBluePrintQuery) {
        var appNames = [];
        var solutionsGr = new GlideRecord('sn_admin_center_solution');
        solutionsGr.addEncodedQuery(adoptionBluePrintQuery);
        solutionsGr.query();
        while (solutionsGr.next()) {
            var appName = this.getApplicationName(this.getApplicationGlideRecord(solutionsGr.application));
            if (appName != null)
                appNames.push(appName);
        }
        return appNames;
    },
    getApplicationName: function(application) {
        return application.application_type.toString() === 'application' ? application.name : null;
    },
    getPluginId: function(application) {
        return application.application_type.toString() === 'plugin' ? application.plugin_id : null;
    },
    getApplicationGlideRecord: function(applicationId) {
        if (!applicationId)
            return null;

        var applicationGr = new GlideRecord('sn_admin_center_application');
        if (!applicationGr.get(applicationId))
            return null;

        return applicationGr;
    },
    getFilteredPluginIdsWithAdoptionBluePrint: function(adoptionBluePrintQuery) {
        var pluginIDs = [];
        var solutionsGr = new GlideRecord('sn_admin_center_solution');
        solutionsGr.addEncodedQuery(adoptionBluePrintQuery);
        solutionsGr.query();
        while (solutionsGr.next()) {
            var pluginID = this.getPluginId(this.getApplicationGlideRecord(solutionsGr.application));
            if (pluginID != null)
                pluginIDs.push(pluginID);
        }
        return pluginIDs;
    },
    type: 'AppManagerFiltersUtil'
};
