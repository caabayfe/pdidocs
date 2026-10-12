(function executeRule(current, previous /*null when async*/) {
	
	function getMappedIdForSpPage(id, portalId) {
	  var tableName = 'sp_page_route_map';
	  var gr = new GlideRecord(tableName);
	  gr.addQuery('route_from_page', '=', id);
	  gr.addQuery('portals', 'CONTAINS', portalId);
	  gr.query();
	  gr.next();
	  if (gr.isValidRecord()) {
		 return gr.route_to_page.toString();
	  }
	  else return null;
	}
	
	var tourType = current.type.toString();

	if(tourType === ''){
		current.type='platform';
	}else if (tourType === 'service_portal'){
		var sp_portal_url = current.sp_portal.url_suffix;
		var sp_page_id = current.sp_page.id.toString();
		
		var tourConfig = current.options.toString();
		if (tourConfig) {
			tourConfig = JSON.parse(tourConfig);
		} else tourConfig = null;
		
		var gtd_portal_title = current.sp_portal.title;
		var gtd_page_title = current.sp_page.title;
		var additional_params = current.additional_parameters;
		
		if(additional_params.toString()!==''){
			if(additional_params.indexOf("?")!= undefined && additional_params.indexOf("?")!=-1){
				gs.addErrorMessage(gs.getMessage("Invalid character '?' in Additional URL Parameters field"));
				current.setAbortAction(true);
			}
			if(additional_params.indexOf("&")!= undefined && additional_params.indexOf("&")==0){
				gs.addErrorMessage(gs.getMessage("Additional URL Parameters value cannot begin with '&'"));
				current.setAbortAction(true);
			}
			
			additional_params = '&' + additional_params;
			
		}
		
		current.context = sp_portal_url + '?id=' + 
			((tourConfig && tourConfig.isMapped) ? tourConfig.actualContext: sp_page_id) +
			'&gtd_portal_title=' + gtd_portal_title + '&gtd_page_title=' + gtd_page_title +
			additional_params;
		if (tourConfig === null || tourConfig.isMapped !== true ) {
		   var mappedpage = getMappedIdForSpPage(current.sp_page.sys_id, current.sp_portal.sys_id);
		   current.sp_page =  mappedpage || current.sp_page.sys_id;
		   if (mappedpage) {
			   tourConfig = tourConfig || {};
			   tourConfig.isMapped = true;
			   tourConfig.actualContext = sp_page_id;
			   current.options = JSON.stringify(tourConfig);
		   }
		}
		 
	}

})(current, previous);
