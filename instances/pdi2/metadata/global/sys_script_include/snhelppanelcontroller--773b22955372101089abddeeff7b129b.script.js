var SNHelpPanelController = Class.create();
SNHelpPanelController.prototype = {
    initialize: function() {
		this.documentController = new SNHelpDocumentController();
		this.constants = new SNHelpConstantProvider(); 
    },
	
	/*
	* This method will take current url and optional  
	* route object containing key/value pair
	* @param - url - full browser url
	* @param - routeObj - route object is client side routing object
	*/

	searchPanelContent : function(url, routeObj) {
		var parsedUrl,
			result;
		// parse routeobj if it's JSON string
		try {
			if (typeof routeObj === "string")
				routeObj = JSON.parse(routeObj);
		} catch (ex) {
			// route obj is not json string.. ignore
		}

		parsedUrl = this.parseURL(url, routeObj);
		result = this.documentController.searchDocuments(parsedUrl.context, parsedUrl.app_route, parsedUrl.routeObj);

		return result;
	},
	/*
	Generic structure of the routeObj for non workspace use cases

	routeObj = {
		type : custom,
		page : pageName,
		app_route : app_route,
		params : {
			param1 : value1,
			param2 : value2
		}
	}
	*/
	parseURL: function(url, routeObj) {
		var context,
			wsContexts,
			app_route;

		url = decodeURIComponent(url);

		//special handling for workspace
		if(url.indexOf("now/workspace") >= 0 && this.isObject(routeObj)) {
			wsContexts = this.parseWorkspaceUrl(url, routeObj);
			context = wsContexts[0];
			app_route = wsContexts[1];

		} else if(this.isObject(routeObj)) {
			context = routeObj.page;
			app_route = routeObj.app_route;
		} else {
			context = routeObj;
		}
		return ({
			context : context,
			app_route : app_route,
			routeObj : this.isObject(routeObj) ? routeObj : {}
		});
	},

	isObject : function (object) {
			return (object !== null && typeof object === "object" && !Array.isArray(object));
	},
	/*
	* assuming the url is - location.pathname + locaiton.search
	*
	*/
	parseWorkspaceUrl : function(url, routeObj) {
		var separator = this.constants.separator,
			urlParts, appRoute, moduleId, context = "";

		url = url.substr(url.indexOf("now/workspace"));
		urlParts = url.split("/");

		if(urlParts.length > 2)
			appRoute = [urlParts[1], urlParts[2]].join(separator);

			if(routeObj && routeObj.type) {
				switch(routeObj.type) {
					case "module" :
						moduleId = routeObj.module_id ? routeObj.module_id : "";
						context = [routeObj.type, moduleId].join(separator);
						if(moduleId === "list" && routeObj.params && routeObj.params.listId)
							context = [context, routeObj.params.listId].join(separator);
						break;
					case "record" :
					case "new_record" :
						context = [routeObj.type, routeObj.table].join(separator);
						break;
					default:
						context = routeObj.page || "";
						appRoute = routeObj.app_route || "";
				}
			}

		return [context, appRoute];
	},

    type: 'SNHelpPanelController'
};
