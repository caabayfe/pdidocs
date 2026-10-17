api.controller=function($scope, spModal, spUtil) {
	/* widget controller */
	var c = this;
	
	// Constants
	var OPEN_RECORD_WIDGET_SYS_ID = c.data.openRecordWidget;
	var OPEN_LIST_WIDGET_SYS_ID = c.data.openListWidget;
	var PLAYBOOK_OPEN_RECORD = "PLAYBOOK#OPEN_RECORD";
	var PLAYBOOK_OPEN_LIST = "PLAYBOOK#OPEN_LIST";
	var PLAYBOOK_RECORD_GENERATED = "PLAYBOOK#RECORD_GENERATED";
	var PLAYBOOK_ADD_NOTIFICATIONS = "PLAYBOOK#ADD_NOTIFICATIONS";
	var PLAYBOOK_LINK_TO_DESTINATION = "PLAYBOOK#LINK_TO_DESTINATION";
	var PLAYBOOK_RESIZE_IFRAME = "PLAYBOOK#RESIZE_IFRAME";
	var PLAYBOOK_FIX_DOUBLE_SCROLL = "PLAYBOOK#FIX_DOUBLE_SCROLL";
	var PLAYBOOK_FIX_DOUBLE_SCROLL_PADDING = 'PLAYBOOK#FIX_DOUBLE_SCROLL_PADDING';
	var PLAYBOOK_ORIGINAL_IFRAME_HEIGHT = 'PLAYBOOK#ORIGINAL_IFRAME_SIZE';

	// Setting height from data right away
	var height = c.data.height;
	$scope.iframeHeight = height;
	sessionStorage.setItem(PLAYBOOK_ORIGINAL_IFRAME_HEIGHT, height);
	
	// Required Params
	var table = c.data.table;
	var sysId = c.data.sysId;
	var layoutType = c.data.layoutType;
	var playbookUIBPageUrl = c.data.playbookUIBPageUrl;

	// Optional Params
	// All params are Kebab/Dashed case so we 
	// do not have convert the case in the loop
	var urlSuffix = c.data.urlSuffix; // to be used in handleRecordGenerator
	var params = {
		"playbook-experience-id": c.data.playbookExperienceId,
		"compact-mode" : c.data.compactMode,
		"activity-view" : c.data.activityView,
		"query" : c.data.query,
		"full-width-cards" : c.data.fullWidthCards,
		"hide-stage-picker" : c.data.hideStagePicker,
		"number-of-stages" : c.data.numberOfStages,
		"page-title": c.data.pageTitle,
		"url-suffix": urlSuffix,
		"extra-params": c.data.extraParams
	};
	var fullPageRefreshAfterRecordGenerator = c.data.fullPageRefreshAfterRecordGenerator;
	
	// Theme variables 
	var theme = c.data.theme;
	var themeVariant = c.data.themeVariant;

	// Base URL
	// If playbookUIBPageUrl is not our default base do not use the layoutType param
	var url = (playbookUIBPageUrl === "/now/playbook-portal/playbook") ? 
		playbookUIBPageUrl+"/"+table+"/"+sysId+"/"+layoutType : 
		playbookUIBPageUrl+"/"+table+"/"+sysId;

	// Add params to url if any are found that are truthy
	for(var key in params) {
		if(!params.hasOwnProperty(key) || !params[key]) continue;

		if(params[key] && !url.includes("params")) url += "/params"; 

		if(params[key]) url += "/" + key + "/" + params[key];
	}
	
	// Adding theme variables to url if any are found that are truthy
	// Example: ?themeId=31bf91ae07203010e03948f78ad30095&themeVariantId=1
	if(theme)
		url += "?themeId=" + theme;
	
	if(theme && themeVariant)
		url += "&themeVariantId=" + themeVariant;
	
	// setting the url used by the iframe here
	$scope.iframeUrl = url;

	window.addEventListener("storage", function(event) {
		
		if(!event || !event.key) return;

		var key = event.key;
		var newValue = event.newValue;
		
		if(key === PLAYBOOK_OPEN_RECORD) 
			openRecordInModal(newValue);
		
		if(key === PLAYBOOK_OPEN_LIST) 
			openListInModal(newValue);

		if(key === PLAYBOOK_RECORD_GENERATED) 
			handleRecordGenerator(newValue);
		
		if(key === PLAYBOOK_ADD_NOTIFICATIONS)
			handleAddNotifications(newValue);

		if (key === PLAYBOOK_LINK_TO_DESTINATION)
			handleLinkToDestination(newValue);
		
		if (key === PLAYBOOK_RESIZE_IFRAME) {
			var value = JSON.parse(newValue);
			var iframe = document.getElementById("widget-playbook");
			iframe.height = value.currentHeight;
		}
	});
	
	sessionStorage.setItem(PLAYBOOK_FIX_DOUBLE_SCROLL, c.data.isHeightDynamic);
	sessionStorage.setItem(PLAYBOOK_FIX_DOUBLE_SCROLL_PADDING, c.data.dynamicHeightPadding);


	function openModal(options) {
		var modalOptions = options;

		spModal.open(modalOptions);
	}

	function openRecordInModal(newValue) {
		var value = JSON.parse(newValue);
		
		var widgetInput = {
			table: value.table,
			sys_id: value.sys_id,
			isPopup: c.data.openRecordIsPopUp,
			preventUrlUpdateOnSubmit: c.data.openRecordModalPreventUrlUpdateOnSubmit
		};
		
		if(c.data.openRecordModalView)
			widgetInput.view = c.data.openRecordModalView;

		if(value.params && value.params.query)
			widgetInput.query = value.params.query;
		
		var modalOptions = {
			widget: OPEN_RECORD_WIDGET_SYS_ID, 
			widgetInput: widgetInput,
			size: c.data.openRecordModalSize,
			title: c.data.openRecordModalTitle,
			message: c.data.openRecordModalMessage
		};
		
		if(c.data.openRecordModalButtons)
			modalOptions.buttons = JSON.parse(c.data.openRecordModalButtons);
		
		// Open form widget in the spModal
		openModal(modalOptions);
	}

	function openListInModal(newValue) {
		var value = JSON.parse(newValue);
			
		var widgetInput = {
				table: value.table || value.fields && value.fields.table,
				view: value.listView || value.params && value.params.listView,
				filter: value.query || value.params && value.params.query
		};
		
		var modalOptions = {
			widget: OPEN_LIST_WIDGET_SYS_ID, 
			widgetInput: widgetInput,
			size: c.data.openListModalSize,
			title: c.data.openListModalTitle,
			message: c.data.openListModalMessage
		};
		
		if(c.data.openListModalButtons)
			modalOptions.buttons = JSON.parse(c.data.openListModalButtons);
			
		// Open list widget in the spModal
		openModal(modalOptions);
	}

	function handleRecordGenerator(newValue) {
		if(!newValue) return;
		
		var value = JSON.parse(newValue);

		if(!value) return;

		var urlParams = new URLSearchParams(window.location.search);
		urlParams.set("sys_id", value.sysId);
		urlParams.set("table", value.table);
		
		if (fullPageRefreshAfterRecordGenerator === "true") {
			window.location.search = urlParams;
		} else {
			window.history.replaceState({}, '', urlSuffix+"?"+urlParams);
		}

	}

	function handleLinkToDestination(newValue) {
		if(!newValue) return;
		
		var value = JSON.parse(newValue);

		if(!value || !value.external) return;

		window.open(value.external, value.targetRoute || '_blank');
	}

	function handleAddNotifications(newValue) {
		if(!newValue) return;
		
		var value = JSON.parse(newValue);

		if(!value || !value.notifications) return;
		
		var notifications = value.notifications;
		var INFO = "info";
		var ERROR = "error";
		var CRITICAL = "critical";
		
		for(var i in notifications) {
			var notification = notificationFactory(notifications[i]);
			if(notification.type === INFO) {
				spUtil.addInfoMessage(notification.message);
				continue;
			}
			
			if(notification.type === ERROR || notification.type === CRITICAL) {
				spUtil.addErrorMessage(notification.message);
				continue;
			}
			
			if(notification.message) 
				spUtil.addTrivialMessage(notification.message);
		}
		
		
	}

	function notificationFactory(notification) {

		if(notification.status) {
			var message = notification.content;
			var header = notification.header;
			
			if(header && message)
				message = header + " - " + message;
			else if(header && !message)
				message = header;
			
			return {
				type: notification.status,
				message: message
			};
		}

		return notification;
	}

};
