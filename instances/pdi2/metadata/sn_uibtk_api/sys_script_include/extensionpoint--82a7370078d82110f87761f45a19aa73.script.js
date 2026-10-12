const ExtensionPoint = Class.create();
ExtensionPoint.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_ux_extension_point',
    FIELDS: ['app_shell', 'component', 'type', 'controller', 'controller_dependencies', 'name', 'description', 'sys_scope', 'sys_package', 'sys_updated_by', 'sys_updated_on', 'sys_domain'],
    FIELD_TYPES: {
        app_shell: 'reference',
        component: 'reference',
        type: 'string',
        controller: 'reference',
        controller_dependencies: 'json',
        name: 'translated_field',
        description: 'translated_text'
    },

    /**
     * @param fields {string[]}
     */
    initialize: function(fields, noDomain, includeDisplayValue) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, noDomain, includeDisplayValue, this.FIELD_TYPES);
    },

    getExtensionPoint: function(sysId) {
        const extensionPoint = this.getRecordById(sysId);

        if (extensionPoint) {
            const appRouteHandler = new AppRoute(false, this.noDomain, this.includeDisplayValue);
            const routes = appRouteHandler.getRoutes(`extension_point=${sysId}`, 'name');
            const upgradeStateSysIds = this.getUpgradeStateSysIds(this.TABLE, extensionPoint.sysId.value, routes);

            return {
                ...extensionPoint,
                routes,
                upgradeStateSysIds
            };
        }

        return {};
    },

    getExtensionPoints: function(encodedQuery) {
        const extensionPoints = [];
        const extensionPointRecordGR = this.getRecordsByQuery(encodedQuery, 'name', true);
        while (extensionPointRecordGR.next()) {
            const subroutes = [];
            const routeGR = new AppRoute(false, this.noDomain, this.includeDisplayValue).getRecordsByQuery(`extension_point=${extensionPointRecordGR.getUniqueValue()}`, 'name', true);
            if (routeGR) {
                while (routeGR.next()) {
                    const screens = [];
                    const screenGR = new Screen(false, this.noDomain, this.includeDisplayValue).getRecordsByQuery(`screen_type=${routeGR.getValue('screen_type')}`, 'name', true);
                    if (screenGR) {
                        while (screenGR.next()) {
                            screens.push({
                                sysId: screenGR.getUniqueValue(),
                                name: screenGR.getValue('name')
                            });
                        }
                    }
                    subroutes.push({
                        name: routeGR.getValue('name'),
                        sysId: routeGR.getUniqueValue(),
                        routeType: routeGR.getValue('route_type'),
                        screenType: routeGR.getValue('screen_type'),
                        screens,
						fields: routeGR.getValue('fields'),
						optionalParameters: routeGR.getValue('optional_parameters')
                    });
                }
            }
            const extensionPointValues = this.getValuesFromGlideRecord(extensionPointRecordGR);
            const upgradeStateSysIds = this.getUpgradeStateSysIds(this.TABLE, extensionPointValues.sysId, subroutes);

            extensionPoints.push({
                ...extensionPointValues,
                subroutes,
                upgradeStateSysIds
            });
        }
        return extensionPoints;
    },

    type: 'ExtensionPoint'
});
