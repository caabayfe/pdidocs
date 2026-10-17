// Breadcrumb Utils
/// @ts-check
/**
 * @typedef {AppShell.Helpers} Helpers
 * @typedef {AppShell.API} API
 * @typedef {AppShell.Imports} Imports
 * @typedef {AppShell.State} State
 * @typedef {AppShell.SelectedContentChanged} SelectedContentChanged
 * @typedef {AppShell.StateNames} StateNames
 * @typedef {UXFClient.RouteInfo} RouteInfo
 * @typedef {AppShell.RouteOperation} RouteOperation
 * @typedef {AppShell.ChromeToolbarItem} ChromeToolbarItem
 * @typedef {AppShell.CurrentRouteInfo} CurrentRouteInfo
 * @typedef {AppShell.BreadcrumbItemWithRouteInfo} BreadcrumbItemWithRouteInfo
 * @typedef {AppShell.StaticRouteInfo} StaticRouteInfo
 * @typedef {AppShell.BreadcrumbItemClicked} BreadcrumbItemClicked
 * @typedef {AppShell.BrowserBackRouteInfo} BrowserBackRouteInfo
 * @typedef {AppShell.ChangedScreenContent} ChangedScreenContentArgs
 * @typedef {AppShell.BreadcrumbDataPropertyChanged} BreadcrumbDataPropertyChanged
 * @typedef {AppShell.SelectedContentWithUrlState} SelectedContentWithUrlState
 * @typedef {AppShell.BreadcrumbSessionState} BreadcrumbSessionState
 * @typedef {AppShell.i18nTranslation} i18nTranslation
 * @typedef {AppShell.SubToolbarInfo} SubToolbarInfo
 * @typedef {AppShell.ResizePanelSizeChanged} ResizePanelSizeChanged
 * @typedef {AppShell.ResizePanelToggled} ResizePanelToggled
 * @typedef {AppShell.ItemFetchSuccess} ItemFetchSuccess
 * @typedef {AppShell.UXFHostedContentUpdated} UXFHostedContentUpdated
 *
 */
