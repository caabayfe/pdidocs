(function process( /*ResolverEnvironment*/ env) {
	var contentBlocks = null;
	var arguments = env.getArguments();
	var blockId = arguments.blockId || "";
	var pageId = arguments.pageId || "";	
	var pageParams = arguments.pageParams || "";	
	var aceUtil = new ACEAppBuilderUtilV2();
	
	var getMacroponents = function(routeArry) {
		var routeGr = new GlideRecord("sys_ux_app_route");
		routeGr.addQuery("route_type", "IN", routeArry); 
		routeGr.query();
		var screentype2RouteMap = {};
		while(routeGr.next()) {
			screentype2RouteMap[routeGr.getValue("screen_type")] = routeGr.getValue("route_type");        
		}

		var screenTypes = Object.keys(screentype2RouteMap);

		var screenGr = new GlideRecord("sys_ux_screen");
		screenGr.addQuery("screen_type", "IN", screenTypes);
		screenGr.query();
		var route2MacroponentMap = {};
		while(screenGr.next()) {
			route2MacroponentMap[screentype2RouteMap[screenGr.getValue("screen_type")]] = screenGr.getValue("macroponent");
		}
		gs.info('getMacroponents ' + JSON.stringify(route2MacroponentMap));
		return route2MacroponentMap;
	};
	
	if(pageParams) {
		pageParams = JSON.parse(pageParams);
	}else {
		pageParams = [];
	}
	
	if(blockId) {		
		if(!aceUtil.hasReadAccess()) {
			contentBlocks = [];
		}else {
			var cbQuery = {
				'sys_id': blockId,
				'or': {'parent': blockId,
					'parent.parent': blockId,
					'parent.parent.parent': blockId,
					'parent.parent.parent.parent': blockId,
					'parent.parent.parent.parent.parent': blockId,
					'parent.parent.parent.parent.parent.parent': blockId,
					'parent.parent.parent.parent.parent.parent.parent': blockId,
					'parent.parent.parent.parent.parent.parent.parent.parent': blockId,
					'parent.parent.parent.parent.parent.parent.parent.parent.parent': blockId,
					'parent.parent.parent.parent.parent.parent.parent.parent.parent.parent': blockId
				}
			};
			var cbPageParams = {
				'pageId': pageId,
				'pageParams': pageParams
			};
			contentBlocks = aceUtil._getContentBlocksBFS(null, cbQuery, cbPageParams, blockId);		
		}
		
		contentBlocks.forEach(function(cb) {
			cb.isRoot = true;
		});			
		
		var needsTraversal = true;
		var blocksToProcess = contentBlocks;
		var blocksInWaiting = [];
		var uniqueRoutes = [];
		while(needsTraversal) {
			if(blocksInWaiting && blocksInWaiting.length > 0) {
				blocksToProcess = blocksInWaiting;
				blocksInWaiting = [];
			}			
			blocksToProcess.forEach(function(cb) {		
				cb.lazyLoad = cb.lazyLoad? (cb.lazyLoad == "true" || cb.lazyLoad == true): false;
				cb.props_details = cb.props_details? JSON.stringify(cb.props_details): {};
				cb.pageParams = cb.pageParams? JSON.stringify(cb.pageParams): {};				
				if(cb.type && cb.type.route && uniqueRoutes.indexOf(cb.type.route) == -1) {
					uniqueRoutes.push(cb.type.route);
				}
				if(cb.children) {
					blocksInWaiting = blocksInWaiting.concat(cb.children);
				}
			});				
			needsTraversal = blocksInWaiting.length > 0;
		}
		//Get route2Macroponent map to update content blocks with the respective macroponent id 
		var route2macroponentMap = getMacroponents(uniqueRoutes);
		
		needsTraversal = true;
		blocksToProcess = contentBlocks;
		blocksInWaiting = [];
		uniqueRoutes = [];

		while(needsTraversal) {
			if(blocksInWaiting && blocksInWaiting.length > 0) {
				blocksToProcess = blocksInWaiting;
				blocksInWaiting = [];
			}			
			blocksToProcess.forEach(function(cb) {									
				if(cb.type && cb.type.route) {
					cb.type.macroponent = route2macroponentMap[cb.type.route];
				}
				if(cb.children) {
					blocksInWaiting = blocksInWaiting.concat(cb.children);
				}
			});				
			needsTraversal = blocksInWaiting.length > 0;
		}
		
	}

    return contentBlocks || [];

})(env);
