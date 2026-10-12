// This is standard SI
var BreadcrumbItemsProvider = Class.create();
BreadcrumbItemsProvider.prototype = {
	OPERATION: {
		APPEND: "APPEND",
		REPLACE: "REPLACE",
		REPLACE_LAST_ITEM: "REPLACE_LAST_ITEM"
	},
	initialize: function () {
	},
	/**
	 * @param {string} route
	 */
	getPayloadTemplate: function (route) {
		return {
			label: route || gs.getMessage("Unknown"),
			icon: "",
			operation: this.OPERATION.REPLACE_LAST_ITEM,
			routeInfo: {
				route: "",
				fields: {},
				params: {}
			},
			operation: this.OPERATION.REPLACE_LAST_ITEM
		};
	},
	/**
	 * @param {string} tableName
	 * @param {string} sysId
	 * @param {string} route
	 */
	getRecordPayload: function (tableName, sysId, route) {
		var payload = this.getPayloadTemplate(route);
		if (!gs.tableExists(tableName))
			return payload;
		var gr = new GlideRecord(tableName);
		if (!gr.isValid())
			return payload;
		if (sysId === "-1")
			payload.label = gs.getMessage("{0} (New Record)", gr.getClassDisplayValue());
		else if(gr.get(sysId))
			payload.label = gr.getDisplayValue();
		return payload;
	},
	/**
	 * @param {{appId: string,
	 * route: string,
	 * fields: Record<string, any>,
	 * params: Record<string, any>,
	 * fetchStaticRoutes: boolean,
	 * selectedToolbarItem: { availability: any, badge: any, group?: string,
	 * 	icon?: string, id: string,
	 * 	label: string | { message: string, translatable: boolean},
	 * 	order?: number, presence?: any,
	 * 	routeInfo: {route: string, fields: Record<string, any>, params?: Record<string, any>}}
	 * prevBreadcrumbRoute: { route: string, fields?: Record<string, any>, params?: Record<string, any>},
	 * prevSelectedContent: { route: string, fields?: Record<string, any>, params?: Record<string, any>}
	 * }} context
	 */
	provideItems: function (context) {
		var output = {
			defaultHandler: true,
			operation: this.OPERATION.REPLACE_LAST_ITEM,
			items: [],
			routeInfo: {
				route: context.route,
				fields: context.fields,
				params: context.params
			},
			prevBreadcrumbRoute: context.prevBreadcrumbRoute,
			prevSelectedContent: context.prevSelectedContent
		};
		switch (context.route) {
			case 'record':
				var payload = this.getRecordPayload(context.fields.table, context.fields.sysId, context.route);
				payload.routeInfo.route = context.route;
				payload.routeInfo.fields = context.fields;
				payload.routeInfo.params = context.params;
				payload.operation = this.OPERATION.REPLACE_LAST_ITEM;
				output.items = [payload];
				break;
			default:
				var defaultPayload = this.getPayloadTemplate(context.route);
				defaultPayload.routeInfo = {
					route: context.route,
					fields: context.fields,
					params: context.params
				}
				var toolbarRootInfo = context.selectedToolbarItem.routeInfo;
				if (toolbarRootInfo && toolbarRootInfo.route === context.route) {
					output.operation = this.OPERATION.REPLACE;
					defaultPayload.operation = this.OPERATION.REPLACE;
					defaultPayload.icon = context.selectedToolbarItem.icon;
					if (context.selectedToolbarItem.label &&
						typeof context.selectedToolbarItem.label.message === 'string' &&
						context.selectedToolbarItem.label.message.length > 0)
						defaultPayload.label = context.selectedToolbarItem.label.message;
					else if (typeof context.selectedToolbarItem.label === 'string' && context.selectedToolbarItem.label.length > 0)
						defaultPayload.label = context.selectedToolbarItem.label;
				}
				output.items = [defaultPayload];
		}
		return output;
	},

	/**
	 * @param {{appId: string,
	 * route: string,
	 * fields: Record<string, any>,
	 * params: Record<string, any>,
	 * fetchStaticRoutes: boolean,
	 * selectedToolbarItem: { availability: any, badge: any, group?: string,
	 * 	icon?: string, id: string,
	 * 	label: string | { message: string, translatable: boolean},
	 * 	order?: number, presence?: any,
	 * 	routeInfo: {route: string, fields: Record<string, any>, params?: Record<string, any>},
	 * 	preparedByAppShell?: boolean
	 * }
	 * prevBreadcrumbRoute: { route: string, fields?: Record<string, any>, params?: Record<string, any>},
	 * prevSelectedContent: { route: string, fields?: Record<string, any>, params?: Record<string, any>}
	 * }} context
	 */
	process: function (context) {
		/**
		 * @type {Array<{getAppId(): string, getHandledRoutes(): Array<string>, getStaticRoutes(): Array, provideItems(context: )}>}
		 */
		var availableExtPoints = new GlideScriptedExtensionPoint().getExtensions("sn_app_shell_aw.AppShellBreadcrumbItemsProvider");
		var i18nTranslation = {
			toggle: gs.getMessage("Toggle subtoolbar content"),
			expand: gs.getMessage("Expand"),
			collapse: gs.getMessage("Collapse")
		};
		var output = {
			input: context,
			errMsg: [],
			warnMsg: [],
			i18nTranslation: i18nTranslation
		};
		
		var handledExtPoints = availableExtPoints.filter(function (extPoint) {
			if (typeof extPoint.getAppId !== 'function')
				return false;
			try {
				return extPoint.getAppId() === context.appId;
			} catch (e) {
				output.errMsg.push(e + "");
			}
			return false;
		});

		var resultAPIs = context.selectedToolbarItem.preparedByAppShell? handledExtPoints: handledExtPoints.filter(function (item) {
			if (typeof item.getHandledRoutes !== 'function')
				return false;
			/**
			 * @type {Array}
			 *  */
			var handledRoutes = [];
			try {
				handledRoutes = item.getHandledRoutes();
			} catch (e) {
				output.errMsg.push(e + '');
				return false;
			}
			return Array.isArray(handledRoutes) && handledRoutes.indexOf(context.selectedToolbarItem.id) >= 0;
		});


		if (resultAPIs.length === 0)
			output.errMsg.push(gs.getMessage("Unable to find the appId, please provide one"));

		if (resultAPIs.length > 1)
			output.warnMsg.push(gs.getMessage("Multiple providers found for same appId"));

		var api = resultAPIs.length > 0? resultAPIs[0]: this;
		if (context.fetchStaticRoutes) {
			if (typeof api.getStaticRoutes === 'function') {
				try {
					output.staticRoutes = api.getStaticRoutes(context);
				} catch (e) {
					output.errMsg.push(e + '');
				}

				if (!Array.isArray(output.staticRoutes))
					output.staticRoutes = [];
				var selfRef = this;
				output.staticRoutes.forEach(function (item, index, src) {
					src[index] = selfRef.fixHRef(item);
				});
			}
		}
		var currentRoute = {items: []};
		try {
			if (typeof api.provideItems === 'function')
				currentRoute = api.provideItems(context);
		} catch (e) {
			output.errMsg.push(e + '');
		}
		currentRoute = currentRoute || this.provideItems(context);
		if (!currentRoute)
			return output;
		currentRoute.i18nTranslation = i18nTranslation;
		if (!Array.isArray(currentRoute.items))
			currentRoute.items = [];
		currentRoute = this.fixHRef(currentRoute);
		currentRoute.routeInfo = currentRoute.routeInfo || {
			route: context.route,
			fields: context.fields,
			params: context.params,
		};
		output.currentRoute = currentRoute;
		output.menu = this.getMenuItems(context);

		return output;
	},
	/**
	* @param {{items: Array<{label: string, icon?: string, href?: string, rootInfo: {root: string, fields: any, params: any}}>}} rootItem
	*/
	fixHRef: function (rootItem) {
		if (!Array.isArray(rootItem.items))
			rootItem.items = [];
		var selfRef = this;
		rootItem.items.forEach(function (item) {
			item.href = 'javascript:void(0)';
			if (!item.operation || !(item.operation === selfRef.OPERATION.APPEND || item.operation === selfRef.OPERATION.REPLACE || item.operation === selfRef.OPERATION.REPLACE_LAST_ITEM))
				item.operation = selfRef.OPERATION.REPLACE_LAST_ITEM;
		});
		if (!rootItem.operation || !(rootItem.operation === this.OPERATION.APPEND || rootItem.operation === this.OPERATION.REPLACE || rootItem.operation === this.OPERATION.REPLACE_LAST_ITEM))
			rootItem.operation = this.OPERATION.REPLACE_LAST_ITEM;
		return rootItem;
	},

	/**
	 *
	 * @returns Menu Items
	 */
	provideMenuItems: function () {
		return [
			{
				"value": {
					"label": "Default Link",
					"target": "",
					"type": "route",
					"value": {
						"route": "home",
						"fields": {}
					}
				}
			}
		];
	},

	provideActionButtons: function() {
		return [
			{
				"label": "Default Action button",
				"value": "default-value",
				"size": "sm",
				"variant": "primary"
			}
		];
	},


	/**
	 * For menu items
	 */
	getMenuItems: function (context) {
		var availableExtPoints = new GlideScriptedExtensionPoint().getExtensions("sn_app_shell_aw.AppShellBreadcrumbMenuProvider");
		var result = {
			items: [],
			actionButtons: [],
			errMsg: []
		};

		var validExtensionPoints = availableExtPoints.filter(function (extPoint) {
			if (typeof extPoint.getAppId !== 'function')
				return false;
			try {
				return extPoint.getAppId() === context.appId;
			} catch (e) {
				result.errMsg.push(e + "");
			}
			return false;
		});

		// If not valid extension point found.
		if (validExtensionPoints.length === 0) {
			result.errMsg.push(gs.getMessage("Unable to find the valid extension point, loading default "));
		}

		// If no valid extension, provide will use default implementations.
		var api = validExtensionPoints.length > 0 ? validExtensionPoints[0] : this;


		if (typeof api.provideMenuItems === 'function') {
			try {
				result.items = api.provideMenuItems(context);
			} catch (e) {
				var errorMessage = e + '';
				result.errMsg.push(errorMessage);
			}
		}

		if (typeof api.provideActionButtons === 'function') {
			try {
				result.actionButtons = api.provideActionButtons(context);
			} catch (e) {
				var errorMessage = e + '';
				result.errMsg.push(errorMessage);
			}
		}

		return result;
	},

	type: 'BreadcrumbItemsProvider'
};