function include() {

	const REAPPLY_SUBTOOLBAR_OPTIONS = 'BREADCRUMB_APPSHELL#REAPPLY_SUBTOOLBAR_OPTIONS';
	const HANDLE_SELECTED_CONTENT_CHANGED = 'HANDLE_SELECTED_CONTENT_CHANGED';
	const APPSHELL_SCOPE_NAME = 'sn_app_shell_aw';
	const eventNames = Object.freeze({
		reApplySubtoolbarOptions: REAPPLY_SUBTOOLBAR_OPTIONS,
		handleSelectedContentChanged: HANDLE_SELECTED_CONTENT_CHANGED,
		viewportLoadRequested: 'MACROPONENT_VIEWPORT_LOAD_REQUESTED',
		mainSelectedContentChanged: 'MAIN_SELECTED_CONTENT_CHANGED'
	});
	const defaultI18n = { toggle: "Toggle subtoolbar content", expand: "Expand", collapse: "Collapse" };
	class BreadcrumbUtils {
		/**
		 *
		 * @param {API} api
		 * @param {BreadcrumbItemClicked} event
		 * @param {Helpers} helpers
		 * @param {Record<string, Function>} imports
		 */
		static itemClicked(api, event, helpers, imports) {
			const { route, fields, params, targetRoute, passiveNavigation = false, redirect = false } = event.payload.item.routeInfo;
			const stateNames = BreadcrumbUtils.getStateKeys(api.state);
			api.setState(stateNames.selectedBreadcrumbItem, event.payload.item);
			helpers.navigate.to(route, fields, params, redirect, passiveNavigation, targetRoute);
		}

		static defaultToolbarItem = Object.freeze({
			id: "1761e643c3363010ff85a5a1d840ddbc",
			label: {
				message: "Default",
				translatable: true
			},
			icon: "home-outline",
			viewportInfo: {},
			routeInfo: {
				route: "1761e643c3363010ff85a5a1d840ddbc",
				params: {},
				fields: {},
			},
			group: "top",
			order: 100,
			badge: {},
			presence: {},
			availability: {},
			preparedByAppShell: true
		});

		/**
		 *
		 * @param {API} api
		 * @param {*} event
		 * @param {Helpers} helpers
		 * @param {*} imports
		 */
		static appShellDataSourceUpdated(api, event, helpers, imports) {
			BreadcrumbUtils.invalidateSubtoolbarOptions(api, event, helpers, imports);
			const keyNames = BreadcrumbUtils.getStateKeys(api.state);
			const {resizeDefaultDividerState, defaultLeftPanelRatio, defaultRightPanelRatio} = api.state;
			const {
				defaultDividerPosition = resizeDefaultDividerState.dividerPosition,
				isExpanded = resizeDefaultDividerState.isExpanded,
				leftPanelMinWidth = defaultLeftPanelRatio,
				rightPanelMinWidth = defaultRightPanelRatio
			} = api?.data?.uxr_app_shell_data_source_1?.uxPropertiesAndAuthRoutes?.subToolbar?.global ?? {};

			api.setState(keyNames.defaultLeftPanelRatio, {...leftPanelMinWidth});
			api.setState(keyNames.defaultRightPanelRatio, {...rightPanelMinWidth});
			api.setState(keyNames.resizeDefaultDividerState, {isExpanded, dividerPosition: defaultDividerPosition});

			if (typeof api.state.userPrefKey !== 'string' || api.state.userPrefKey.length === 0)
				api.setState(keyNames.userPrefKey, `workspace.layout.subToolbar.preferences.${api.context.app.appId}`);
			/**
			 * @type {Array<ChromeToolbarItem>}
			 */
			let toolbarItems = [];
			try {
				toolbarItems = [...api.data.uxr_app_shell_data_source_1.uxPropertiesAndAuthRoutes.chrome_toolbar.global];
			} catch (e) {
				toolbarItems = [BreadcrumbUtils.defaultToolbarItem];
			}
			if (!Array.isArray(toolbarItems)  || toolbarItems.length === 0)
				toolbarItems = [BreadcrumbUtils.defaultToolbarItem];

			api.setState(keyNames.chromeToolbarItems, toolbarItems);
			if (Array.isArray(api.state.breadcrumbItems) && api.state.breadcrumbItems.length > 0)
				return;
			if (!api.state?.selectedContentChanged?.payload?.selectedContent)
				return;
			api.emit(eventNames.handleSelectedContentChanged, {
				...api.state.selectedContentChanged.payload
			});
		}
		/**
		 *
		 * @param {API} api
		 * @param {ChangedScreenContentArgs} event
		 * @param {Helpers} helpers
		 * @param {*} imports
		 */
		static screenContentChanged(api, event, helpers, imports) {
			const stateNames = BreadcrumbUtils.getStateKeys(api.state);
			const currentPayload = event.payload?.current;
			const current = Array.isArray(currentPayload) && currentPayload.length ? currentPayload[currentPayload.length - 1] : currentPayload;
			if (Object.keys(current).length === 0)
				return;
			if (!api.state.selectedContent)
				return;
			const selectedToolbarItem = BreadcrumbUtils.getSelectedToolbarItem(api, api.state.selectedContent, api.state.chromeToolbarItems);
			if (!selectedToolbarItem)
				return;
			let newRoute = { ...api.state.selectedContent };
			if (current.status === 'modified' || current.status === 'unmodified' || current.status === 'inserted' || current.status === 'updated') {
				const lastItem = api.state.breadcrumbItems[api.state.breadcrumbItems.length - 1];
				// we are chaning inline objects and no state update required;
				if (lastItem)
					lastItem.isDirty = !!current.isDirty;
			}
			if (current.status === 'closed') {
				const lastItem = api.state.breadcrumbItems[api.state.breadcrumbItems.length - 2];
				newRoute = { ...lastItem.routeInfo };
			} else if (current.screenParams)
				newRoute.fields = { ...current.screenParams };
			else
				return;
			let targetRoute = newRoute.parent ? "current" : newRoute.targetRoute;
			helpers.navigate.to(newRoute.route, newRoute.fields, newRoute.params, true, false, targetRoute);
		}

		/**
		 *
		 * @param {API} api
		 * @param {BreadcrumbDataPropertyChanged} event
		 * @param {Helpers} helpers
		 * @param {*} imports
		 * */
		static breadcrumbPropertyChanged(api, event, helpers, imports) {
			const stateNames = BreadcrumbUtils.getStateKeys(api.state);
			switch (event.payload.name) {
				// For both, activeScreenId and screenTitles change, we need to update the breadcrumb items.
				case stateNames.activeScreenId:
				case stateNames.screenTitles:
					const screenId = event.payload.name === stateNames.activeScreenId
						? event.payload.current
						: api.state.activeScreenId;
					api.setState(stateNames.activeScreenId, screenId);
					if (event.payload.name === stateNames.screenTitles)
						api.setState(stateNames.screenTitles, event.payload.current);

					let selectedToolbarItem = /**@type {ChromeToolbarItem} */(api.state.selectedToolbarItem || {});

					// If no toolbar items, we need to get the selected toolbar item based on selected content and toolbar items.
					if (!selectedToolbarItem?.routeInfo && (api.state.selectedContent && api.state.chromeToolbarItems))
						selectedToolbarItem = BreadcrumbUtils.getSelectedToolbarItem(api, api.state.selectedContent, api.state.chromeToolbarItems);

					// Only updated breadcrumb items when screenId and selected toolbar item has route info.
					if (screenId && selectedToolbarItem?.routeInfo) {
						const cacheKey = BreadcrumbUtils.getCacheKeyWithOptionalParams(api.state.selectedContent, selectedToolbarItem);

                        // code to consider either screenTitle updates or data broker updates
                        const considerScreenTitlesOnly = BreadcrumbUtils.shouldConsiderScreenTitleOnly(api, api.state.selectedContent);
                        if (!considerScreenTitlesOnly)
                            return;

						if (!api.state.routeState.get(cacheKey))
							return;
						if (!Array.isArray(api.state.breadcrumbItems) || api.state.breadcrumbItems.length === 0)
							return;

						/**
						 * @type {Record<string, string>}
						 */
						const screenTitles = event.payload.current || {};
						const newTitle = screenTitles[screenId] || '';

						if (typeof newTitle !== 'string' || newTitle.length === 0)
							return;

						const newItems = [...api.state.breadcrumbItems];

						// Updating last item in breadcrumb items with new title.
						const finalItem = newItems[newItems.length - 1];
						const finalItemCacheKey = BreadcrumbUtils.getCacheKeyWithOptionalParams(finalItem.routeInfo, selectedToolbarItem);

						if (finalItemCacheKey !== cacheKey)
							return;
						if (api.state.chromeToolbarItems.find(item => item?.routeInfo?.route === finalItem?.routeInfo?.route))
							return;
						finalItem.label = newTitle;

						// Updating the cache. So that we can use it later when page refreshes.
						BreadcrumbUtils.updateBreadcrumbItems(api, newItems, selectedToolbarItem, api.state.selectedContent, helpers);
					}



					break;
				case 'changedScreenContent':
					BreadcrumbUtils.screenContentChanged(api, event, helpers, imports);
					break;
			}
		}

		/**
		 *
		 * @param {State} state
		 */
		static getStateKeys(state) {
			const keys = Object.keys(state);
			const obj = /**@type {StateNames} */({});
			keys.forEach((item) => {
				obj[item] = item;
			});
			return Object.freeze(obj);
		}

		/**
		 * @returns {RouteOperation}
		 */
		static getRouteOperations() {
			return Object.freeze({
				Replace: "REPLACE",
				Append: "APPEND",
				ReplaceLastItem: "REPLACE_LAST_ITEM"
			});
		}

		/**
		 * @param {API} api
		 * @param {RouteInfo} routeInfo
		 * @param {ChromeToolbarItem } selectedToolbarItem
		 */
		static updateDatasourceInput(api, routeInfo, selectedToolbarItem) {
			const stateKeys = BreadcrumbUtils.getStateKeys(api.state);
			api.setState(stateKeys.route, routeInfo.route);
			api.setState(stateKeys.fields, routeInfo.fields);
			api.setState(stateKeys.params, routeInfo.params);
			api.setState(stateKeys.fetchStaticRoutes, !api.state.isStaticRoutesFetched);
			api.setState(stateKeys.selectedToolbarItemForBreadcrumb, { ...selectedToolbarItem });
			if (Array.isArray(api.state.breadcrumbItems) && api.state.breadcrumbItems.length > 0) {
				const lastItem = api.state.breadcrumbItems[api.state.breadcrumbItems.length - 1];
				api.setState(stateKeys.prevBreadcrumbRoute, { ...lastItem.routeInfo, isDirty: !!lastItem.isDirty });
			} else
				api.setState(stateKeys.prevBreadcrumbRoute, null);
			api.setState(stateKeys.prevSelectedContent, api.state.prevLocalSelectedContent ? { ...api.state.prevLocalSelectedContent } : null);
		}
		/**
		 * @param {API} api
		 * @param {Array<BreadcrumbItemWithRouteInfo>} newBreadCrumbItems
		 * @param {Helpers} helpers
		 */
		static restoreURLState(api, helpers, newBreadCrumbItems) {
			if (newBreadCrumbItems.length < 2)
				return;
			const { route, fields, params } = newBreadCrumbItems[newBreadCrumbItems.length - 1].routeInfo;
			helpers.navigate.to(route, fields, params, true, false, "current");
		}
		/**
		 *
		 * @param {API} api
		 * @param {RouteInfo} current
		 * @param {Array<ChromeToolbarItem> | null} toolbarItems
		 * @param {BreadcrumbSessionState=} sessionData
		 */
		static getSelectedToolbarItem(api, current, toolbarItems, sessionData) {

			/**
			 * @type {ChromeToolbarItem | undefined}
			 */
			let selectedToolbarItem = undefined;
			toolbarItems = toolbarItems || api.state.chromeToolbarItems;
			if (!Array.isArray(toolbarItems))
				return selectedToolbarItem;
			selectedToolbarItem = toolbarItems.find((item) => {
				if (item.routeInfo.route === current.route)
					return true;
				if (current.parent && current.parent.route === item.routeInfo.route)
					return true;
				return current?.params?.toolbarId === item.id
			});
			if (selectedToolbarItem)
				return selectedToolbarItem;
			else {
				if (!api.state.selectedToolbarItem && sessionData.selectedToolbarId) {
					selectedToolbarItem = toolbarItems.find(item => item?.routeInfo?.route === sessionData.selectedToolbarId);
					if (selectedToolbarItem)
						return selectedToolbarItem;
				}
			}
			const topItems = toolbarItems.filter(item => item.group === 'top');
			const sortedTopItems = topItems.sort((a, b) => a.order - b.order);
			if (sortedTopItems.length > 0)
				return api.state.selectedToolbarItem || sortedTopItems[0];
			const bottomItems = toolbarItems.filter(item => item.group === 'bottom');
			const sortedBottomItems = bottomItems.sort((a, b) => a.order - b.order);
			if (sortedBottomItems.length > 0)
				return api.state.selectedToolbarItem || sortedBottomItems[0];
			return api.state.selectedToolbarItem;
		}

        /**
         * Determines if only the screen title should be considered for the given route.
         * 
         * @param {API} api
         * @param {RouteInfo} current
         * @returns {boolean}
        */
        static shouldConsiderScreenTitleOnly(api, current) {
            const { considerOnlyScreenTitles = false, screenTitlesRouteList = "[]"} = api.context.app || {};
            return JSON.parse(screenTitlesRouteList).some(item => item === current.route) || considerOnlyScreenTitles;
        }

		/**
		 * @param {API} api
		 * @param {ChromeToolbarItem} toolbarItem
		 */
		static getBreadcrumbItemFromToolbarItem(api, toolbarItem) {
			const cacheKey = BreadcrumbUtils.getCacheKeyWithOptionalParams(toolbarItem.routeInfo, toolbarItem);
			let hideBreadcrumb = false;
			if (api.state.outputCache instanceof Map) {
				/**
				 * @type {BreadcrumbItemWithRouteInfo}
				 * */
				const l1Payload = api.state.outputCache.get(cacheKey);
				hideBreadcrumb = (l1Payload && l1Payload?.hideBreadcrumb) || !!toolbarItem.hideBreadcrumb;
			}
			const RouteOperation = BreadcrumbUtils.getRouteOperations();
			let label = "";
			if (typeof toolbarItem.label === 'string')
				label = toolbarItem.label;
			else if (typeof toolbarItem.label.message === 'string')
				label = toolbarItem.label.message;
			if (typeof label !== 'string' || label.length === 0)
				label = toolbarItem.routeInfo.route;
			return {
				hideBreadcrumb,
				icon: toolbarItem.icon,
				label,
				href: "javascript:void(0)",
				operation: RouteOperation.Replace,
				index: 0,
				routeInfo: { ...toolbarItem.routeInfo }
			}
		}
		/**
		 *
		 * @param {RouteInfo} routeInfo
		 */
		static isNewRecordPage(routeInfo) {
			if (!BreadcrumbUtils.isRecordPage(routeInfo))
				return false;
			const fields = /**@type {{table: string, sysId: string}} */({ ...routeInfo.fields });
			return fields.sysId.startsWith("-1") && typeof routeInfo.multiInstField === 'string' && routeInfo.multiInstField === 'sysId';
		}
		/**
		 * @param {RouteInfo} routeInfo
		 */
		static isRecordPage(routeInfo) {
			if (routeInfo.route !== "record")
				return false;
			const fields = /**@type {{table: string, sysId: string}} */({ ...routeInfo.fields });
			return typeof fields.table === 'string' && fields.table.length > 0 && typeof fields.sysId === 'string' && fields.sysId.length > 0;
		}
		/**
		 * @param {API} api
		 * @param {Array<BreadcrumbItemWithRouteInfo>} newItems
		 * @param {ChromeToolbarItem} toolbarItem
		 * @param {RouteInfo} selectedContent
		 * @param {Helpers} helpers
		 */
		static updateBreadcrumbItems(api, newItems, toolbarItem, selectedContent, helpers) {
			const stateNames = BreadcrumbUtils.getStateKeys(api.state);
			/**
			 * @type {Array<{table: string, sysId: string}>}
			 */
			const activeRecords = [];
			let activeParentId = "-1";
			if (BreadcrumbUtils.isRecordPage(selectedContent)) {
				if (!BreadcrumbUtils.isNewRecordPage(selectedContent)) {
					const fields = /**@type {{table: string, sysId: string}} */({ ...selectedContent.fields });
					activeRecords.push({ table: fields.table, sysId: fields.sysId });
					activeParentId = fields.sysId;
				}
			}
			/**
			 * @type  {Array<string>}
			 */
			let toolbarItemsRoutes = [];
			if (Array.isArray(api.state.chromeToolbarItems))
				toolbarItemsRoutes = api.state.chromeToolbarItems.filter((item) => {
					const routeInfo = item.routeInfo;
					if (!routeInfo)
						return false;
					if (typeof routeInfo.route !== 'string')
						return false;
					if (routeInfo.route.length === 0)
						return false;
					return true;
				}).map(item => item.routeInfo.route);
			const toolbarSet = new Set(toolbarItemsRoutes);
			/**
			 * @type {Set<string>}
			 */
			const uniqueSet = new Set();
			newItems = newItems.reverse().filter((item, index, srcItems) => {
				const cacheKey = BreadcrumbUtils.getCacheKey(item.routeInfo, toolbarItem);
				if (uniqueSet.has(cacheKey))
					return false;
				if (toolbarSet.has(item.routeInfo.route)) {
					if (index !== srcItems.length - 1)
						return false;
					if (item.routeInfo.route !== toolbarItem.routeInfo.route)
						return false;
				}
				uniqueSet.add(cacheKey);
				return true;
			}).reverse();
			/**  @type {BreadcrumbItemWithRouteInfo | null} */
			let firstItem = null;
			if (newItems.length > 0)
				firstItem = newItems[0];
			if (!firstItem || firstItem.routeInfo.route !== toolbarItem.routeInfo.route)
				newItems.unshift(BreadcrumbUtils.getBreadcrumbItemFromToolbarItem(api, toolbarItem));
			firstItem = newItems[0];
			if (toolbarItem.routeInfo.route === selectedContent.route)
				firstItem.routeInfo.params = { ...selectedContent.params };
			if (firstItem.label === toolbarItem.routeInfo.route) {
				const label = typeof toolbarItem.label === 'string' ? toolbarItem.label : toolbarItem.label.message;
				if (typeof label === "string" && label.length > 0)
					firstItem.label = label;
			}
			if (typeof firstItem.icon !== 'string' || firstItem.icon.length === 0)
				firstItem.icon = toolbarItem.icon;
			if (toolbarItem.routeInfo.route === BreadcrumbUtils.defaultToolbarItem.routeInfo.route)
				newItems.splice(0, 1);
			newItems.forEach((item, index) => item.index = index);
			api.setState(stateNames.activeRecords, activeRecords);
			api.setState(stateNames.activeParentId, activeParentId);
			if (newItems.length > 0) {
				api.setState(stateNames.hideBreadcrumb, newItems[newItems.length - 1].hideBreadcrumb || false);
			}
			api.setState(stateNames.breadcrumbItems, newItems);
			const lastItem = newItems[newItems.length - 1];
			if (typeof lastItem.pageTitle === 'string' && lastItem.pageTitle.length > 0) {
				helpers.screen.updateStatus({
					title: lastItem.pageTitle
				});
			}
			const cacheKey = BreadcrumbUtils.getCacheKeyWithOptionalParams(selectedContent, toolbarItem);
			api.state.routeSessionKeySet.add(cacheKey);
			api.state.routeSessionKeySet.add(toolbarItem.routeInfo.route);
			api.state.routeState.set(toolbarItem.routeInfo.route, newItems);
			api.state.routeState.set(cacheKey, [...newItems]);
			BreadcrumbUtils.invalidateSubtoolbarOptions(api, {}, helpers, {});
			BreadcrumbUtils.updateSubToolbarConfig(api, lastItem, selectedContent, toolbarItem, api.state.subToolbarPanelRatio);
			BreadcrumbUtils.updateSessionStorageState({ api, l1Route: toolbarItem.id, path: selectedContent.context?.path });
		}

		/**
		 * Update sub toolbar configurations- resize panel & viewport info
		 * @param {API} api
		 * @param {Partial<BreadcrumbItemWithRouteInfo>} lastItem
		 * @param {Object} selectedContent
		 * @param {ChromeToolbarItem} selectedToolbarItem
		 * @param {number=} dividerPosFromEvent
		 * Sample
		 * ```
		 * {
		 *      "viewportInfo": {
		 *          "route": "test",
		 *           //optional fields
		 *          "fields": {},
		 *           "params": {}
		 *       },
		 *       //optional fields, these impact the resize panel for subToolbar and everything on the right side
		 *       "defaultDividerPosition": 25,
		 *       "dividerStyles": {},
		 *       "rightPanelMinWidth": {"minRatio": 20, "minPixels": 100},
		 *       "leftPanelMinWidth": {"minRatio": 20, "minPixels": 100}
		 *   }
		 * ```
		 */
		static updateSubToolbarConfig(api, lastItem, selectedContent, selectedToolbarItem, dividerPosFromEvent = 0, isFromResizePanel = false) {
			const defaultLeftPanelRatio = api.state.defaultLeftPanelRatio;
			const defaultRightPanelRatio = api.state.defaultRightPanelRatio;
			const resizeDefaultDividerState = api.state.resizeDefaultDividerState;

			const keyNames = BreadcrumbUtils.getStateKeys(api.state);
			const globalSubtoolbar = api.data.uxr_app_shell_data_source_1.uxPropertiesAndAuthRoutes.subToolbar?.global || {}
			const { hideSubToolbarFor = [], paths = {} } = globalSubtoolbar;
			let config = lastItem?.subToolbarOptions || {};
			let hideSubToolbar = false;
			if (Object.keys(lastItem ?? {}).length === 0)
				return;
			if (lastItem?.routeInfo?.route === selectedToolbarItem?.routeInfo?.route) {
				if (Array.isArray(hideSubToolbarFor) && hideSubToolbarFor.indexOf(lastItem?.routeInfo?.route) >= 0)
					hideSubToolbar = true;
				else {
					if (Object.keys(paths || {}).length > 0 && !!paths[lastItem?.routeInfo?.route])
						config = { ...paths[lastItem?.routeInfo?.route] };
				}
			} else {
				let l1SpecificConfig = {};
				if (selectedToolbarItem?.routeInfo?.route) {
					if (Object.keys(paths || {}).length > 0 && !!paths[selectedToolbarItem?.routeInfo?.route])
						l1SpecificConfig = { ...paths[selectedToolbarItem?.routeInfo?.route] };
				}
				hideSubToolbar = !!lastItem?.subToolbarOptions?.hideSubToolbar;
				if (lastItem?.subToolbarOptions?.viewportInfo?.route)
					config = { ...lastItem?.subToolbarOptions };
				else
					config = { ...l1SpecificConfig };
			}
			/**
			 * @type {i18nTranslation}
			 * */
			const translations = (api.state.outputCache.get(keyNames.i18nTranslation) || defaultI18n);
			api.setState(keyNames.i18nTranslation, translations);
			config = { ...globalSubtoolbar, ...(config || {}) };
			let viewportInfo = config.viewportInfo;
			hideSubToolbar = hideSubToolbar || !viewportInfo;
			const {
				hoistedContentConfiguration: {
					activeHoistedContent,
					hasHoistedContent
				}
  			} = api.elements.wsLayout;
			const isUtilityPanelConfigured = !!activeHoistedContent && hasHoistedContent;
			/**
			 * @type {SubToolbarInfo}
			 */
			let subToolbarOptions = {
				defaultDisplayedPane: hideSubToolbar && !isUtilityPanelConfigured ? "right" : "both"
			}
			const isL2Found = !hideSubToolbar && !!viewportInfo
			if (isL2Found || isUtilityPanelConfigured) {
				api.setState(keyNames.utilityPanelSeparator, isL2Found && isUtilityPanelConfigured ? 'utilityPanelSeparator': '');
				api.setState(keyNames.hideL2, hideSubToolbar);
				const defaultExpandedButtonProps = {
					icon: "chevron-start-outline",
					"config-aria": {
						button: {
							"aria-label": translations.toggle || defaultI18n.toggle,
							"aria-expanded": "true"
						}
					},
					"tooltip-content": translations.collapse || defaultI18n.collapse
				}
				const defaultCollapsedButtonProps = {
					icon: "chevron-end-outline",
					"config-aria": {
						button: {
							"aria-label": translations.toggle || defaultI18n.toggle,
							"aria-expanded": "false"
						}
					},
					"tooltip-content": translations.expand || defaultI18n.expand
				}
				if (api.state.subToolbarPanelRatio === null || api.state.subToolbarPanelRatio === -1 && config.isExpanded)
					dividerPosFromEvent = defaultLeftPanelRatio.minPixels; // default value;
				const dividerButtonConfig = {
					position: config.position || 'top',
					buttonProps: dividerPosFromEvent > 0 ? defaultExpandedButtonProps : defaultCollapsedButtonProps
				}
				subToolbarOptions = {
					defaultDisplayedPane: hideSubToolbar && !isUtilityPanelConfigured ? "right" : "both",
					defaultDividerPosition: dividerPosFromEvent,
					dividerStyles: config.dividerStyles || {},
					rightPanelMinWidth: config.rightPanelMinWidth || {...defaultRightPanelRatio},
					leftPanelMinWidth: config.leftPanelMinWidth || config.displayDividerButton ? { minPixels: config?.leftPanelMinWidth?.minPixels ?? defaultLeftPanelRatio.minPixels} : { ...defaultLeftPanelRatio },
					displayDividerButton: config.displayDividerButton || false,
					dividerButtonConfig: dividerButtonConfig,
					isExpanded: dividerPosFromEvent > 0
				}
				if (viewportInfo) {
					viewportInfo.viewportElementId = "subToolbarViewport";
					if (!globalSubtoolbar?.noDefaultParamsInFileds)
						viewportInfo.fields = { ...viewportInfo.fields, activeParentId: "", activeRecords: [] };
					viewportInfo.params = {
						...viewportInfo.params,
						selectedContent: selectedContent,
						selectedToolbarItem: selectedToolbarItem,
						prevBreadcrumbRoute: api.state.prevBreadcrumbRoute,
						prevSelectedContent: api.state.prevSelectedContent,
						isExpanded: dividerPosFromEvent > 0,
						activeParentId: api.state.activeParentId,
						activeRecords: api.state.activeRecords
					};
				}
				
				const { isExpanded: storedExpanded, dividerPosition: storedDividerPos } = BreadcrumbUtils.getResizablePanelKnownUserPrefereces(api);
				if (!isFromResizePanel)
					api.setState(keyNames.subToolbarPanelRatio, storedExpanded ? storedDividerPos : 0);
				if (viewportInfo)
					api.emit(eventNames.viewportLoadRequested, viewportInfo);
			} else {
				api.setState(keyNames.hideL2, true);
				subToolbarOptions.defaultDisplayedPane = 'right';
				subToolbarOptions.defaultDividerPosition = 0;
				subToolbarOptions.dividerStyles = {};
				subToolbarOptions.leftPanelMinWidth = {minPixels: 0, minRatio: 0};
				subToolbarOptions.displayDividerButton = false;
				subToolbarOptions.isExpanded = false;
				api.setState(keyNames.subToolbarPanelRatio, 0);
			}
			const newSubtoolbarOptions = {
				...api.state.subToolbarOptions,
				...subToolbarOptions
			};
			api.setState(keyNames.subToolbarOptions, newSubtoolbarOptions);
		}
		/**
		 *
		 * @param {{api: API, path?: string, l1Route?: string}} param0
		 */
		static updateSessionStorageState({ api, l1Route, path }) {
			if (!api.state.isSessionStateLoaded)
				return;
			const stateNames = BreadcrumbUtils.getStateKeys(api.state);
			const sessionState = {
				[stateNames.outputCache]: [...api.state.outputCache],
				[stateNames.routeState]: [...api.state.routeState],
				path: path || api.state.selectedContent.context?.path,
				userName: api.context.session.user.userName,
				userSysId: api.context.session.user.sys_id,
				lang: api.context.session.user.language,
				selectedToolbarId: l1Route || api.state.selectedToolbarItem?.id
			};
			api.setState(stateNames.sessionState, sessionState);
		}
		/**
		 *
		 * @param {SelectedContentWithUrlState} browserBackRouteInfo
		 */
		static isBrowserOperation(browserBackRouteInfo) {
			return browserBackRouteInfo.popState === true || typeof browserBackRouteInfo.updateUrl === 'boolean';
		}

		/**
		 *
		 * @param {API} api
		 * @param {SelectedContentChanged} event
		 * @param {Helpers} helpers
		 * @param {*} imports
		 */
		static selectedContentChanged(api, event, helpers, imports, isLocalCall = false) {
			// remove this event from composition of breadcrumb app shell.
			// sn-canvas-breadcrumbdata is triggering url change events
			if (event.name === eventNames.mainSelectedContentChanged)
				return;
			if (event.payload.selectedContent.isDebugging)
				debugger;

			const stateNames = BreadcrumbUtils.getStateKeys(api.state);

			let { breadcrumbSessionData: sessionData, prevSelectedContent = {}, selectedContent } = event.payload;
			/**
			 * @type {BreadcrumbSessionState}
			 */
			const emptyState = {
				routeState: [],
				outputCache: [],
				lang: api.context.session.user.language,
				path: selectedContent?.context?.path,
				userSysId: api.context.session.user.sys_id,
				userName: api.context.session.user.userName,
				selectedToolbarId: ''
			};

			sessionData = sessionData || emptyState;

			let { routeState, outputCache, pageTitleMap, routeSessionKeySet } = api.state;
			let isJustLoaded = false;
			if (event.payload.breadcrumbSessionData)
				api.setState(stateNames.isSessionStateLoaded, true);

			// Comparing between current user sys id and session user sys id.
			const isSameUser = sessionData.userSysId === api.context.session.user.sys_id;

			if (!(outputCache instanceof Map &&
				routeState instanceof Map &&
				routeSessionKeySet instanceof Set &&
				pageTitleMap instanceof Map) || !api.state.isSessionStateLoaded) {

				isJustLoaded = true;
				if (outputCache instanceof Map)
					sessionData.outputCache = [...sessionData.outputCache, ...[...outputCache]];
				if (routeState instanceof Map)
					sessionData.routeState = [...sessionData.routeState, ...[...routeState]];

				// Clearing cached items if user has been changed.
				if (!isSameUser) {
					sessionData.outputCache = [];
					sessionData.routeState = [];
				}

				outputCache = new Map(api.state.isSessionStateLoaded ? [] : sessionData.outputCache);
				routeState = new Map(api.state.isSessionStateLoaded ? [] : sessionData.routeState);

				if (!(routeSessionKeySet instanceof Set))
					routeSessionKeySet = new Set();
				if (!(pageTitleMap instanceof Map))
					pageTitleMap = new Map();

				api.setState(stateNames.outputCache, outputCache);
				api.setState(stateNames.routeState, routeState);
				api.setState(stateNames.routeSessionKeySet, routeSessionKeySet);
				api.setState(stateNames.pageTitleMap, pageTitleMap);

				// on browser duplicate tab action, "path" parameter is not
				// getting copied from previous tab sessionStorage. check all keys
				if (typeof sessionData.path !== 'string')
					sessionData.path = selectedContent.context?.path || '';
				if (typeof sessionData.lang !== 'string')
					sessionData.lang = api.context.session.user.language;
				if (typeof sessionData.userSysId !== 'string')
					sessionData.userSysId = api.context.session.user.sys_id;
				if (typeof sessionData.userName !== 'string')
					sessionData.userName = api.context.session.user.userName;

				event.payload.breadcrumbSessionData = { ...sessionData };
			}

			api.setState(stateNames.selectedContentChanged, {...event});
			if (isJustLoaded) {
				const {payload} = event;
				helpers.timing.setTimeout( () => {
					api.emit(eventNames.handleSelectedContentChanged, {
						...payload
					});
				}, 30);
				return;
			}
			api.emit(eventNames.handleSelectedContentChanged, {
				...event.payload
			});
		}
		/**
		 *
		 * @param {API} api
		 * @param {SelectedContentChanged} event
		 * @param {Helpers} helpers
		 * @param {*} imports
		 * @param {Array<ChromeToolbarItem>} toolbarItems
		 */
		static handleSelectedContentChanged(api, event, helpers, imports, toolbarItems) {
			if (!(api.state.outputCache instanceof Map)) {
				console.log(`Breadcrumb app shell can not proceed with invalid state`);
				return;
			}
			const {selectedContent, prevSelectedContent} = { ...event.payload };
			const stateNames = BreadcrumbUtils.getStateKeys(api.state);
			/**
			 * @type {Array<ChromeToolbarItem>}
			 */
			const chromeToolbarItems = api.state.chromeToolbarItems || toolbarItems;
			if (!Array.isArray(chromeToolbarItems) || chromeToolbarItems.length === 0) {
				api.setState(stateNames.selectedContentChanged, { ...event });
				return;
			}
			if (!selectedContent || typeof selectedContent === 'string' || typeof selectedContent.route !== 'string')
				return;
			selectedContent.fields = selectedContent.fields || {};
			selectedContent.params = selectedContent.params || {};
			if (BreadcrumbUtils.isRecordPage(selectedContent) && BreadcrumbUtils.isNewRecordPage(selectedContent))
				selectedContent.fields = { ...selectedContent.fields, sysId: "-1" };
			/**
			 * @type {ChromeToolbarItem | undefined}
			 */
			const selectedToolbarItem = BreadcrumbUtils.getSelectedToolbarItem(api, selectedContent, toolbarItems, event.payload.breadcrumbSessionData);
			if (!selectedToolbarItem)
				return;
			if (api.state.selectedContent) {
				const prevSelectedContentAsStr = BreadcrumbUtils.getCacheKeyWithOptionalParams(api.state.selectedContent, selectedToolbarItem);
				const currSelectedContentAsStr = BreadcrumbUtils.getCacheKeyWithOptionalParams(selectedContent, selectedToolbarItem);
				if (prevSelectedContentAsStr === currSelectedContentAsStr)
					return;
			}
			api.setState(stateNames.prevLocalSelectedContent, { ...selectedContent });
			if (selectedContent.passiveNavigation === true) {
				helpers.navigate.to(selectedContent.route, selectedContent.fields,
					selectedContent.params, false, false,
					selectedContent.targetRoute ? selectedContent.targetRoute : "current");
			}
			const currentRouteKey = BreadcrumbUtils.getCacheKeyWithOptionalParams(selectedContent, selectedToolbarItem);
			if (Array.isArray(api.state.breadcrumbItems) && api.state.breadcrumbItems.length > 0) {
				const lastItemRouteKey = BreadcrumbUtils.getCacheKeyWithOptionalParams(api.state.breadcrumbItems[api.state.breadcrumbItems.length - 1].routeInfo, selectedToolbarItem);
				if (currentRouteKey === lastItemRouteKey) {
					const lastItem = api.state.breadcrumbItems[api.state.breadcrumbItems.length - 1];
					lastItem.routeInfo.params = selectedContent.params;
					return;
				}
			}
			/**
			 * @type {Array}
			 */
			const menuItems = api.state.outputCache.get(stateNames.chromeMenuItems);
			api.setState(stateNames.chromeMenuItems, menuItems);
			const selectedBreadcrumbItem = api.state.selectedBreadcrumbItem;
			if (api.state?.selectedToolbarItem?.id !== selectedToolbarItem.id)
				api.setState(stateNames.selectedToolbarItem, selectedToolbarItem);
			api.setState(stateNames.selectedContent, selectedContent);
			const existingRouteIndex = api.state?.breadcrumbItems.findIndex((item) => {
				return BreadcrumbUtils.getCacheKeyWithOptionalParams(item.routeInfo, selectedToolbarItem) === currentRouteKey;
			});
			if (selectedBreadcrumbItem || existingRouteIndex >= 0) {
				api.setState(stateNames.selectedBreadcrumbItem, null);
				const items = [...api.state.breadcrumbItems];
				const selectedIndex = selectedBreadcrumbItem ? selectedBreadcrumbItem.index + 1 : existingRouteIndex + 1;
				items.splice(selectedIndex, items.length - selectedIndex);
				BreadcrumbUtils.updateBreadcrumbItems(api, items, selectedToolbarItem, selectedContent, helpers);
				return;
			}
			const isSameToolbarItem = api.state?.selectedToolbarItem?.id === selectedToolbarItem.id;
			if (!isSameToolbarItem || existingRouteIndex >= 0 || BreadcrumbUtils.isBrowserOperation(selectedContent)) {
				const items = api.state.routeState.get(currentRouteKey);
				if (Array.isArray(items)) {
					if (BreadcrumbUtils.isBrowserOperation(selectedContent))
						api.state.routeState.delete(currentRouteKey);
					BreadcrumbUtils.updateBreadcrumbItems(api, items, selectedToolbarItem, selectedContent, helpers);
					return;
				}
			}
			/**
			 * @type {CurrentRouteInfo}
			 */
			const cachedItemPayload = api.state.outputCache.get(currentRouteKey);
			if (!cachedItemPayload) {
				BreadcrumbUtils.updateDatasourceInput(api, selectedContent, selectedToolbarItem);
				return;
			}
			const routeOperation = BreadcrumbUtils.getRouteOperations();
			let items = cachedItemPayload.items;
			if (!Array.isArray(items))
				items = [cachedItemPayload];
			let finalItems = [...api.state.breadcrumbItems];
			switch (cachedItemPayload.operation) {
				case routeOperation.Replace:
					finalItems = [...items];
					break;
				case routeOperation.ReplaceLastItem:
					finalItems.splice(finalItems.length - 1, 1);
					finalItems = [...finalItems, ...items];
					break;
				case routeOperation.Append:
					finalItems = [...finalItems, ...items];
					break;
			}
			if (finalItems.length > 0) {
				if (currentRouteKey === BreadcrumbUtils.getCacheKeyWithOptionalParams(finalItems[finalItems.length - 1].routeInfo, selectedToolbarItem))
					finalItems[finalItems.length - 1].routeInfo.params = selectedContent.params;
			}
			BreadcrumbUtils.updateBreadcrumbItems(api, finalItems, selectedToolbarItem, selectedContent, helpers);
		}
		/**
		 *
		 * @param {RouteInfo} routeInfo
		 * @param {ChromeToolbarItem} selectedToolbarItem
		 */
		static getOrderedCacheKey(routeInfo, selectedToolbarItem) {
			const { fields = {}, params = {} } = routeInfo;
			const fieldsHash = Object.keys(fields).sort().reduce((fieldsHash, key) => {
				const keyAndValue = `${key}=${fields[key]}`;
				if (fieldsHash.length === 0)
					return keyAndValue;
				return `${fieldsHash}~${keyAndValue}`
			}, '');
			const paramsHash = Object.keys(params).sort().reduce((paramsHash, key) => {
				const value = params[key];
				if (!value)
					return paramsHash;
				const keyAndValue = `${key}=${value}`;
				if (paramsHash.length === 0)
					return keyAndValue;
				return `${paramsHash}~${keyAndValue}`;
			}, '');
			let finalKey = `l1=${selectedToolbarItem?.routeInfo?.route}#route=${routeInfo.route}`;
			if (fieldsHash.length > 0)
				finalKey = `${finalKey}#fields=${fieldsHash}`;
			if (paramsHash.length > 0)
				finalKey = `${finalKey}#params=${paramsHash}`;
			return finalKey;
		}
		/**
		 *
		 * @param {RouteInfo} routeInfo
		 * @param {ChromeToolbarItem} selectedToolbarItem
		 */
		static getCacheKeyWithOptionalParams(routeInfo, selectedToolbarItem) {
			return BreadcrumbUtils.getOrderedCacheKey(routeInfo, selectedToolbarItem);
		}
		/**
		 *
		 * @param {RouteInfo} routeInfo
		 * @param {ChromeToolbarItem} selectedToolbarItem
		 */
		static getCacheKey(routeInfo, selectedToolbarItem) {
			const newRouteInfo = {
				route: routeInfo.route,
				fields: routeInfo.fields
			};
			return BreadcrumbUtils.getOrderedCacheKey(newRouteInfo, selectedToolbarItem);
		}
		/**
		 *
		 * @param {API} api
		 * @param {ItemFetchSuccess} event
		 * @param {Helpers} helpers
		 * @param {Record<string, Function>} imports
		 */
		static dataFetchSuccess(api, event, helpers, imports) {
			/**
			 * @type {RouteOperation}
			*/
			const RouteOperation = BreadcrumbUtils.getRouteOperations();
			const stateNames = BreadcrumbUtils.getStateKeys(api.state);
			/**
			 * @type {Array<ChromeToolbarItem>}
			 */
			let chromeToolbarItems = api.state.chromeToolbarItems;
			let appShellDataSourceOutput = { ...api.data.uxr_app_shell_data_source_1.uxPropertiesAndAuthRoutes };
			// check if menu is enabled or not.
			let isChromeMenuEnabled = appShellDataSourceOutput?.enableMenu?.global?.enableMenu || false;
			if (chromeToolbarItems.length === 0 && !isChromeMenuEnabled)
				return;
			if (!api.state.selectedToolbarItem && !isChromeMenuEnabled)
				return;
			const dataOuput = { ...api.data.breadcrumbs_items_provider.output };
			let translations = dataOuput.i18nTranslation;
			api.setState(stateNames.i18nTranslation, translations);
			const triggeredToolbarItem = chromeToolbarItems.find(item => item.id === dataOuput.input.selectedToolbarItem.id);
			if (!triggeredToolbarItem && !isChromeMenuEnabled)
				return;
			/**
			 * @type {Array}
			 */
			let menuItems;
			if (isChromeMenuEnabled) {
				/**
				 * Priority will be given to UX Page property then extension point. If not both then app shell will render default.
				 */
				menuItems = appShellDataSourceOutput?.menu?.global || [];
				if (menuItems.length > 0)
					menuItems = appShellDataSourceOutput?.menu?.global;
				else {
					// dataOutput gives default one if no extensionn found.
					menuItems = dataOuput.menu.items;
				}
				api.setState(stateNames.chromeMenuItems, menuItems);
			}
			/**
			 * @type {Array<BreadcrumbItemWithRouteInfo>}
			 */
			let finalItems = [];
			/**
			 * @type {Array<BreadcrumbItemWithRouteInfo>}
			 */
			let toBePatchedItems = [];
			const routeState = api.state.routeState;
			if (!Array.isArray(dataOuput.currentRoute.items) || dataOuput.currentRoute.items.length === 0)
				return;

			if (!triggeredToolbarItem)
				return;
			if (triggeredToolbarItem.routeInfo.route !== api.state.selectedToolbarItem.routeInfo.route) {
				toBePatchedItems = routeState.get(triggeredToolbarItem.routeInfo.route) || [];
				if (!api.state.routeSessionKeySet.has(triggeredToolbarItem.routeInfo.route))
					toBePatchedItems = [];
			}
			else {
				toBePatchedItems = routeState.get(api.state.selectedToolbarItem.routeInfo.route) || [];
				if (!api.state.routeSessionKeySet.has(api.state.selectedToolbarItem.routeInfo.route))
					toBePatchedItems = [];
			}
			const isDefaultToolbarItem = triggeredToolbarItem.routeInfo.route === BreadcrumbUtils.defaultToolbarItem.routeInfo.route;
			const chromeToolbarSet = new Set(chromeToolbarItems.map((item) => {
				return item.routeInfo.route;
			}));
			/**
			 *
			 * @param {StaticRouteInfo} rootItem
			 */
			function addToCache(rootItem) {
				if (rootItem.disableCaching)
					return;
				const currentL1RouteConst = isDefaultToolbarItem ? '' : 'current';
				rootItem.items.forEach((item) => {
					if (item.disableCaching)
						return;
					if (!item.routeInfo)
						return;
					if (typeof item.routeInfo.route !== 'string' || item.routeInfo.route.trim().length === 0)
						return;
					let targetRoute = item.routeInfo.targetRoute;
					if (!targetRoute)
						targetRoute = chromeToolbarSet.has(item.routeInfo.route) ? "" : currentL1RouteConst;
					else {
						if (typeof targetRoute === 'string')
							targetRoute = currentL1RouteConst;
						else {
							const l1Route = targetRoute.route;
							if (typeof l1Route !== 'string')
								targetRoute = currentL1RouteConst;
							else {
								const targetToolbar = api.state.chromeToolbarItems.find(item => item.routeInfo.route === l1Route);
								if (!targetToolbar)
									targetRoute = currentL1RouteConst;
							}
						}
					}
					item.hideBreadcrumb = item.hideBreadcrumb || false;
					item.routeInfo.fields = item.routeInfo.fields || {};
					item.routeInfo.params = item.routeInfo.params || {};
					item.routeInfo.targetRoute = targetRoute;
					const routeKey = BreadcrumbUtils.getCacheKeyWithOptionalParams(item.routeInfo, triggeredToolbarItem);
					api.state.outputCache.set(routeKey, item);
					// Setting up menuItems in session cache.
					api.state.outputCache.set(stateNames.chromeMenuItems, menuItems);
				});
				api.state.outputCache.set(stateNames.i18nTranslation, translations)
			}
			if (Array.isArray(dataOuput.staticRoutes)) {
				api.setState(stateNames.isStaticRoutesFetched, true);
				dataOuput.staticRoutes.forEach((staticRoute) => {
					addToCache(staticRoute);
				});
			}
			let currentRoute = dataOuput.currentRoute;
			if (!(currentRoute && currentRoute.routeInfo.route))
				return;
			addToCache(currentRoute);
			const triggeredRouteKey = BreadcrumbUtils.getCacheKeyWithOptionalParams(currentRoute.routeInfo, triggeredToolbarItem);
			if (currentRoute.disableCaching !== true)
				api.state.outputCache.set(triggeredRouteKey, dataOuput.currentRoute);
			if (Object.values(RouteOperation).indexOf(currentRoute.operation) < 0)
				return;
			/**
			 * @type {Array<BreadcrumbItemWithRouteInfo>}
			 */
			if (currentRoute.operation === RouteOperation.Replace)
				finalItems = [...dataOuput.currentRoute.items];
			else if (currentRoute.operation === RouteOperation.Append)
				finalItems = [...toBePatchedItems, ...dataOuput.currentRoute.items];
			else if (currentRoute.operation === RouteOperation.ReplaceLastItem) {
				finalItems = [...toBePatchedItems];
				if (finalItems.length > 0)
					finalItems.splice(finalItems.length - 1, 1);
				finalItems = [...finalItems, ...dataOuput.currentRoute.items];
			}
			finalItems.forEach(
				function (item) {
					//Specifically handle label of Simple List page since it is passed as page property: "listTitle"
					if (item.routeInfo && item.routeInfo.route == "simplelist") {
						if (item.routeInfo.params && item.routeInfo.params.hasOwnProperty("listTitle")) {
							item.label = item.routeInfo.params.listTitle;
						}
					}
				}
			);
			// flag to consider either screenTitle updates or data broker updates
            const considerScreenTitlesOnly = BreadcrumbUtils.shouldConsiderScreenTitleOnly(api,  currentRoute.routeInfo);
            const screenTitle = (api.state.screenTitles && api.state.screenTitles[api.state.activeScreenId]) || '';
			if (considerScreenTitlesOnly && screenTitle)
				finalItems[finalItems.length - 1].label = screenTitle
			BreadcrumbUtils.updateSessionStorageState({ api, path: api.state.selectedContent?.context?.path, l1Route: api.state.selectedToolbarItem?.id });
			routeState.set(triggeredToolbarItem.routeInfo.route, [...finalItems]);
			const requestInitiatedSelectedContent = BreadcrumbUtils.getCacheKeyWithOptionalParams(currentRoute.routeInfo, triggeredToolbarItem);
			const currentSelectedContent = BreadcrumbUtils.getCacheKeyWithOptionalParams(api.state.selectedContent, api.state.selectedToolbarItem);
			if (requestInitiatedSelectedContent === currentSelectedContent)
				BreadcrumbUtils.updateBreadcrumbItems(api, finalItems, triggeredToolbarItem, currentRoute.routeInfo, helpers);
		}
		/**
		 *
		 * @param {API} api
		 * @param {ResizePanelSizeChanged | ResizePanelToggled} event
		 * @param {Helpers} helpers
		 * @param {Record<string, Function>} imports
		 */
		static l2Resized(api, event, helpers, imports) {
			const keyNames = BreadcrumbUtils.getStateKeys(api.state);
			let newDividerPosition = 0;
			const toBeSavedUserPref = {
				isExpanded: true,
				dividerPosition: api.state.knownDividerPosition
			}
			if (event.name === 'NOW_RESIZABLE_PANES#PANE_SIZES#CHANGED') {
				if (event.payload.interaction === 'PROP_CHANGE')
					return;
				newDividerPosition = event.payload.dividerPosition || 0;
				api.setState(keyNames.subToolbarPanelRatio, newDividerPosition);
				toBeSavedUserPref.dividerPosition = newDividerPosition;
				const minPixels = api.state.subToolbarOptions?.leftPanelMinWidth?.minPixels || api.state.defaultLeftPanelRatio.minPixels;
				const diff = event.payload.firstPanePixels - minPixels;
				if (Math.abs(diff) < 1 || diff < 0) {
					toBeSavedUserPref.isExpanded = false;
					newDividerPosition = 0;
					api.setState(keyNames.subToolbarPanelRatio, 0);
				} else {
					api.setState(keyNames.knownDividerPosition, event.payload.dividerPosition);
					toBeSavedUserPref.isExpanded = true;
					api.setState(keyNames.subToolbarPanelRatio, newDividerPosition);
				}
			} else if (event.name === 'NOW_RESIZBLE_PANES#DIVIDER_BUTTON#CLICKED') {
				const isExpanded = api.state.subToolbarPanelRatio === 0;
				newDividerPosition = isExpanded ? api.state.knownDividerPosition : 0;
				toBeSavedUserPref.isExpanded = isExpanded;
				api.setState(keyNames.subToolbarPanelRatio, newDividerPosition);
			}
			api.setState(keyNames.l2ResizePref, toBeSavedUserPref);
			api.data.save_user_preference_1.execute({ name: api.state.userPrefKey, value: JSON.stringify(toBeSavedUserPref) });
			const itemsLength = api.state.breadcrumbItems.length;
			const lastItem = api.state.breadcrumbItems.at(itemsLength - 1);
			BreadcrumbUtils.updateSubToolbarConfig(api, lastItem ?? {},
				api.state.selectedContent,
				api.state.selectedToolbarItem, newDividerPosition, true);
		}
		/**
		 *
		 * @param {API} api
		 */
		static getResizablePanelKnownUserPrefereces(api) {

			if (api.state.l2ResizePref)
				return { ...api.state.l2ResizePref };
			const preferences = api.data.look_up_user_preferences_1.result?.preferences;
			const defaultResizePaneState = { ...api.state.resizeDefaultDividerState };
			if (Array.isArray(preferences) && preferences.length > 0) {
				const item = preferences.find(item => {
					return item.name === api.state.userPrefKey;
				});
				if (!item) {
					const {
						isExpanded = defaultResizePaneState.isExpanded,
						defaultDividerPosition = defaultResizePaneState.dividerPosition
					} = api.data.uxr_app_shell_data_source_1?.uxPropertiesAndAuthRoutes?.subToolbar?.global || {};
					defaultResizePaneState.isExpanded = isExpanded;
					defaultResizePaneState.dividerPosition = defaultDividerPosition;
					return defaultResizePaneState;
				}
				if (typeof item?.value === 'string') {
					try {
						/**
						 * @type {{dividerPosition: number, isExpanded: boolean}}
						 */
						const newPref = JSON.parse(item.value);
						if (typeof newPref.dividerPosition === 'number')
							defaultResizePaneState.dividerPosition = newPref.dividerPosition;
						if (typeof newPref.isExpanded === 'boolean')
							defaultResizePaneState.isExpanded = newPref.isExpanded;
						if (defaultResizePaneState.dividerPosition >= 100 || defaultResizePaneState.dividerPosition < 0)
							defaultResizePaneState.dividerPosition = api.state.resizeDefaultDividerState.dividerPosition;
					} catch (e) {
						console.error('JSON preference parsing error => ' + e);
					}
				}
			}
			if (defaultResizePaneState.isExpanded && defaultResizePaneState.dividerPosition <= 0)
				defaultResizePaneState.dividerPosition = api.data?.uxr_app_shell_data_source_1?.uxPropertiesAndAuthRoutes?.subToolbar?.global?.defaultDividerPosition || 25; // just some value
			return defaultResizePaneState;
		}
		/**
		 *
		 * @param {API} api
		 * @param {{elementId: string, name: string}} event
		 * @param {Helpers} helpers
		 * @param {Record<string, Function>} imports
		 */
		static userPreferenceSucceeded(api, event, helpers, imports) {
			const { elementId, name } = event;
			if (elementId === "save_user_preference_1" && name === "DATA_OP_SUCCEEDED")
				api.data.look_up_user_preferences_1.refresh();
			else if (elementId === "look_up_user_preferences_1" && name === "DATA_FETCH_SUCCEEDED")
				BreadcrumbUtils.invalidateSubtoolbarOptions(api, event, helpers, imports);
		}
		/**
		 *
		 * @param {API} api
		 * @param {any} event
		 * @param {Helpers} helpers
		 * @param {Record<string, Function>} imports
		 */
		static invalidateSubtoolbarOptions(api, event, helpers, imports) {
			const isLoopupResolved = Object.keys(api.data.look_up_user_preferences_1?.result || {}).length > 0;
			const isPagePropsResoved = isLoopupResolved && Object.keys(api.data.uxr_app_shell_data_source_1?.uxPropertiesAndAuthRoutes || {}).length > 0;
			if (!isPagePropsResoved)
				return;
			helpers.timing.setTimeout(() => {
				api.emit(eventNames.reApplySubtoolbarOptions, {});
			}, 30);
		}
		/**
		 *
		 * @param {API} api
		 * @param {any} event
		 * @param {Helpers} helpers
		 * @param {Record<string, Function>} imports
		 */
		static reApplySubtoolbarOptions(api, event, helpers, imports) {
			const { dividerPosition, isExpanded } = BreadcrumbUtils.getResizablePanelKnownUserPrefereces(api);
			const keyNames = BreadcrumbUtils.getStateKeys(api.state);
			//api.setState(keyNames.subToolbarPanelRatio, isExpanded? dividerPosition: 0);
			api.setState(keyNames.knownDividerPosition, dividerPosition);
			const itemsLength = api.state.breadcrumbItems.length;
			const lastItem = api.state.breadcrumbItems.at(itemsLength - 1);
			BreadcrumbUtils.updateSubToolbarConfig(api, lastItem ?? {}, api.state.selectedContent, api.state.selectedToolbarItem, isExpanded ? dividerPosition : 0);
		}
		/**
		 * 
		 * @param {API} api 
		 * @param {UXFHostedContentUpdated} event 
		 * @param {Helpers} helpers 
		 * @param {*} imports 
		 */
		static handleUxfHostedContentUpdated(api, event, helpers, imports) {
			helpers.timing.setTimeout(() => {
				api.emit(eventNames.reApplySubtoolbarOptions, {});
			}, 30);
		}
	}
	return BreadcrumbUtils;
}
