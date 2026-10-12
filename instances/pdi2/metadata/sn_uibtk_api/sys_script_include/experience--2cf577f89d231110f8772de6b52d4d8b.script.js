const Experience = Class.create();
Experience.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_ux_page_registry',
    FIELDS: ['root_macroponent', 'admin_panel'],

    /**
     * @param fields {string[]}
     */
    initialize: function(fields, noDomain, includeDisplayValue) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, noDomain, includeDisplayValue);
    },

    /**
     * @param sysId {string} the sysId of the experience being loaded 
     */
    getExperienceById: function(sysId) {
        const experience = this.getRecordById(sysId);

        if (experience) {
            const appConfig = this._getAppConfigForExperience(experience.adminPanel.value);
            const roles = this._getRolesForExperience(experience.path.displayValue);
            const allRoutes = this._getRoutesForExperience(experience.adminPanel.value);
            const parentApp = experience.parentApp ? this._getParentAppForExperience(experience.parentApp.value) : {};
            const appTheme = experience.parentApp ? this._getAppThemeForExperience(parentApp.sysId.value) : [];
            const theme = this._getThemeForExperience(experience.adminPanel.value);
            const pageProperties = this._getPagePropertiesForExperience(experience.sysId.value);
            const upgradeStateSysIds = this.getUpgradeStateSysIds(this.TABLE, experience.sysId.value, allRoutes?.routes);
            return {
                ...allRoutes,
                experience,
                appConfig,
                roles,
                parentApp,
                appTheme,
                theme,
                pageProperties,
                upgradeStateSysIds
            };
        }

        return null;
    },

    /**
     * @param path {string} the path we are checking 
     */
    checkIfPathInUse: function(path) {
        const pathArray = String(path).split("/");
        const shortenedPathArray = pathArray.length > 1 ? pathArray.slice(0, pathArray.length - 1) : pathArray;
        const existingExperience = this.getRecordsByQuery('', 'path', true);
        while (existingExperience.next()) {
            var existingPath = existingExperience.getValue("path").split("/");
            var shortenedExistingPath = existingPath.length > 1 ? existingPath.slice(0, existingPath.length - 1) : existingPath;
            if (pathArray.join('/') === existingPath.join('/') ||
                (existingPath.length != pathArray.length && (pathArray.join('/') === shortenedExistingPath.join('/') ||
                    shortenedPathArray.join('/') === existingPath.join('/')))) {
                return true;
            }
        }
        return false;
    },

    /**
     * @param name {string} the name of the new experience
     * @param appShellUI {string} the sys_id of the app shell to use
     * @param path {string} the iniital path of the experience (e.g. my/experience)
     * @param homepage {string} the name of the screen that will be the homepage (defaults to home)
     * @param roles {string[]} an array of role sys_ids to be used for the ACL
     */
    create: function(name, appShellUI, path, homepage, roles = null, description = null) {
        const appConfigHandler = new AppConfig();
        const appConfigId = appConfigHandler.createRecord({
            name: name,
            landingPath: homepage,
            description
        });
        if (!appConfigId) {
            appConfigHandler.deleteRecord({
                sysId: appConfigId
            });
            return false;
        }

        const needsParentApp = appShellUI === BuilderToolkitConstants.WORKSPACE_APP_SHELL_ID || appShellUI === BuilderToolkitConstants.BREADCRUMB_APP_SHELL_ID || appShellUI === BuilderToolkitConstants.UXR_BASE_APP_SHELL_ID;
        const experience = this.createRecord({
            title: name,
            rootMacroponent: appShellUI,
            adminPanel: appConfigId,
            adminPanelTable: appConfigHandler.table,
            path: path,
            parentApp: needsParentApp ? BuilderToolkitConstants.POLARIS_PARENT_APP_ID : null
        });
        if (!experience) {
            appConfigHandler.deleteRecord({
                sysId: appConfigId
            });
            this.deleteRecord({
                sysId: experience
            });
            return false;
        }

        const appACLPath = path.replaceAll("/", ".");
        const companyCode = gs.getProperty("glide.appcreator.company.code");
        let companyCodePrefix = "now";
        if (!gs.getSession().getCurrentApplicationId().equals("global") && companyCode != "snc" && companyCode) {
            companyCodePrefix = "x." + companyCode;
        }
        const aclName = companyCodePrefix + "." + appACLPath + ".*";
        gs.eventQueue('sn_uibtk_api.create.experience.acl', this.getRecordById(experience, true), this.getUserUpdateSetId(), JSON.stringify({
            aclName: aclName,
            roles: roles ? String(roles)?.split(',') : []
        }));

        return experience;
    },

    /**
     * @param aclName {string} the name of the ACL to use based on experience URL
     * @param roles {string[]} list of role sys_ids to create ACL role records for
     * @param scope {string} the sys_id of the scope to create the records in
     */
    createACL: function(aclName, roles = [], scope) {
        const that = this;
        const globalHandler = new global.BuilderToolkitAPIGlobal();
        const aclHandler = new ACL(false, this.noDomain);
        const aclRoleHandler = new ACLRole(false, this.noDomain);
        const aclObject = {
            operation: 'read',
            type: BuilderToolkitConstants.UX_ROUTE_ACL_TYPE_ID,
            name: aclName,
            sys_scope: scope
        };
        //Lets first check if the acl already exist
        const aclGR = aclHandler.getRecordsByQuery(that.getEncodedQuery(aclObject), false, true);
        const newACLId = aclGR && aclGR.next() ? aclGR.sys_id.toString() : globalHandler.createGlobalRecord(aclHandler.TABLE, aclObject);
        if (roles.length != 0) {
            const roleObject = {
                sys_security_acl: newACLId,
                sys_scope: scope
            };
            const alreadyCreatedRoles = [];
            const roleEncodedQuery = `${that.getEncodedQuery(roleObject)}^sys_user_role.sys_idIN${roles.join(',')}`;
            const roleGR = aclRoleHandler.getRecordsByQuery(roleEncodedQuery, false, true);
            if (roleGR) {
                while (roleGR.next()) {
                    alreadyCreatedRoles.push(roleGR.name.toString());
                }
            }
            if (roles.length !== alreadyCreatedRoles.length) {
                roles.forEach(function(role) {
                    if (!alreadyCreatedRoles.includes(role)) {
                        roleObject.sys_user_role = role;
                        return globalHandler.createGlobalRecord(aclRoleHandler.TABLE, roleObject);
                    }
                });
            }

            // If we have user provided roles we need to check for and delete the auto-generated role for snc_internal
            // This ensures that only the roles the user gave us are allowed
            const internalACL = new GlideRecordSecure(aclRoleHandler.TABLE);
            internalACL.addQuery('sys_security_acl', newACLId);
            internalACL.addQuery('sys_user_role', BuilderToolkitConstants.ACL_INTERNAL_ROLE_ID);
            internalACL.query();
            if (internalACL.next()) {
                globalHandler.deleteGlobalRecord(aclRoleHandler.TABLE, internalACL.getUniqueValue());
            }
        }
    },

    // -------------------
    // HELPERS
    // -------------------

    /**
     * @param adminPanelVal {string} the admin panel value for the experience
     */
    _getAppConfigForExperience: function(adminPanelVal) {
        const appConfigFields = 'landing_path,description'.split(',');
        const appConfigHandler = new AppConfig(appConfigFields, this.noDomain, this.includeDisplayValue);
        const appConfig = appConfigHandler.getRecordById(adminPanelVal);
        return appConfig;
    },

    /**
     * @param pathDisplayVal {string} the path display value for the experience
     */
    _getRolesForExperience: function(pathDisplayVal) {
        const displayValue = pathDisplayVal.split("/").join(".");
        const aclHandler = new ACL(false, this.noDomain, this.includeDisplayValue);
        const roles = aclHandler.getRoles(`name=now.${displayValue}.*`);
        return roles;
    },

    _enrichLinkedRoutes: function(routes, interoperableNamesForLinkedRoutes) {
        routes?.sharedRoutes?.forEach?.(sharedRoute => {
            sharedRoute?.linkedRoutes?.forEach?.(linkedRoute => {
                const currentLinkedRouteSysId = linkedRoute?.sysId?.value;
                if (!interoperableNamesForLinkedRoutes[currentLinkedRouteSysId]) {
                    interoperableNamesForLinkedRoutes[currentLinkedRouteSysId] = [];
                }
                interoperableNamesForLinkedRoutes[currentLinkedRouteSysId].push({
                    aliasName: sharedRoute.aliasName,
                    interoperableName: sharedRoute.name
                });
            });
        });
        routes.linkedRoutes = routes?.linkedRoutes?.map?.(lRoute => ({
            ...lRoute,
            linkedFrom: interoperableNamesForLinkedRoutes[lRoute?.sysId?.value] ?? []
        }));
    },

    /**
     * @param adminPanelVal {string} the admin panel value for the experience
     */
    _getRoutesForExperience: function(adminPanelVal) {
        const externalRoutes = this._getInteroperableRoutesForExperience(adminPanelVal);
        // Enrich linkedRoutes with the interoperable names and store it
        const interoperableNamesForLinkedRoutes = {};
        this._enrichLinkedRoutes(externalRoutes, interoperableNamesForLinkedRoutes);

        const routeFields = 'app_config,order,parent_macroponent,extension_point,route_type,fields,optional_parameters,interoperable,name,screen_type,sys_scope,sys_package,sys_updated_on,sys_updated_by'.split(',');
        const routeHandler = new AppRoute(routeFields, this.noDomain, this.includeDisplayValue);
        const routes = routeHandler.getRoutes(`app_config=${adminPanelVal}^extension_pointISEMPTY^parent_macroponent_composition_element_idISEMPTY^ORparent_macroponent_composition_element_id=uxf-viewport-screen`, 'name');
        const sharedRouteIdsToExclude = [];
        const linkedRouteIdsToExclude = [];
        let finalRoutes = [];
        if (routes) {
            finalRoutes = routes.map(function(route) {
                const sharedRoutesMatchingCurrentRoute = externalRoutes?.sharedRoutes?.filter(function(sRoute) {
                    const getFieldsArray = (obj) =>
                        obj?.fields?.value?.split(',').map(field => field.trim()) || [];

                    const sRoutefieldsArray1 = getFieldsArray(sRoute);
                    const routefieldsArray2 = getFieldsArray(route);
                    const isSameRouteType = sRoute?.routeType?.value === route?.routeType?.value;
                    const isSameFieldLength = sRoutefieldsArray1.length === routefieldsArray2.length;
                    return isSameRouteType && isSameFieldLength && !sRoute?.aliasName;
                });
                sharedRouteIdsToExclude.push(...sharedRoutesMatchingCurrentRoute.map((sharedRoute) => {
                    return sharedRoute.sysId.value;
                }));
                const linkedRoutesMatchingCurrentRoute = externalRoutes?.linkedRoutes?.filter(function(lRoute) {
                    return lRoute?.routeType?.value === route?.routeType?.value && lRoute?.fields?.value === route?.fields?.value;
                });
                linkedRouteIdsToExclude.push(...linkedRoutesMatchingCurrentRoute.map(linkedRoute => linkedRoute.sysId.value));
                return {
                    ...route,
                    sharedRoutes: sharedRoutesMatchingCurrentRoute,
                    linkedRoutes: linkedRoutesMatchingCurrentRoute
                };
            });
        }
        if (finalRoutes) {
            finalRoutes.forEach(route => {
                route.sharedRoutes?.forEach(sharedRoute => {
                    sharedRoute.linkedRoutes?.forEach(linkedRoute => {
                        if (!linkedRouteIdsToExclude.includes(linkedRoute.sysId.value)) {
                            linkedRoute.applicable = true;
                        }
                    });
                });
            });
        }
        const filteredLinkedRoutes = externalRoutes?.linkedRoutes
            .filter(linkedRoute => !linkedRouteIdsToExclude.includes(linkedRoute.sysId.value))
            .map(linkedRoute => ({
                ...linkedRoute,
                applicable: true
            }));
        const filteredSharedRoutes = externalRoutes?.sharedRoutes
            .filter(sharedRoute => !sharedRouteIdsToExclude.includes(sharedRoute.sysId.value));
        if (filteredSharedRoutes) {
            filteredSharedRoutes?.forEach(sharedRoute => {
                sharedRoute.linkedRoutes?.forEach(linkedRoute => {
                    if (!linkedRouteIdsToExclude.includes(linkedRoute.sysId.value)) {
                        linkedRoute.applicable = true;
                    }
                    linkedRoute.linkedFrom = interoperableNamesForLinkedRoutes[linkedRoute?.sysId?.value] ?? [];
                });
            });
        }
        return {
            routes: finalRoutes,
            sharedRoutes: filteredSharedRoutes,
            linkedRoutes: filteredLinkedRoutes
        };
    },

    _getInteroperableRoutesForExperience: function(adminPanelVal) {
        const that = this;
        const routeHandler = new InteroperableRoute('', this.noDomain, this.includeDisplayValue);
        let routes = routeHandler.getInteroperableRoutes(`target_experience=${adminPanelVal}`);
        if (routes) {
            routes = routes.map(function(route) {
                const appRouteHandler = new AppRoute('', this.noDomain, true);
                const appRoute = appRouteHandler.getRoutes(`sys_id=${route.sourceRoute.value}`, '')?.[0];
                const appConfigHandler = new AppConfig('', this.noDomain, true);
                const appConf = appConfigHandler.getAppConfigById(appRoute?.appConfig?.value);
                const providerExp = that.getRecordsByQuery(`admin_panel=${appConf?.sysId?.value}`)?.[0];
                const roles = that._getRolesForExperience(providerExp?.path?.displayValue);
                const routeAudienceHandler = new InteroperableRouteAudience('', that.noDomain, true);
                const routeAudiences = routeAudienceHandler.getInteroperableRouteAudience(`interoperable_route=${route?.sysId?.value}`);
                const sharedScreens = route?.screens?.value?.split(',');
                const finalScreens = (appRoute?.screens ?? []).filter((screen) => {
                    return sharedScreens ? sharedScreens?.includes?.(screen.sysId.value) : !screen?.disableInteroperable?.value;
                });
                return {
                    sysId: route.sourceRoute,
                    appConfig: appConf,
                    providerExperience: {
                        ...providerExp,
                        roles: roles
                    },
                    description: route.description,
                    name: route.interoperableName,
                    aliasName: route.aliasRoute,
                    active: route.active,
                    routeType: appRoute.routeType,
                    sharedRouteSysId: route.sysId,
                    condition: route.interoperableCondition,
                    order: route.interoperableOrder,
                    applicability: routeAudiences,
                    screens: finalScreens,
                    allScreens: appRoute?.screens ?? [],
                    fields: appRoute.fields,
                    optionalParameters: appRoute.optionalParameters,
                    linkedRoutes: [],
                    sysUpdatedBy: route.sysUpdatedBy,
                    sysUpdatedOn: route.sysUpdatedOn,
                    sysCreatedOn: route.sysCreatedOn,
                    urlType: appRoute.urlType
                };
            });
        }
        return this.addLinkedRoutes(routes);
    },

    addLinkedRoutes: function(sharedRoutes) {
        const sharedRouteIds = sharedRoutes.map(route => route.sysId.value).join(', ');
        const routeQuery = `route.sys_idIN${ sharedRouteIds}`;
        const routeFields = 'app_config,order,parent_macroponent,extension_point,route_type,fields,optional_parameters,interoperable,name,screen_type,sys_scope,sys_package,sys_updated_on,sys_updated_by'.split(',');
        const appRouteHandler = new AppRoute(routeFields, this.noDomain, this.includeDisplayValue);
        const appConfigHandler = new AppConfig('', this.noDomain, true);
        const linkedRouteHandler = new LinkedRoute('', this.noDomain, this.includeDisplayValue);
        const linkedRouteGR = linkedRouteHandler.getLinkedRoutes(routeQuery);
        const routeMap = new Map();
        const uniqueLinkedRoute = [];
        while (linkedRouteGR && linkedRouteGR.next()) {
            if (linkedRouteGR.getValue('dependent_route_table') !== 'sys_ux_interoperable_route') {
                const appRoutes = appRouteHandler.getRoutes(`sys_id=${linkedRouteGR.dependent_route.getValue()}`, '', []);
                if (!appRoutes || appRoutes.length === 0) {
                    continue;
                }
                const appRoute = appRoutes?.[0];
                const appConf = appConfigHandler.getAppConfigById(appRoute?.appConfig?.value);
                const exp = this.getRecordsByQuery(`admin_panel=${appConf?.sysId?.value}`)?.[0];
                const linkedRouteInfo = {
                    applicable: false,
                    sysId: appRoute.sysId,
                    name: appRoute.name,
                    order: appRoute.order,
                    routeType: appRoute.routeType,
                    screens: appRoute?.screens?.filter(function(screen) {
                        return !screen?.disableInteroperable?.value;
                    }),
                    fields: appRoute.fields,
                    interoperable: appRoute.interoperable
                };
                const parentRoute = linkedRouteGR.route.route_type.getValue();
                if (routeMap.has(parentRoute)) {
                    routeMap.get(parentRoute).push(linkedRouteInfo);
                } else {
                    routeMap.set(parentRoute, [linkedRouteInfo]);
                }
                const exists = uniqueLinkedRoute.some(route => route.routeType?.value === linkedRouteInfo.routeType?.value);
                if (!exists) {
                    uniqueLinkedRoute.push({
                        ...linkedRouteInfo,
                        providerExperience: exp,
                        appConfig: appConf
                    });
                }
            }
        }
        const newCombinedExternalRoutes = {
            sharedRoutes: [],
            linkedRoutes: uniqueLinkedRoute
        };
        sharedRoutes.forEach(function(sharedRoute) {
            if (routeMap.has(sharedRoute.routeType?.value)) {
                sharedRoute.linkedRoutes = routeMap.get(sharedRoute.routeType?.value);
            }
            newCombinedExternalRoutes.sharedRoutes.push(sharedRoute);
        });
        return newCombinedExternalRoutes;
    },

    getSharedRoutesForExperience: function() {
        const appRouteHandler = new AppRoute('', this.noDomain, true);
        const routes = appRouteHandler.getRoutes('interoperable=true', '');
        const appConfigHandler = new AppConfig('', this.noDomain, true);
        const result = (routes ?? []).map(route => {
            const appConf = appConfigHandler.getAppConfigById(route?.appConfig?.value);
            const providerExp = this.getRecordsByQuery(`admin_panel=${appConf?.
            sysId?.value}`)?.[0];

            if (!providerExp || appConf?.name == null) {
                return null;
            }
            const roles = this._getRolesForExperience(providerExp?.path?.displayValue);
            return {
                ...route,
                providerExperience: {
                    name: appConf?.name,
                    roles: roles,
                    ...providerExp
                }
            };
        });
        return result;
    },

    getLinkedRoutesForASharedRoute: function(experienceId) {
        const experience = this.getRecordById(experienceId);
        const appRouteHandler = new AppRoute(routeFields, this.noDomain, this.includeDisplayValue);
        const routes = appRouteHandler.getRoutes(`app_config=${experience.adminPanel.value}^extension_pointISEMPTY^parent_macroponent_composition_element_idISEMPTY^ORparent_macroponent_composition_element_id=uxf-viewport-screen`, 'name');
        const routeFields = 'app_config,order,parent_macroponent,extension_point,route_type,fields,optional_parameters,interoperable,name,screen_type,sys_scope,sys_package,sys_updated_on,sys_updated_by'.split(',');
        const appConfigHandler = new AppConfig('', this.noDomain, true);
        const linkedRouteHandler = new LinkedRoute('', this.noDomain, this.includeDisplayValue);
        const linkedRouteGR = linkedRouteHandler.getLinkedRoutes();
        const linkedRoutes = {};
        while (linkedRouteGR && linkedRouteGR.next()) {
            if (linkedRouteGR.getValue('dependent_route_table') !== 'sys_ux_interoperable_route') {
                const appRoutes = appRouteHandler.getRoutes(`sys_id=${linkedRouteGR.dependent_route.getValue()}`, '', []);
                if (!appRoutes || appRoutes.length === 0) {
                    continue;
                }
                const appRoute = appRoutes?.[0];
                const appConf = appConfigHandler.getAppConfigById(appRoute?.appConfig?.value);
                const providerExp = this.getRecordsByQuery(`admin_panel=${appConf?.sysId?.value}`)?.[0];
                const roles = this._getRolesForExperience(providerExp?.path?.displayValue) ?? [];
                const applicable = !routes.some(route => route?.routeType?.value === appRoute?.routeType?.value);
                const linkedRouteInfo = {
                    applicable: applicable,
                    sysId: appRoute.sysId,
                    name: appRoute.name,
                    order: appRoute.order,
                    routeType: appRoute.routeType,
                    screens: appRoute?.screens?.filter?.(function(screen) {
                        return !screen?.disableInteroperable?.value;
                    }),
                    providerExperience: {
                        name: appConf.name,
                        roles: roles.map(role => {
                            return {
                                ...role,
                                name: role.sysUserRole?.displayValue
                            };
                        }),
                        ...providerExp
                    },
                    fields: appRoute.fields,
                    interoperable: appRoute.interoperable,
                    routeId: linkedRouteGR.route
                };
                if (linkedRouteGR.route) {
                    if (!linkedRoutes[linkedRouteGR.route]) {
                        linkedRoutes[linkedRouteGR.route] = [];
                    }
                    linkedRoutes[linkedRouteGR.route].push(linkedRouteInfo);
                }
            }
        }
        return linkedRoutes;
    },

    /**
     * @param parentAppVal {string} the parent app value for the experience
     */
    _getParentAppForExperience: function(parentAppVal) {
        const appHandler = new App(false, this.noDomain, this.includeDisplayValue);
        const parentApp = appHandler.getRecordById(parentAppVal);
        return parentApp;
    },

    /**
     * @param adminPanelVal {string} the admin panel value for the experience
     */
    _getThemeForExperience: function(adminPanelVal) {
        const themeHandler = new ThemeM2M(false, this.noDomain, this.includeDisplayValue);
        const theme = themeHandler.getRecordsByQuery(`ux_app_configuration=${adminPanelVal}`, 'order');
        return theme;
    },

    /**
     * @param parentAppVal {string} the parent app value for the experience
     */
    _getAppThemeForExperience: function(parentAppVal) {
        const appThemeHandler = new AppThemeM2M(false, this.noDomain, this.includeDisplayValue);
        const appTheme = appThemeHandler.getRecordsByQuery(`ux_app=${parentAppVal}`, 'order');
        return appTheme;
    },

    /**
     * @param sysId {string} the sysId value for the experience
     */
    _getPagePropertiesForExperience: function(sysId) {
        const propertyHandler = new PageProperty(false, this.noDomain, this.includeDisplayValue);
        const pagePropQuery = `page=${sysId}^route=NULL`;
        propertyHandler.createDefaultProperties(pagePropQuery);
        const pageProperties = propertyHandler.getProperties(pagePropQuery);
        return pageProperties;
    },

    type: 'Experience'
});
