const AppRoute = Class.create();
AppRoute.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_ux_app_route',
    FIELDS: ['name', 'route_type', 'fields', 'optional_parameters', 'parent_macroponent', 'parent_macroponent_composition_element_id', 'icon', 'extension_point', 'screen_type', 'order', 'app_config', 'interoperable','description', 'sys_policy', 'sys_updated_on', 'sys_updated_by', 'sys_scope', 'sys_package'],
    FIELD_TYPES: {
        name: 'translated_field',
        route_type: 'string',
        fields: 'string',
        optional_parameters: 'string',
        parent_macroponent: 'reference',
        parent_macroponent_composition_element_id: 'string',
        icon: 'string',
        extension_point: 'reference',
        screen_type: 'reference',
        order: 'integer',
        app_config: 'reference',
		interoperable: 'boolean',
		description: 'string'
    },
    // URL type constants with translations
    URL_TYPES: {
        LANDING: { id: 'Landing', label: gs.getMessage('Landing') },
        RECORD: { id: 'Record', label: gs.getMessage('Record') },
        DASHBOARD: { id: 'Dashboard', label: gs.getMessage('Dashboard') },
        KNOWLEDGE_BASE: { id: 'Knowledge base', label: gs.getMessage('Knowledge base') },
        LIST: { id: 'List', label: gs.getMessage('List') }
    },

    /**
     * @param fields {string[]}
     */
    initialize: function(fields, noDomain, includeDisplayValue) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, noDomain, includeDisplayValue, this.FIELD_TYPES);
    },

    /**
     * @param appRoute {object} a object with keys in camel case and values
     */
    updateRecord: function({
        sysId,
        optionalParameters = null,
        fields = null,
        ...otherFields
    }) {
        const arrayUtil = new global.ArrayUtil();
        const recordGR = this.getRecordById(sysId, true);
        if (recordGR && recordGR.canWrite()) {
            const uniqueOptionalParameters = arrayUtil.unique(optionalParameters?.split(',') ?? []);
            const uniqueFields = arrayUtil.unique(fields?.split(',') ?? []);
            this.setFieldValues(recordGR, {
                ...otherFields,
                optionalParameters: uniqueOptionalParameters,
                fields: uniqueFields
            });
            return recordGR.update();
        }
        return {
            error: true,
            reason: !recordGR ? BuilderToolkitConstants.ERRORS.NO_RECORD_FOUND : BuilderToolkitConstants.ERRORS.WRITE_ACCESS_ERROR_MESSAGE
        };
    },

    /**
     * Determines the URL type for a route based on its properties.
     * URL types can be: 'Landing', 'Dashboard', 'Knowledge base', 'List', or 'Record'.
     * 
     * @param {Object} route - The route object to determine URL type for
     * @returns {string} The determined URL type
     */
    getUrlType: function(route) {
        const url = route.routeType?.value?.toLowerCase() || '';
        const fields = route.fields?.value?.toLowerCase() || '';
        const name = route.screenType.displayValue?.toLowerCase() || '';


        let isLanding = false;
        if (route.appConfig) {
            const appConfigFields = 'landing_path'.split(',');
            const appConfig = route.appConfig.value;
            const appConfigHandler = new AppConfig();
            const appConfigRecord = appConfigHandler.getRecordById(appConfig);
            const landingPath = appConfigRecord.landingPath;
            if (url.indexOf(landingPath) === 0 && url.length === landingPath.length) {
                isLanding = true;
            }
        }

        const searchFacetMappings = new SearchFacetItemMappings();
        const existingCategory = searchFacetMappings.getRecordsByQuery('element_table=sys_ux_app_route^target_id=' + route.sysId.value, 'order', true);

        if (existingCategory && existingCategory.next()) {
            // Initialize with existing category as an object with id and label
            const categoryType = existingCategory.getDisplayValue('search_facet_item');
            const facetId = existingCategory.getValue('search_facet_item');
            const sysId = existingCategory.getUniqueValue();
            const existingCategoryValue = [];
			      if (isLanding) {
                existingCategoryValue.push(this.URL_TYPES.LANDING);
            }
			
            existingCategoryValue.push({ id: categoryType, label: gs.getMessage(categoryType), sysId, facetId });
            return existingCategoryValue;

        } else {
            if (isLanding) {
                return [this.URL_TYPES.LANDING];
            }
			if (name.includes('knowledge') || url.includes('knowledge') || url.includes('kb') || fields.includes('kb')) {
                return [this.URL_TYPES.KNOWLEDGE_BASE];
            }
            if ( (name.includes('record') || url.includes('record')) && (fields.includes('table') && fields.includes('sysid'))) {
                return [this.URL_TYPES.RECORD];
            }
            if (name.includes('list') || url.includes('list')) {
                return [this.URL_TYPES.LIST];
            }

            return null;
        }


    },

    getRoutes: function(routeQuery, orderBy) {
        const that = this;
        const screenHandler = new Screen(false, that.noDomain, that.includeDisplayValue);
        const audienceHandler = new ScreenApplicability(false, that.noDomain, that.includeDisplayValue);
        const screenCollectionHandler = new ScreenCollection(false, that.noDomain, that.includeDisplayValue);
		const screenTypeConditionScriptHandler = new ScreenTypeConditionScript(false, that.noDomain, that.includeDisplayValue);
        const screenConditionHandler = new ScreenCondition(false, that.noDomain, that.includeDisplayValue);
        const macroponentHandler = new Macroponent(['layout'], that.noDomain, that.includeDisplayValue);
        let routes = this.getRecordsByQuery(routeQuery, orderBy);
        if (routes) {
            routes = routes.map(function(route) {
                const screenType = that.includeDisplayValue ? route.screenType.value : route.screenType;
                const urlType = that.getUrlType(route);
                let screens = screenHandler.getRecordsByQuery('screen_type=' + screenType, 'order');
                screens = screens.map(function(screen) {
                    const screenSysId = that.includeDisplayValue ? screen.sysId.value : screen.sysId;
                    const macroponentId = that.includeDisplayValue ? screen.macroponent?.value : screen.macroponent;
                    return {
                        ...screen,
                        audiences: audienceHandler.getRecordsByQuery(`screen=${screenSysId}`, 'order'),
                        screenConditions: screenConditionHandler.getRecordsByQuery(`screen=${screenSysId}`, 'sys_created_on'),
                        macroponent: macroponentId ? macroponentHandler.getRecordById(macroponentId) : null
                    }
                });
                return {
                    ...route,
                    urlType,
                    screens,
                    screenType: screenCollectionHandler.getRecordById(screenType),
                    screenTypeConditionScripts: screenTypeConditionScriptHandler.getRecordsByQuery(`screen_type=${screenType}^active=true`)
                };
            });
        }
        return routes;
    },

    type: 'AppRoute'
});
