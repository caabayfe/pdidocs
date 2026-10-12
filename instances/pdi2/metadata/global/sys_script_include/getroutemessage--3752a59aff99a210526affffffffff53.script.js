var GetRouteMessage = Class.create();
GetRouteMessage.prototype = Object.extendsObject(AbstractAjaxProcessor, {  
	getLocalizedMessage: function() {
		var route = this.getParameter('route'); // Get route_type from the parameters
		var message = gs.getMessage('You’ve allowed this page to be used across experiences. To avoid broken links when this page is used in other experiences, keep linked route information updated. <a href="nav_to.do?uri=sys_ux_dependent_route.do?sys_id=-1%26sysparm_query=route={0}" target="_blank">[{1}]</a>', [route, 'Open linked route']);
		
		return message;
	},
  type: 'GetRouteMessage'
});
