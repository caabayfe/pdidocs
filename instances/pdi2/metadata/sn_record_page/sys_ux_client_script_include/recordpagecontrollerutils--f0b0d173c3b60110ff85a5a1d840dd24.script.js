// @ts-check
/**
 * @param {params} params
 * @param {*} proxyArg 
 * @param {{api: params["api"], event: params["event"], helpers: params["helpers"], imports: params["imports"]}} params 
 * @returns 
 */
 function pageControllerUtils(proxyArg, params) {
	const { api, event, helpers, imports } = params;
	const gform = getNewGform(api);
	function getNewGform(api) {
		var form = api.data?.glide_form_1?.nowRecordFormBlob || {};
		var activityStream = api.data?.glide_form_1?.nowActivityStreamConnected || {};
		var recordForm = {};
		if (form) {
			recordForm = {
				table: form.table,
				sysId: form.sysId,
				isValid: form.isValidRecord,
				isNew: form.isNewRecord,
				isAudited: form.isAudited,
				related: {
					lists: form.visibleRelatedLists
				},
				acl: {
					canRead: form.canReadRecord
				},
				form: {
					header: {
						transformedSecondaryItems: api.data?.glide_form_1?.nowRecordCommonHeader?.transformedSecondaryItems
					}
				},
				activityStream: {
					timestamp: activityStream?.timestamp
				}
			}
		}
		return recordForm;
	}
	const PREFIX = "workspace.layout.sidebar_ratio.";
	const table = api.context.props.inputTable || 'global';
	const FORM_RATIO_PREF_NAME = `workspace.layout.form_ratio.${table}`;
	const sidebarRatioPreference = PREFIX + table;
	const FORM_LAYOUT_TYPE = `workspace.layout.type.${table}`;
	const COMPACT_PREF_NAME = "glide.ui.compact";
	// fetch the user's show sidebar preference value
	const {
		getUserPreference
	} = imports["sn_uib_base_aw.userPreferenceUtils"](api.context.props.userPrefs || {});

	const isCompact = getUserPreference(COMPACT_PREF_NAME);
		// preference name
	const SHOW_SIDEBAR_PREF_NAME = "workspace.showAgentAssist";
	// Sidebar specific constants
	const DEFAULT_POSITION_CLOSED = isCompact ? "-40px" : "-48px";
	const SIDEBAR_CLOSED_CONSTRAINT = { "minPixels": isCompact ? 40 : 48 };
	const SIDEBAR_OPEN_CONSTRAINT = { "minRatio": 20, "minPixels": 370 };
	const SIDEBAR_HIDDEN_CONSTRAINT = { "minPixels": 0 };
	const DEFAULT_POSITION_HIDDEN = "100";
	function setRibbonCollapsedState() {
		const showRibbon = getUserPreference("workspace.showRibbon");
		api.setState('isRibbonCollapsed', !showRibbon);
	}

	function checkUserPrefOnPropChange() {
		const lookupPref = [sidebarRatioPreference, FORM_RATIO_PREF_NAME, FORM_LAYOUT_TYPE].join(',');
		api.setState('lookupPreferenceNames', lookupPref, false);
	}

	/**
	 * 
	 * @param {boolean} isHidden 
	 */
	function toggleSidebar(isHidden) {
		if (isHidden) {
			// If the savedSidebarRatio has not been initialized before hiding the element
			// then save it before collapsing the sidebar.
			if (!api.state.sidebarRatioSaved)
				api.setState('sidebarRatioSaved', api.state.sidebarDividerPosition);

			// close the sidebar
			api.setState("sidebarPaneContraints", SIDEBAR_CLOSED_CONSTRAINT);
			api.setState("sidebarDividerPosition", DEFAULT_POSITION_CLOSED);
		} else {
			// open the sidebar
			api.setState("sidebarPaneContraints", SIDEBAR_OPEN_CONSTRAINT);
			api.setState("sidebarDividerPosition", api.state.sidebarRatioSaved);
		}
		api.setState("sidebarDisabled", isHidden);
	};

	/** START RECORD HISTORY HELPER FUNCTIONS **/
	function getTabIdFromSelectedTab(str) {
		if (!str) {
			return '';
		}
		// Split the string by '^' to get all key-value pairs
		const pairs = str.split('^');
		// Iterate over the pairs and split each by '='
		for (const pair of pairs) {
			const [key, value] = pair.split('=');
			// Check if we found the 'id' key
			if (key?.toLowerCase() === 'id') {
				return value || ""; // In case value is undefined
			}
		}
		return '';
	}

	/**
	* determine if we should trigger record history generation
	*	- Only invoke when record is not new;
	*	- Only invoke when record is audited;
	*	- Only invoke if tabId is for the record history tab
	*/
	function shouldGenerateRecordHistory(selectedTab = '', selectedTabIndex = 0, isInitialPageLoad = false) {
		if (gform.isNew || !gform.isAudited)
			return false;

		// 'recordHistory' is the value in the current record page template for the tab slot
		// 'cldkt66wk02g93b7vaejgm12q' was the previous value before we specified the proper id above
		const recordHistoryTabIds = [
			'recordHistory',
			'cldkt66wk02g93b7vaejgm12q'
		];
		const selectedTabId = getTabIdFromSelectedTab(selectedTab);

		// older record pages may not have tab id sent in the event payload, if so fallback to old tab index logic
		// when page is not initial load or page is not on default tab
		if (!selectedTabId) {
			return (!isInitialPageLoad || selectedTabIndex != 0);
		}

		return recordHistoryTabIds.includes(selectedTabId);
	}
	/** END RECORD HISTORY FUNCTIONS **/

	return {
		getResizePrefNames() {
			return {
				sidebarRatioPreference: sidebarRatioPreference,
				formRatioUserPreference: FORM_RATIO_PREF_NAME
			};
		},
		isDataControllerInitialized() {	
			return typeof gform.table === 'string' && gform.table.length > 0;
		},
		validateRecord() {
			if (typeof gform.isNew !== 'boolean' || typeof gform.isValid !== 'boolean')
				return;
			const hideRecordNotFound = gform.isNew || gform.isValid;
			let hideSecurityConstraints = true;
			if (gform.acl && typeof gform.acl.canRead === 'boolean') {
				if (gform.isValid && !gform.acl.canRead)
					hideSecurityConstraints = false;
			}
			api.setState('hideRecordNotFound', hideRecordNotFound);
			api.setState('hideSecurityConstraints', hideSecurityConstraints);
		},

		/**
		 * 
		 * @param {Map<string, string>=} lookUpMap 
		 * @returns 
		 */
		setSideBarPosition(lookUpMap) {		

			// --- use user pref on first call, and api state thereafter
			const sidebarOn = api.state.isSideBarSet ? !api.state.sidebarDisabled : getUserPreference(SHOW_SIDEBAR_PREF_NAME);
			// --- remember that we've been here before
			api.setState("isSideBarSet", true);

			const sidebarDisabled = !sidebarOn;
			const sidebarRatioSavedValue = lookUpMap?.get(sidebarRatioPreference);
			const sidebarRatioSaved = typeof sidebarRatioSavedValue === 'string' ? sidebarRatioSavedValue: null;
			const formRatioSavedValue = lookUpMap?.get(FORM_RATIO_PREF_NAME);
			const formRatioSaved = typeof formRatioSavedValue === 'string' ? formRatioSavedValue: null;
			const position = sidebarOn ? sidebarRatioSaved : DEFAULT_POSITION_CLOSED;

			if (sidebarDisabled)
				api.setState("sidebarPaneContraints", SIDEBAR_CLOSED_CONSTRAINT);
			if (sidebarRatioSaved)
				api.setState('sidebarRatioSaved', sidebarRatioSaved);
			if (formRatioSaved)
				api.setState('formRatioSaved', formRatioSaved);

			api.setState('sidebarDisabled', sidebarDisabled);
			if (position)
				api.setState('sidebarDividerPosition', position);
			api.setState('lookupUserPrefs', Object.fromEntries(lookUpMap), false);
		},

		/**
		 * 
		 * @param {Map<string, string>=} lookupUserPrefs 
		 * @returns 
		 */
		setFormLayoutConfig(lookupUserPrefs) {
			
			if (gform.activityStream && gform.activityStream.timestamp === 0 || gform.isNew)
				api.setState('formLayoutConfig', {actionBar: false, defaultDisplayedPane: 'left'});
			else {
				/**
				 * @type {"both" | "left" | "right"}
				 */
				let defaultDisplayedPane = 'both';
				const formLayoutType = `workspace.layout.type.${gform.table}`;
				lookupUserPrefs = lookupUserPrefs || new Map (Object.entries(api.state.lookupUserPrefs));
				if (!(lookupUserPrefs instanceof Map))
					lookupUserPrefs = new Map();
				switch(lookupUserPrefs.get(formLayoutType)) {
					case '0':
						defaultDisplayedPane = 'left';
						break;
					case '2':
						defaultDisplayedPane = 'right';
					break;
				}
				api.setState('formLayoutConfig', {actionBar: true, defaultDisplayedPane});
			}
		},

        onDataFetchStatusCompleted() {
			const formBlob = api.data?.glide_form_1?.nowRecordFormBlob;
			const formLayoutConfig = formBlob?.currentUser?.formLayoutConfig;
			const personalizeForm = formBlob?.config?.personalizeForm;
			const lookUpMap = new Map();
			if(personalizeForm) 
				lookUpMap.set('personalizeForm', personalizeForm);
			if (formLayoutConfig) {
				lookUpMap.set(sidebarRatioPreference, formLayoutConfig.sideBarSizeRatio);
				lookUpMap.set(FORM_RATIO_PREF_NAME, formLayoutConfig.formSizeRatio);
				lookUpMap.set(FORM_LAYOUT_TYPE, formLayoutConfig.formLayoutType?.toString());
				this.setSideBarPosition(lookUpMap);
			}	
            this.setRelatedList();
            this.setFormLayoutConfig(lookUpMap);
            this.validateRecord();
            this.getSecondaryItems();
        },
        setRelatedList() {
            function handleRelatedListChange(current) {
				const currentList = Array.isArray(current)? current: [];
				api.setState('relatedLists', currentList, true);
			}
            handleRelatedListChange(gform.related.lists);
        },
		onMacroponentReady() {
			setRibbonCollapsedState();
		},
		onUserPrefsPropertyChange() {
			if (event.payload.name === 'userPrefs') {
				setRibbonCollapsedState();
				checkUserPrefOnPropChange();
				const {
					getUserPreference
				} = imports["sn_uib_base_aw.userPreferenceUtils"](api.context.props.userPrefs || {});
				const pref = !!getUserPreference("workspace.showAgentAssist");
				toggleSidebar(!pref);
			}
		},
		onSidebarTabCollapsed() {
			/**
			 * @type {{collapsed: boolean}}
			 */
			 const { collapsed } = event.payload;
			 toggleSidebar(collapsed);
		},
		onSidebarTabItemsChanged(newTabs) {
			const hasTabs = newTabs && newTabs.filter(tab => tab.conditional !== true).length > 0;
			if (!hasTabs) {
				api.setState("sidebarPaneContraints", SIDEBAR_HIDDEN_CONSTRAINT);
				api.setState('sidebarDividerPosition', DEFAULT_POSITION_HIDDEN);
			} else {
				if (api.state.sidebarDividerPosition === DEFAULT_POSITION_HIDDEN) {
					toggleSidebar(api.state.sidebarDisabled);
				}
			}
		},
		onTabSelected() {
			let { selectedTabIndex, id, isInitialPageLoad = false, selectedTab, selectedTabLabel } = event.payload;
			if (typeof selectedTabIndex === 'string')
				selectedTabIndex = parseInt(selectedTabIndex);

			// differentiate between main horizontal tabset where details/related list are VS sidebar context panel tabset
			const isMainRecordPageTabset = id === 'relatedList';
			if (isMainRecordPageTabset) {
				if (shouldGenerateRecordHistory(selectedTab, selectedTabIndex, isInitialPageLoad)) {
					api.data.generate_record_history_data.execute({
						'table': gform.table,
						'sysId': gform.sysId
					});
				}
				if (!isInitialPageLoad) {
					api.emit('CONTENT_UPDATED', {
						params: {
							selectedTabIndex: selectedTabIndex,
							selectedTab: selectedTab,
							selectedTabLabel: selectedTabLabel,
							query: api.context.props.inputQuery,
							views: api.context.props.forcedViewName,
							extraParams: api.context.props.inputExtraParams
						}
					});
				}
			} else {
				// sidebar
				const { sidebarTabIndex, sidebarDisabled } = api.state;
				const isHidden = isInitialPageLoad? sidebarDisabled: (selectedTabIndex == sidebarTabIndex && !sidebarDisabled);
				toggleSidebar(isHidden);
				api.setState('sidebarTabIndex', selectedTabIndex, false);
			}
		},
        getSecondaryItems() {
			var transformedSecondaryItems = gform?.form?.header?.transformedSecondaryItems;
			if (Array.isArray(transformedSecondaryItems) &&  transformedSecondaryItems.length > 0)
			{ 
				api.setState('secondaryItems',  transformedSecondaryItems, false);
			} else {
				api.setState('secondaryItems', null, false);
			}
		},
		onUserPreferenceDRSuccess() {
			/**
			 * @type {Array<{name: string, value: string}>}
			 */
			const userPrefs = api.data.getSidebarRatioPreference.result.preferences

			// Startup determination of sidebar status, driven first by menu toggle, then by possibly save pref value
			/**
			 * @type {Map<string, string>}
			 */
			let lookUpMap = new Map();
			userPrefs.forEach(item => {
				lookUpMap.set(item.name, item.value);
			});
			this.setSideBarPosition(lookUpMap)
			this.setFormLayoutConfig(lookUpMap);
		}
	}
}
