(function(context, pageParams) {
    /*   context = {    'block_id': @sysId,    'name': @String,    'title': @String,    'subtitle': @String,    'order': @Number,    'type': @Object,    'children': @Array[context],    'props_details': @Object   };  */
	context.props_details.headingStyles = {
		style: "header-tertiary",
		level: '1'
	};
	context.props_details.links = [{
		label: gs.getMessage("Virtual Agent & NLU"),
		link: "https://community.servicenow.com/community?id=community_forum&sys_id=bf5abf94db54e3c42be0a851ca961915"
	}, {
		label: gs.getMessage("Agent Chat, Routing, and Sidebar"),
		link: "https://www.servicenow.com/community/agent-chat-routing-and-sidebar/ct-p/agent-chat-routing-sidebar"
	}, {
		label: gs.getMessage("ITSM Pro Virtual Agent"),
		link: "https://community.servicenow.com/community?id=community_forum&sys_id=c01474dadbd32c10679499ead39619c4"
	}];

})(context, pageParams);
