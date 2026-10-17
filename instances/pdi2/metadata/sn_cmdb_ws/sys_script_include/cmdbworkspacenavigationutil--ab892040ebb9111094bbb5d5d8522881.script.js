var CMDBWorkspaceNavigationUtil = Class.create();
CMDBWorkspaceNavigationUtil.prototype = {
    initialize: function() {},

    /**
    	Configure breadcrumbs for different routes if the default is not sufficient. Below is the configuration schema: 
    	{
    		label?: string | function,
			pageTitle?: string | function,
    		icon?: string | function,
    		operation?: string | function,
			routeInfo?: {
				route: string,
				fields: Record<string, any>
				params: Record<string,any>
 			} | function,
			hideBreadcrumb?: function | boolean,
    		provideItems?: function | object
    	}
		
		- Any function defined will be resolved by passing context as an argument.
		- If the basic configuration doesn't work for specific route, define provideItems. provideItems can either be the config object or a function that resolves to the config object.
    **/
    APP_ROUTES_CONFIG: {
        'task-detail': {
            label: function(context) {
                return gs.getMessage("Task: {0}", this._getDisplayValue(this.TABLES.CMDB_DATA_MANAGEMENT_TASK.NAME, context.fields.sysId));
            }
        },
        'attestation-review-cis': {
            label: function(context) {
                return gs.getMessage("Review CIs");
            }
        },
        'data-manager-policy-form': {
            label: function(context) {
                if (context.fields && context.fields.policySysId && context.fields.policySysId + "" != "-1") {
                    return this._getDisplayValue(this.TABLES.CMDB_DATA_MANAGEMENT_POLICY.NAME, context.fields.policySysId);
                }
                return gs.getMessage("New policy");
            },
            operation: function(context) {
                var prevRoute = context.prevBreadcrumbRoute;
                if (prevRoute && prevRoute.route && prevRoute.route == 'data-manager-policy-form' &&
                    prevRoute.fields && prevRoute.fields.policySysId && prevRoute.fields.policySysId == "-1") {
                    return this.BREADCRUMB_OPERATIONS.REPLACE_LAST_ITEM;
                }
                return this.BREADCRUMB_OPERATIONS.APPEND;
            },
        },
        'smart-search-results': {
            label: function(context) {
                return gs.getMessage("{0}", context.fields.listName);
            }
        },
        'list': {
            label: function(context) {
                if (context.params && context.params.listTitle)
                    return context.params.listTitle;
                return this._getTableLabel(context.fields.table, true) || gs.getMessage("List");
            },
            operation: function(context) {
                if (this.SGC_CENTRAL.L2_LISTS.indexOf(context.params.listTitle) == -1)
                    return this._getOperationDefault(context);
                return this.BREADCRUMB_OPERATIONS.REPLACE;
            },
            items: function(context) {
                var items = this._getItemsDefault(context);
                if (this.SGC_CENTRAL.L2_LISTS.indexOf(context.params.listTitle) == -1)
                    return items;

                if (items && items[0]) {
                    items[0].operation = this.BREADCRUMB_OPERATIONS.APPEND;
                    var l1BreadcrumbMenuItem = this._getBreadcrumbItemFromL1Menu(context.selectedToolbarItem);
                    l1BreadcrumbMenuItem.operation = this.BREADCRUMB_OPERATIONS.APPEND;
                    items.unshift(l1BreadcrumbMenuItem);
                }
                return items;
            }
        },
        'kpi-details': {
            label: function(context) {
                return this._getDisplayValue(this.TABLES.PA_INDICATORS.NAME, context.fields.uuid);
            }
        },
        'unsupported-feature-error-page': {
            operation: function() {
                return this.BREADCRUMB_OPERATIONS.REPLACE_LAST_ITEM;
            },
        },
        'unifiedmap': {
            label: function() {
                return gs.getMessage("Map");
            }
        },
        'sgc-connection-record': {
            label: function(context) {
                return this._getDisplayValue(this.TABLES.SERVICE_GRAPH_CONNECTIONS.NAME, context.fields.connectionId);
            }
        },
        'data-manager': {
            operation: function() {
                return this.BREADCRUMB_OPERATIONS.REPLACE;
            },
            items: function(context) {
                var items = this._getItemsDefault(context);
                // although the operation for DM page is Replace, we want to append the individual breadcrumb items
                items[0].operation = this.BREADCRUMB_OPERATIONS.APPEND;
                // create L1 level breadcrumb item and prepend, otherwise the AppShell engine will prepend default breadcrumb item for L1
                var l1BreadcrumbMenuItem = this._getBreadcrumbItemFromL1Menu(context.selectedToolbarItem);
                l1BreadcrumbMenuItem.operation = this.BREADCRUMB_OPERATIONS.APPEND;
                items.unshift(l1BreadcrumbMenuItem);
                return items;
            }
        },
        'manual-create-ci': {
            label: function(context) {
                if (context && context.params && context.params.sysClassName) {
                    return gs.getMessage('New CI for {0}', this._getTableLabel(context.params.sysClassName, false));
                }
                return gs.getMessage('New CI via IRE');
            }
        },
        'class-overview': {
            label: function(context) {
                return this._getTableLabel(context.fields.sysClassName, false);
            }
        },
        'ci-record': {
            label: function(context) {
                return this._getDisplayValue(context.fields.table, context.fields.sysId);
            },
            operation: function(context) {
                if (context && context.prevSelectedContent && context.prevSelectedContent.route) {
                    var previous = context.prevSelectedContent;
                    if (previous.route === "record" && previous.fields.table === context.fields.table && previous.fields.sysId === context.fields.sysId) {
                        return this.BREADCRUMB_OPERATIONS.REPLACE_LAST_ITEM;
                    }
                }
                return this.BREADCRUMB_OPERATIONS.APPEND;
            }
        }
    },

    MENU_ROUTES_CONFIG: {
        'home': {
            label: gs.getMessage("Home")
        },
        'my-work': {
            label: gs.getMessage("My work")
        },
        'multisource-analytics': {
            label: gs.getMessage("CMDB 360")
        },
        'insights': {
            label: gs.getMessage("Insights")
        },
        'management': {
            label: gs.getMessage("Management"),
            roles: ["sn_cmdb_admin"]
        },
        'sgc-central': {
            label: gs.getMessage("SGC Central"),
            roles: ["cmdb_inst_admin"],
            plugins: ["com.snc.sgc_central"]
        }
    },

    CMDB_WS_APP: {
        PAGE_REGISTRY_ID: "4fe450ae8f312010960c53ac37bdee20",
        CONFIG_ID: "6825d0ae8f312010960c53ac37bdee72",
        L1_ROUTES: ["home", "my-work", "multisource-analytics", "insights", "management", "sgc-central"]
    },

    SGC_CENTRAL: {
        L2_LISTS: [gs.getMessage("Total import sets"), gs.getMessage("Import set processing rate (record per hour)"), gs.getMessage("Import set rows ingested"), gs.getMessage("Import set rows transformed"), gs.getMessage("Records added or updated"), gs.getMessage("Connection & ingestion errors"), gs.getMessage("Transformation errors"), gs.getMessage("Reconciliation errors")]
    },

    TABLES: {
        CMDB_DATA_MANAGEMENT_TASK: {
            NAME: 'cmdb_data_management_task'
        },
        SYS_UX_APP_ROUTE: {
            NAME: 'sys_ux_app_route',
            COLS: {
                APP_CONFIG: 'app_config',
                ROUTE_TYPE: 'route_type',
                FIELDS: 'fields',
                SCREEN_TYPE: 'screen_type'
            }
        },
        PA_INDICATORS: {
            NAME: 'pa_indicators'
        },
        SERVICE_GRAPH_CONNECTIONS: {
            NAME: 'sn_cmdb_int_util_service_graph_connection'
        },
        CMDB_DATA_MANAGEMENT_POLICY: {
            NAME: 'cmdb_data_management_policy'
        }
    },

    BREADCRUMB_OPERATIONS: {
        REPLACE: "REPLACE",
        APPEND: "APPEND",
        REPLACE_LAST_ITEM: "REPLACE_LAST_ITEM",
        DEFAULT: "APPEND"
    },

    CUSTOM_BREADCRUMB_LABEL: {
        EMPTY: "<No name>"
    },

    _isFunction: function(input) {
        return typeof input === 'function';
    },

    _isObject: function(input) {
        return typeof input === 'object';
    },

    _isEmpty: function(input) {
        return global.JSUtil.nil(input) || (this._isObject(input) && Object.keys(input).length === 0);
    },

    _findConfigByRoute: function(route) {
        return this.APP_ROUTES_CONFIG[route] || {};
    },

    _isL1Route: function(route) {
        return this.CMDB_WS_APP.L1_ROUTES.indexOf(route) > -1;
    },

    /**
    	Gets the default value for given table and sysId.
    **/
    _getDisplayValue: function(table, sysId, defaultDisplayValue) {
        if (table && sysId) {
            var gr = new GlideRecord(table);
            if (sysId === "-1") {
                return gs.getMessage("{0} (New Record)", gr.getClassDisplayValue());
            }
            if (gr.get(sysId)) {
                if (!gr.getDisplayValue()) {
                    return gs.getMessage("{0}", this.CUSTOM_BREADCRUMB_LABEL.EMPTY);
                }
                return gr.getDisplayValue();
            }
        }
        return defaultDisplayValue ? defaultDisplayValue : "UNKNOWN";
    },

    _getScreenCollectionName: function(context) {
        var gr = new GlideRecord(this.TABLES.SYS_UX_APP_ROUTE.NAME);
        gr.addQuery(this.TABLES.SYS_UX_APP_ROUTE.COLS.APP_CONFIG, this.CMDB_WS_APP.CONFIG_ID);
        gr.addQuery(this.TABLES.SYS_UX_APP_ROUTE.COLS.ROUTE_TYPE, context.route);
        gr.query();
        while (gr.next()) {
            var fields = gr.getValue(this.TABLES.SYS_UX_APP_ROUTE.COLS.FIELDS);
            // route_type itself is not unique - combination of route_type and no. of fields are unique
            // so we need to check if the count of fields defined in the route record matches the fields on the context
            if ((this._isEmpty(fields) && this._isEmpty(context.fields)) ||
                (Object.keys(context.fields).length === fields.split(",").length)) {
                var screenCollection = gr.screen_type.getRefRecord();
                return screenCollection.getDisplayValue();
            }
        }
    },

    _resolveValue: function(context, currValue, defaultValue) {
        var that = this;
        if (this._isFunction(currValue)) {
            return currValue.call(that, context);
        }
        if (global.JSUtil.nil(currValue) && global.JSUtil.notNil(defaultValue)) {
            return this._resolveValue(context, defaultValue);
        }
        return currValue;
    },

    _getLabelDefault: function(context) {
        var fields = context.fields;
        var params = context.params;

        // if title is defined as required field use that as label
        if (fields.title) {
            return fields.title;
        }

        // if title is defined as optional params use that as label
        if (params.title) {
            return params.title;
        }

        // if table and sysId are present in the fields, get the displayValue for the record
        if (fields.table && fields.sysId) {
            return this._getDisplayValue(fields.table, fields.sysId);
        }

        return this._getScreenCollectionName(context);
    },

    _getHideBreadcrumbDefault: function(context) {
        return this._isL1Route(context.route);
    },

    _getOperationDefault: function(context) {
        return this._isL1Route(context.route) ? this.BREADCRUMB_OPERATIONS.REPLACE : this.BREADCRUMB_OPERATIONS.DEFAULT;
    },

    _getItemsDefault: function(context) {
        var currentRoute = context.route;
        var config = this._findConfigByRoute(currentRoute);
        var label = this._resolveValue(context, config.label, this._getLabelDefault);
        var pageTitle = this._resolveValue(context, config.pageTitle, label);
        var operation = this._resolveValue(context, config.operation, this._getOperationDefault);
        var icon = this._resolveValue(context, config.icon, "");
        var hideBreadcrumb = this._resolveValue(context, config.hideBreadcrumb, this._getHideBreadcrumbDefault);
        var routeInfo = this._resolveValue(context, config.routeInfo, {
            route: context.route,
            fields: context.fields,
            params: context.params
        });

        return [{
            label: label,
            pageTitle: pageTitle,
            icon: icon,
            hideBreadcrumb: hideBreadcrumb,
            routeInfo: routeInfo,
            operation: operation
        }];
    },

    _getBreadcrumbItemFromL1Menu: function(toolbarItem) {
        var label = "";
        if (typeof toolbarItem.label === 'string')
            label = toolbarItem.label;
        else if (typeof toolbarItem.label.message === 'string')
            label = toolbarItem.label.message;
        if (typeof label !== 'string' || label.length === 0)
            label = toolbarItem.routeInfo.route;
        return {
            icon: toolbarItem.icon,
            hideBreadcrumb: true,
            label: label,
            href: "javascript:void(0)",
            operation: this.BREADCRUMB_OPERATIONS.REPLACE,
            index: 0,
            routeInfo: {
                route: toolbarItem.routeInfo.route,
                fields: toolbarItem.routeInfo.fields || {},
                params: toolbarItem.routeInfo.params || {}
            }
        };
    },

    _hasPreviousSelectedContent: function(context) {
        if (!context.prevSelectedContent || context.prevSelectedContent == true) {
            return false;
        }
        return true;
    },

    _getTableLabel: function(tableName, plural) {
        if (!gs.tableExists(tableName))
            return null;
        var gr = new GlideRecord(tableName);
        return plural ? gr.getPlural() : gr.getLabel();
    },

    /**
     * @param {{
     * appId: string,
     * route: string,
     * fields: Record<string, any>,
     * params: Record<string, any>,
     * fetchStaticRoutes: boolean,
     * selectedToolbarItem: { 
     *  availability: any, badge: any, group?: string, 
     * 	icon?: string, id: string,
     * 	label: string | { message: string, translatable: boolean},
     * 	order?: number, presence?: any,
     * 	routeInfo: {route: string, fields: Record<string, any>, params?: Record<string, any>}
     * }
     * prevBreadcrumbRoute: { route: string, fields?: Record<string, any>, params?: Record<string, any>},
     * prevSelectedContent: { route: string, fields?: Record<string, any>, params?: Record<string, any>}
     * }} context
     * @returns {{
     *		operation?: "REPLACE" | "APPEND" | "REPLACE_LAST_ITEM",
     * 		items: Array<{
     * 					label: string,
     * 					icon?: string,
     *					routeInfo: {
     *						route: string,
     *						fields: Record<string, any>
     *						params: Record<string,any>
     * 					},
     *					operation?: "REPLACE" | "APPEND" | "REPLACE_LAST_ITEM"
     * 				>}}
     */
    provideItems: function(context) {
        var output = {
            operation: this.BREADCRUMB_OPERATIONS.DEFAULT,
            items: [],
            routeInfo: {
                route: context.route,
                fields: context.fields,
                params: context.params
            },
            prevBreadcrumbRoute: context.prevBreadcrumbRoute,
            prevSelectedContent: context.prevSelectedContent
        };
        var currentRoute = context.route;
        var config = this._findConfigByRoute(currentRoute);
        if (config.provideItems) {
            return this._resolveValue(context, config.provideItems);
        }
        var label = this._resolveValue(context, config.label, this._getLabelDefault);
        // if cannot resolve label default to app shell implementation
        if (global.JSUtil.nil(label)) return;

        var hasPreviousSelectedContent = this._hasPreviousSelectedContent(context);
        var isL1Route = this._isL1Route(context.route);
        output.items = this._resolveValue(context, config.items, this._getItemsDefault);
        if (hasPreviousSelectedContent || isL1Route) {
            output.operation = this._resolveValue(context, config.operation, this._getOperationDefault);
        } else {
            output.operation = this.BREADCRUMB_OPERATIONS.REPLACE;
            output.items.unshift(this._getBreadcrumbItemFromL1Menu(context.selectedToolbarItem));
        }
        return output;
    },

    /**
     * Configure CMDB_WS_APP.L1_ROUTES and MENU_ROUTES_CONFIG to add horizontal menu items
     * @returns {[{
     * 			value: {
     * 				label: string,
     * 				target: string,
     * 				type: string,
     * 				value: {
     * 					route: string,
     *					field: Record<string, any> 
     *              }		
     * 	        }
     * }]}
     */
    provideMenuItems: function() {
        var menuItems = [];
        for (var index in this.CMDB_WS_APP.L1_ROUTES) {
            var routeValue = this.CMDB_WS_APP.L1_ROUTES[index];
            var label = this.MENU_ROUTES_CONFIG[routeValue].label;
            var roles = this.MENU_ROUTES_CONFIG[routeValue].roles;
            var plugins = this.MENU_ROUTES_CONFIG[routeValue].plugins;
            var hasAccess = false;
            var isPluginsActive = true;
            // Check if dependency plugins/scoped app are installed configured in MENU_ROUTES_CONFIG.
            if (plugins) {
                var pMgr = new GlidePluginManager();
                for (var pIndex in plugins) {
                    if (!pMgr.isActive(plugins[pIndex])) {
                        isPluginsActive = false;
                        break;
                    }
                }
            }
            // Check if current user has the role when 'roles' is configured in MENU_ROUTES_CONFIG.
            if (isPluginsActive && roles) {
                for (var rIndex in roles) {
                    if (gs.hasRole(roles[rIndex])) {
                        hasAccess = true;
                        break;
                    }
                }
            } else
                hasAccess = true;

            var menu = {
                value: {
                    label: label,
                    target: '',
                    type: 'route',
                    value: {
                        route: routeValue,
                        fields: {}
                    }
                },
                children: {}
            };
            if (routeValue == "sgc-central") {
                menu.value.value["params"] = {
                    selectedTabIndex: -1
                };
            }
            if (isPluginsActive && hasAccess && label) {
                menuItems.push(menu);
            }
        }
        return menuItems;
    },

    type: 'CMDBWorkspaceNavigationUtil'
};
