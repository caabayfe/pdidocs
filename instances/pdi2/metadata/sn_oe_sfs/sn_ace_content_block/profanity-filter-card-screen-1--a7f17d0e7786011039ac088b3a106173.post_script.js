(function(context){ 
	
	context.props_details.image = '/images/ci_landingexp_profanityfilter.png';
	if(GlidePluginManager.isActive('com.sn.va.profanity')) {
		//State: Profanity Filter has been installed
		context.subtitle = gs.getMessage('Tune the Profanity Filter');
		context.props_details.description = gs.getMessage('Continue to keep conversations professional by preventing both users and agents from using prohibited words and phrases.');
	}
	else {
		//State: Install Profanity Filter
		context.subtitle = gs.getMessage('Get Profanity Filter');
		context.props_details.description = gs.getMessage('Keep conversations professional by preventing both users and agents from using prohibited words and phrases.');
		context.__is_complete = false;
	}
	
	
})(context);
