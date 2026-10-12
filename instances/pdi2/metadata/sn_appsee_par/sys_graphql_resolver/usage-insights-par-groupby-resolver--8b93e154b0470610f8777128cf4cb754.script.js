(function process(/*ResolverEnvironment*/ env) {
	// Need at least one of these roles to get options
	// if (!gs.hasRole('analytics_admin,analytics_viewer')) {
	// 	return [];
	// }
        const DOT_REPLACE_STRING = '__UXADOT__';
        
        const processor = new sn_uxa_commons.UXAPageFilterProcessor();
        const userProperties = processor.getUserPropertyFilters(null, true);
    
	const type = env.getArguments()['type'];
	const channel = env.getArguments()['channel'];
    
        const mappedUserProps = userProperties.map(prop => ({
            id: prop?.filter_id.replaceAll('.', DOT_REPLACE_STRING),
            label: prop?.label
        }));
    
	const baseOptions = [
		{
			id: "country",
			label: gs.getMessage("Country")
		},
		{
			id: "state",
			label: gs.getMessage("State")
		},
		{
			id: "operating_system",
			label: gs.getMessage("Operating system")
		},
		{
			id: "device_type",
			label: gs.getMessage("Device type")
		},
		{
			id: "device_resolution",
			label: gs.getMessage("Device Resolution")
		},
		...mappedUserProps
	];

	const mobileOptions = [
		{
			id: "device",
			label: gs.getMessage("Device")
		},
		{
			id: "platform",
			label: gs.getMessage("Platform")
		},
		{
			id: "app_version",
			label: gs.getMessage("App Version")
		},
		{
			id: "connectivity",
			label: gs.getMessage("Connectivity")
		}
	];

	const webOptions = [
		{
			id: "browser",
			label: gs.getMessage("Browser")
		}
	];
	
	const sessionsOptions = [
	    {
			id: "session_duration",
			label: gs.getMessage("Session Duration")
		},
		{
			id: "hourly_usage",
			label: gs.getMessage("Hourly Usage")
		}
	];
	
	let mergedResult = [];
	
	switch(channel) {
		case 'mobile':
			mergedResult = [
				...baseOptions,
				...mobileOptions
			];
		case 'web':
			mergedResult = [
				...baseOptions,
				...mobileOptions
			];
		default:
			mergedResult = baseOptions;
	}
	
	return [
	    ...mergedResult,
	    ...(type === 'sessions' ? sessionsOptions : [])
	];

})(env);
