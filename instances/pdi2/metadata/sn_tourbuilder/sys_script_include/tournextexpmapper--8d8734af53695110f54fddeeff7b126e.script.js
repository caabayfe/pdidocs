var TourNextExpMapper = Class.create();
TourNextExpMapper.prototype = {
    initialize: function() {},

    /**
     * To support existing tours created on UI 16 Application Navigator in Next Exp (Polaris).. 
     * Below Map is 1 to 1 mapping from UI 16 selector to Next Exp (Polaris) 
     * Note: This is not the exhaustive list of all the elements exist on UI 16 Application Navigator, Banner but just
     * a subset of elements which could map directly from UI16 to Polaris.
     *
     */
    ui16ToNextExpMap: {
		//Top Left Logo
        'a.navbar-brand': {
            jsPath: "macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> #header-logo-image",
            seismicSelector: "img[id='header-logo-image']"
        },
		'.navbar-header [ng-click="setNavigatingState(true)"]': {
			jsPath: "macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> #header-logo-image",
            seismicSelector: "img[id='header-logo-image']"
		},

		//Input Filter in Left Side Filter Navigator
        'input[id="filter"].form-control.form-control-search': {
            jsPath: "macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> sn-polaris-menu.is-main-menu.is-pinned >>> #filter",
            seismicSelector: "input[id='filter']"
        },
        'input#filter.form-control.form-control-search': {
            jsPath: "macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> sn-polaris-menu.is-main-menu.is-pinned >>> #filter",
            seismicSelector: "input[id='filter']"
        },
        '#filter': {
            jsPath: "macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> sn-polaris-menu.is-main-menu.is-pinned >>> #filter",
            seismicSelector: "input[id='filter']"
        },
		//Input Filter form in Left Side Filter Navigator
		'form.navigator-filter-form.sn-live-search.sn-live-search_themed.sn-live-search_show-add': {
			jsPath: "macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> sn-polaris-menu.is-main-menu.is-pinned >>> #filter",
            seismicSelector: "input[id='filter']"
		},
		'.navigator-filter-form': {
			jsPath: "macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> sn-polaris-menu.is-main-menu.is-pinned >>> #filter",
            seismicSelector: "input[id='filter']"
		},
		'form.navigator-filter-form.sn-live-search.sn-live-search_themed.sn-live-search_show-add div.sn-live-search-flex div.input-group-transparent': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> sn-polaris-menu.is-main-menu.is-open.is-pinned >>> div.sn-polaris-nav-header-filter',
			seismicSelector: 'div.sn-polaris-nav-header-filter'
		},
		'form.navigator-filter-form.sn-live-search.sn-live-search_themed.sn-live-search_show-add div.sn-live-search-flex:nth-of-type(1) div.input-group-transparent:nth-of-type(1)': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> sn-polaris-menu.is-main-menu.is-open.is-pinned >>> div.sn-polaris-nav-header-filter',
			seismicSelector: 'div.sn-polaris-nav-header-filter'
		},
		//Cancel button in Input filter
		'span[id="nav_filter_controls"].btn.icon.icon-cross-circle': {
			jsPath: "macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> sn-polaris-menu.is-main-menu.is-open.is-pinned >>> #filter-input-button-d6e462a5c3533010cbd77096e940dd8c",
			seismicSelector: "button[id='filter-input-button-d6e462a5c3533010cbd77096e940dd8c']"
		},
		
		/* Start of Menu Items */
		
		//All Apps
		'a[id="allApps_tab"].btn.btn-icon.sn-navhub-btn.sn-tooltip-basic.allApps.icon-all-apps': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> div.tab-name.shown',
			seismicSelector: 'div.tab-name.shown'
		},
		'a#allApps_tab.btn.btn-icon.sn-navhub-btn.sn-tooltip-basic.allApps.icon-all-apps': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> div.tab-name.shown',
			seismicSelector: 'div.tab-name.shown'
		},
		'#allApps_tab': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> div.tab-name.shown',
			seismicSelector: 'div.tab-name.shown'
		},
		'a[id="allApps_tab"].btn.btn-icon.sn-navhub-btn.sn-tooltip-basic.allApps.icon-all-apps.default-focus-outline': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> div.tab-name.shown',
			seismicSelector: 'div.tab-name.shown'
		},
		
		//History
		'a[id="history_tab"].btn.btn-icon.sn-navhub-btn.sn-tooltip-basic.history.icon-history': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> div.tab-name.shown',
			seismicSelector: 'div.tab-name.shown'
		},
		'a#history_tab.btn.btn-icon.sn-navhub-btn.sn-tooltip-basic.history.icon-history': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> div.tab-name.shown',
			seismicSelector: 'div.tab-name.shown'
		},
		'#history_tab': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> div.tab-name.shown',
			seismicSelector: 'div.tab-name.shown'
		},
		'a[id="history_tab"].btn.btn-icon.sn-navhub-btn.sn-tooltip-basic.history.icon-history.default-focus-outline': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> div.tab-name.shown',
			seismicSelector: 'div.tab-name.shown'
		},

		//Favourites
		'a[id="favorites_tab"].btn.btn-icon.sn-navhub-btn.sn-tooltip-basic.favorites.icon-star': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> div.tab-name.shown',
			seismicSelector: 'div.tab-name.shown'
		},
		'a#favorites_tab.btn.btn-icon.sn-navhub-btn.sn-tooltip-basic.favorites.icon-star': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> div.tab-name.shown',
			seismicSelector: 'div.tab-name.shown'
		},
		'#favorites_tab': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> div.tab-name.shown',
			seismicSelector: 'div.tab-name.shown'
		},
		'a[id="favorites_tab"].btn.btn-icon.sn-navhub-btn.sn-tooltip-basic.favorites.icon-star.default-focus-outline': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> div.tab-name.shown',
			seismicSelector: 'div.tab-name.shown'
		},
		
		/* End of Menu Items */
		
		/* Start of Help Panel */
		
		'button.btn.btn-icon.icon-help.embedded-help-toggle.sn-tooltip-basic': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> span[data-id="help-button"]',
			seismicSelector: 'span[data-id="help-button"]'
		},
		'button.btn.btn-icon.icon-help.embedded-help-toggle.sn-tooltip-basic.state-selected': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> span[data-id="help-button"]',
			seismicSelector: 'span[data-id="help-button"]'
		},
		'div.help-content-container.sn-widget.sn-aside.sn-aside_themed.sn-aside_header.sn-aside_open': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> sn-help-panel >>> div',
			seismicSelector: 'div.sn-help-panel.-visible.-polaris'
		},
		'div.sn-embedded-help-pane-content div.sn-aside.sn-aside_themed.sn-aside_left.sn-aside_open.sn-pane-content.sn-help-aside:nth-of-type(1) div.sn-aside-header:nth-of-type(1)': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> #helpMenu > span[role="heading"]',
			seismicSelector: 'sn-contextual-menu[id="helpMenu"] span[role="heading"]'
		},
		'div.help-content:nth-of-type(2)': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> sn-help-panel >>> div',
			seismicSelector: 'div.sn-help-panel-body-container.-polaris'
		},
		'.help-content-container': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> sn-help-panel >>> div',
			seismicSelector: 'div.sn-help-panel-body-container.-polaris'
		},
		'DIV:nth-of-type(6) [ng-click="toggleHelpPane()"]': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> span[data-id="help-button"]',
			seismicSelector: 'span[data-id="help-button"]'
		},
		'.nav DIV:nth-of-type(6) [ng-click="toggleHelpPane()"]': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> span[data-id="help-button"]',
			seismicSelector: 'span[data-id="help-button"]'
		},
		'.nav > DIV:nth-of-type(5) [ng-click="toggleHelpPane()"]': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> span[data-id="help-button"]',
			seismicSelector: 'span[data-id="help-button"]'
		},
		'button\\.btn\\.btn-icon\\.icon-help\\.embedded-help-toggle\\.sn-tooltip-basic\\.ng-isolate-scope': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> span[data-id="help-button"]',
			seismicSelector: 'span[data-id="help-button"]'
		},
		
		/* End of Help Panel */
		
		
		// User menu
		'button[id="user_info_dropdown"]': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> div[data-id="user-menu"]',
			seismicSelector: 'div[data-id="user-menu"]'
		},
		'button#user_info_dropdown': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> div[data-id="user-menu"]',
			seismicSelector: 'div[data-id="user-menu"]'
		},
		'#user_info_dropdown': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> div[data-id="user-menu"]',
			seismicSelector: 'div[data-id="user-menu"]'
		},
		'#user_info_dropdown > DIV': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> div[data-id="user-menu"]',
			seismicSelector: 'div[data-id="user-menu"]'
		},
		'#user_info_dropdown .caret': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> div[data-id="user-menu"]',
			seismicSelector: 'div[data-id="user-menu"]'
		},
		'div.dropdown.pull-left': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> div[data-id="user-menu"]',
			seismicSelector: 'div[data-id="user-menu"]'
		},
		
		// Nav bar Header
		'div.navbar-header': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> div[data-id="header-starting"]',
			seismicSelector: 'div[data-id="header-starting"]'
		},
		'.navbar-header': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> div[data-id="header-starting"]',
			seismicSelector: 'div[data-id="header-starting"]'
		},
		'div.navbar.navbar-default.sn-frameset-header': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> div[data-id="header-starting"]',
			seismicSelector: 'div[data-id="header-starting"]'
		},
		
		//Entire Header
		'div.navbar.navbar-default.sn-frameset-header div.container-fluid': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> nav',
			seismicSelector: 'nav.polaris-layout'
		},
		'.navbar-divider': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> nav',
			seismicSelector: 'nav.polaris-layout'
		},
		
		//Search in Nav bar
		'[for="sysparm_search"] .input-group-addon-transparent': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> sn-search-input-wrapper >>> sn-component-workspace-global-search-typeahead >>> div > div.searchinput-cancel-button-wrapper > div > div',
			seismicSelector: 'div.sn-global-typeahead-control.-global'
		},
		'form.form-inline.navpage-global-search div.input-group-transparent': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> sn-search-input-wrapper >>> sn-component-workspace-global-search-typeahead >>> div > div.searchinput-cancel-button-wrapper > div > div',
			seismicSelector: 'div.sn-global-typeahead-control.-global'
		},
		'form.form-inline.navpage-global-search div.input-group-transparent:nth-of-type(1)': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> sn-search-input-wrapper >>> sn-component-workspace-global-search-typeahead >>> div > div.searchinput-cancel-button-wrapper > div > div',
			seismicSelector: 'div.sn-global-typeahead-control.-global'
		},
		'label.input-group-addon-transparent.icon-filter': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> sn-polaris-menu.is-main-menu.is-open.is-pinned >>> now-icon',
			seismicSelector: 'div[data-id="menu-header-d6e462a5c3533010cbd77096e940dd8c"] div.sn-polaris-nav-header-filter now-icon[icon="filter-outline"]'
		},
		'input[id="sysparm_search"].form-control.form-control-search.sn-tooltip-basic': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> sn-search-input-wrapper >>> sn-component-workspace-global-search-typeahead >>> #sncwsgs-typeahead-input',
			seismicSelector: 'input[id="sncwsgs-typeahead-input"]'
		},
		'input[id="sysparm_search"].form-control.form-control-search.sn-tooltip-basic.focus': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> sn-search-input-wrapper >>> sn-component-workspace-global-search-typeahead >>> #sncwsgs-typeahead-input',
			seismicSelector: 'input[id="sncwsgs-typeahead-input"]'
		},
		'input#sysparm_search.form-control.form-control-search.sn-tooltip-basic.focus': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> sn-search-input-wrapper >>> sn-component-workspace-global-search-typeahead >>> #sncwsgs-typeahead-input',
			seismicSelector: 'input[id="sncwsgs-typeahead-input"]'
		},
		//Span in Search Button
		'span.input-group-addon-transparent.icon-search.sysparm-search-icon': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> sn-search-input-wrapper >>> sn-component-workspace-global-search-typeahead >>> span',
			seismicSelector: 'span.sn-global-typeahead-searchIcon.-global'
		},
		
		//Tree in Left Filter Navigator
		'div[id="nav_west_center"].sn-aside.sn-aside_left.sn-aside_themed.sn-aside_open.sn-connect-aside': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> sn-polaris-menu.is-main-menu.is-open.is-pinned >>> div.sn-tree-menu.sn-polaris-nav-content',
			seismicSelector: 'div.sn-tree-menu.sn-polaris-nav-content'
		},
		'div#nav_west_center.sn-aside.sn-aside_left.sn-aside_themed.sn-aside_open.sn-connect-aside': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> sn-polaris-menu.is-main-menu.is-open.is-pinned >>> div.sn-tree-menu.sn-polaris-nav-content',
			seismicSelector: 'div.sn-tree-menu.sn-polaris-nav-content'
		},
		'#nav_west_center': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> sn-polaris-menu.is-main-menu.is-open.is-pinned >>> div.sn-tree-menu.sn-polaris-nav-content',
			seismicSelector: 'div.sn-tree-menu.sn-polaris-nav-content'
		},
		
		//Right side navbar with help, notification, user menu icons
		'div.collapse.navbar-collapse': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> div[data-id="header-ending"]',
			seismicSelector: 'div[data-id="header-ending"]'
		},
		//Options under user menu
		'div.dropdown.pull-left.open ul.dropdown-menu:nth-of-type(1) li:nth-of-type(1) a:nth-of-type(1)': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> button[data-id="profile"]',
			seismicSelector: 'button[data-id="profile"]'
		},
		'div.dropdown.pull-left.open ul.dropdown-menu:nth-of-type(1) li:nth-of-type(1) a': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> button[data-id="profile"]',
			seismicSelector: 'button[data-id="profile"]'
		},

		//User Avatar
		'span.sn-avatar-image': {
			jsPath: 'macroponent-f51912f4c700201072b211d4d8c26010 >>> sn-polaris-layout >>> sn-polaris-header >>> now-avatar >>> span.now-avatar-content',
			seismicSelector: 'div[data-id="user-menu"] > now-avatar > span.now-avatar > span.now-avatar-content'
		},
		
		
	
    },

    ui16ToNextExpRegexMap: {
        '^.module-node \\[data-id="[a-z0-9]{32}"\\]$': {
            seismicSelector: "a[data-id='${0}']",
        },
        '^.module-node\\[id="[a-z0-9]{32}"\\]$': {
            seismicSelector: "a[data-id='${0}']"
        },
        '^.app-node\\[data-id="[a-z0-9]{32}"\\]$': {
            seismicSelector: "button[data-id='${0}']"
        },
		'^#concourse_module_[a-z0-9]{32}$': {
			seismicSelector: "li[data-id='${0}-row']"
		},
		'^\\[data-id="[a-z0-9]{32}"\\] span$': {
			seismicSelector: "button[data-id='${0}'] div.item-label span.label"
		},
		'^\\[id="[a-z0-9]{32}"\\]$': {
			seismicSelector: "a[data-id='${0}']"
		},
		'^#[a-z0-9]{32}$': {
			seismicSelector: "a[data-id='${0}']"
		},
		'^a\\[id="[a-z0-9]{32}"\\]$': {
			seismicSelector: "a[data-id='${0}']"
		},
		'^\\[id="[a-z0-9]{32}"\\] .sn-widget-list-title$': {
			seismicSelector: "a[data-id='${0}'] span.item-icon span.label"
		},
		'^#[a-z0-9]{32} .sn-widget-list-title$': {
			seismicSelector: "a[data-id='${0}'] span.item-icon span.label"
		},
		'^#concourse_application_[a-z0-9]{32} \\[href="javascript:void\\(0\\)"\\]$': {
			seismicSelector: "button[data-id='${0}']"
		},
		'^#concourse_application_[a-z0-9]{32} > \\[href="javascript:void\\(0\\)"\\]$': {
			seismicSelector: "button[data-id='${0}']"
		},
		'^#concourse_application_[a-z0-9]{32} > \\[href="javascript:void\\(0\\)"\\] SPAN$': {
			seismicSelector: "button[data-id='${0}'] div.item-label span.label"
		},
		'^#concourse_application_[a-z0-9]{32} > button.sn-aside-btn.btn.btn-icon.sn-aside-btn_control.nav-favorite-app.nav-app-button.app-action-icon-btn.icon-star-empty$': {
			seismicSelector: "button[data-id='${0}'] span.menu-action-container button.menu-action.favorite.menu-action-interaction-state"
		},
		'^#concourse_application_[a-z0-9]{32} .nav-favorite-app$': {
			seismicSelector: "button[data-id='${0}'] span.menu-action-container button.menu-action.edit-menu.menu-action-interaction-state"
		},
		'^#concourse_module_[a-z0-9]{32} DIV:nth-of-type\\(2\\) \\[data-id="[a-z0-9]{32}"\\]$': {
			seismicSelector: "span[data-id='${0}'] span.menu-action-container button.menu-action.favorite.menu-action-interaction-state"
		},
		'^#concourse_module_[a-z0-9]{32} .sn-widget-list_v2 > DIV > .sn-widget-list-content \\[data-id="[a-z0-9]{32}"\\]$': {
			seismicSelector: "span[data-id='${0}'] span.menu-action-container button.menu-action.favorite.menu-action-interaction-state"
		},
		'^\\[id="[a-z0-9]{32}"\\] \\[data-id="[a-z0-9]{32}"\\]$': {
			seismicSelector: "a[data-id='${0}'] span.item-icon"
		},
		'^button\\[data-id="[a-z0-9]{32}"\\].btn.btn-icon.sn-widget-list-action.nav-favorite-module.module-action-icon-btn.icon-star-empty$': {
			seismicSelector: "span[data-id='${0}-parent'] span.menu-action-container button.menu-action.favorite.menu-action-interaction-state"
		},
		'^button\\[data-id="[a-z0-9]{32}"\\].btn.btn-icon.sn-widget-list-action.state-disable-animation.icon-edit.nav-edit-module.module-action-icon-btn$': {
			seismicSelector: "span[data-id='${0}-parent'] span.menu-action-container button.menu-action.edit-menu.menu-action-interaction-state"
		},
		'^button\\[data-id="[a-z0-9]{32}"\\].sn-aside-btn.btn.btn-icon.sn-aside-btn_control.state-overwrite-hidden.icon-edit.nav-edit-app.nav-app-button.app-action-icon-btn$': {
			seismicSelector: "button[data-id='${0}'] span.menu-action-container button.menu-action.edit-menu.menu-action-interaction-state"
		},
		'^button\\[data-id="[a-z0-9]{32}"\\].sn-aside-btn.btn.btn-icon.sn-aside-btn_control.nav-favorite-app.nav-app-button.app-action-icon-btn.state-overwrite.icon-star$': {
			seismicSelector: "button[data-id='${0}'] span.menu-action-container button.menu-action.favorite.menu-action-interaction-state.is-favorite"
		},
		'^button\\[data-id="[a-z0-9]{32}"\\].sn-aside-btn.btn.btn-icon.sn-aside-btn_control.nav-favorite-app.nav-app-button.app-action-icon-btn.icon-star-empty$': {
			seismicSelector: "button[data-id='${0}'] span.menu-action-container button.menu-action.favorite.menu-action-interaction-state"
		},
		'^a\\[data-id="[a-z0-9]{32}"\\].nav-expandable.sn-aside-group-title.sn-aside-group-title_selectable.sn-aside-group-title_nav.nav-open-state$': {
			seismicSelector: "button[data-id='${0}']"
		},
		'^a\\[data-id="[a-z0-9]{32}"\\].nav-expandable.sn-aside-group-title.sn-aside-group-title_selectable.sn-aside-group-title_nav.nav-open-state span:nth-of-type\\(2\\)$': {
			seismicSelector: "button[data-id='${0}'] div.item-label span.label"
		},
		'^a\\[data-id="[a-z0-9]{32}"\\].nav-expandable.sn-aside-group-title.sn-aside-group-title_selectable.sn-aside-group-title_nav.collapsed span:nth-of-type\\(2\\)$': {
			seismicSelector: "button[data-id='${0}'] div.item-label span.label"
		},
		'^a\\[data-id="[a-z0-9]{32}"\\].nav-expandable.sn-aside-group-title.sn-aside-group-title_selectable.sn-aside-group-title_nav.collapsed$': {
			seismicSelector: "button[data-id='${0}']"
		},
		'^li#concourse_module_[a-z0-9]{32} div.sn-widget-list_v2.sn-widget-list_dense:nth-of-type\\(1\\) a.nav-expandable.sn-aside-group-title.sn-aside-group-title_selectable.sn-aside-group-title_nav.nav-open-state:nth-of-type\\(1\\)$': {
			seismicSelector: "a[data-id='${0}']"
		},
		'^li[id="concourse_module_[a-z0-9]{32}"] div.sn-widget-list_v2.sn-widget-list_dense:nth-of-type\\(1\\) a.nav-expandable.sn-aside-group-title.sn-aside-group-title_selectable.sn-aside-group-title_nav.nav-open-state:nth-of-type\\(1\\)$': {
			seismicSelector: "a[data-id='${0}']"
		},
		'^li#concourse_module_[a-z0-9]{32} div.sn-widget-list_v2.sn-widget-list_dense:nth-of-type\\(1\\) a.nav-expandable.sn-aside-group-title.sn-aside-group-title_selectable.sn-aside-group-title_nav.nav-open-state:nth-of-type\\(1\\) span:nth-of-type\\(2\\)$': {
			seismicSelector: "a[data-id='${0}'] span.item-icon span.label"
		},
		'^li[id="concourse_module_[a-z0-9]{32}"] div.sn-widget-list_v2.sn-widget-list_dense:nth-of-type\\(1\\) a.nav-expandable.sn-aside-group-title.sn-aside-group-title_selectable.sn-aside-group-title_nav.nav-open-state:nth-of-type\\(1\\) span:nth-of-type\\(2\\)$': {
			seismicSelector: "a[data-id='${0}'] span.item-icon span.label"
		},
		'^li#concourse_module_[a-z0-9]{32} div.sn-widget-list_v2.sn-widget-list_dense:nth-of-type\\(1\\) a.nav-expandable.sn-aside-group-title.sn-aside-group-title_selectable.sn-aside-group-title_nav.collapsed:nth-of-type\\(1\\)$': {
			seismicSelector: "a[data-id='${0}']"
		},
    },

    getNextExpSelector: function(manualCss) {
		if(!manualCss || typeof manualCss !== 'string') {
			return null;
		}
		
		manualCss = manualCss.trim();
		
        if (this.ui16ToNextExpMap[manualCss]) {
            return this.ui16ToNextExpMap[manualCss];
        }

		var regexExp, regexSelector, regexMatch;
        try {
            var regexKeys = Object.keys(this.ui16ToNextExpRegexMap);
            for (var i = 0; i < regexKeys.length; i++) {
				regexExp = new RegExp(regexKeys[i]);
                if (regexExp.test(manualCss)) {
					regexMatch = manualCss.match(/[a-z0-9]{32}/);
					regexSelector = {
						'jsPath': '',
						'seismicSelector': this.ui16ToNextExpRegexMap[regexKeys[i]].seismicSelector.replace('${0}', regexMatch[0])
					};
					return regexSelector;
                }
            }
        } catch (e) {

        }

        return null;
    },
	
	nextExpToUI16Map: {
		"img[id='header-logo-image']": {
			manualCSS: 'a.navbar-brand'
		},
		"div[id='header-logo-link']": {
			manualCSS: 'a.navbar-brand'
		},
		"div[id='d6e462a5c3533010cbd77096e940dd8c']": {
			manualCSS: 'a[id="allApps_tab"]'
		},
		"div[id='1b682fe1c3133010cbd77096e940dd18']": {
			manualCSS: 'a[id="favorites_tab"]'
		},
		"div[id='c51543a5c3133010cbd77096e940dd43']": {
			manualCSS: 'a[id="history_tab"]'
		},
		"div.sn-polaris-navigation.polaris-header-menu": {
			manualCSS: 'div.sn-navhub-content.sn-navhub-content_static.sn-navhub-content_constrain'
		},
		"div.polaris-header-controls": {
			manualCSS: 'div.collapse.navbar-collapse'
		},
		"input[id='sncwsgs-typeahead-input']": {
			manualCSS: '#sysparm_search'
		},
		"input[id='filter']": {
		    manualCSS: 'input[id="filter"]'
		},
		"span[data-id='help-button']": {
			manualCSS: 'button.embedded-help-toggle'
		},
		"span[data-id='help-button'] now-icon.contextual-zone-icon svg.now-icon.-md": {
			manualCSS: 'button.embedded-help-toggle'
		},
		"div[data-id='user-menu']": {
			manualCSS: '#user_info_dropdown'
		},
		"span.now-avatar.-sm.has-image span.now-avatar-content img.now-avatar-img": {
			manualCSS: '#user_info_dropdown span.sn-avatar-image'
		},
		//Entire All Menu
		"div.sn-polaris-nav.d6e462a5c3533010cbd77096e940dd8c.can-animate": {
			manualCSS: '#nav_west_center'
		},
		//Entire Favourite Menu
		"div.sn-polaris-nav.1b682fe1c3133010cbd77096e940dd18.can-animate": {
			manualCSS: '#nav_west_center'
		},
		"div.sn-polaris-nav.c51543a5c3133010cbd77096e940dd43.can-animate": {
			manualCSS: '#nav_west_center'
		},
		"div.sn-polaris-nav-body": {
			manualCSS: '#nav_west_center'
		},
		"button[data-id='profile'] div.user-menu-label.polaris-enabled": {
			manualCSS: 'div.dropdown.pull-left.open ul.dropdown-menu:nth-of-type(1) li:nth-of-type(1) a'
		}
	},
	
	nextExpToUI16RegexMap: {
		"^a\\[data-id='[a-z0-9]{32}'\\] span.item-icon span.label$": {
			manualCSS: '[data-id="${0}"] .sn-widget-list-title'
		},
		"^a\\[data-id='[a-z0-9]{32}'\\] span.item-icon$": {
			manualCSS: '[data-id="${0}"] .sn-widget-list-title'
		},
		"^a\\[data-id='[a-z0-9]{32}'\\]$": {
			manualCSS: '.module-node [data-id="${0}"]'
		},
		"^button\\[data-id='[a-z0-9]{32}'\\] div.item-label span.label$": {
			manualCSS: '[data-id="${0}"] span'
		},
		"^button\\[data-id='[a-z0-9]{32}'\\]$": {
			manualCSS: '[data-id="${0}"]'
		},
		"^button\\[data-id='[a-z0-9]{32}'\\] div.item-label span.chevron-container svg.now-icon.chevron$": {
			manualCSS: '[data-id="${0}"]'
		}
	},

    getUI16Selector: function(seismicSelector) {
		if(!seismicSelector || typeof seismicSelector !== 'string') {
			return null;
		}
		
		seismicSelector = seismicSelector.trim();
		
        if (this.nextExpToUI16Map[seismicSelector]) {
            return this.nextExpToUI16Map[seismicSelector];
        }

		var regexExp, regexSelector, regexMatch;
        try {
            var regexKeys = Object.keys(this.nextExpToUI16RegexMap);
            for (var i = 0; i < regexKeys.length; i++) {
				regexExp = new RegExp(regexKeys[i]);
                if (regexExp.test(seismicSelector)) {
					regexMatch = seismicSelector.match(/[a-z0-9]{32}/);
					regexSelector = {
						'manualCSS': this.nextExpToUI16RegexMap[regexKeys[i]].manualCSS.replace('${0}', regexMatch[0])
					};
					return regexSelector;
                }
            }
        } catch (e) {

        }

        return null;
    },

    type: 'TourNextExpMapper'
};
