(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var appManagerApiUtil = new AppManagerApiUtil(request, response);
    try {
        var args = appManagerApiUtil.getRequestParams();
        var requestBody = appManagerApiUtil.getRequestBody();
        if (!requestBody)
            return;
        var dependencies = requestBody.dependencies;
        var scope = args.queryParams['scope'];
        var jumboConfig = requestBody.jumbo_config;
        var firstLevelOnly = args.queryParams['first_level_only'] ? args.queryParams['first_level_only'] == 'true' : true;
        var dependencyInfo;
        if (!jumboConfig)
            dependencyInfo = new DependencyProcessor(scope, false, firstLevelOnly).processDependency(dependencies.split(","));
        else {
            var listingDependencies = dependencies ? dependencies : "";
            var primarDependencyString = jumboConfig[0].hard_dependencies ? jumboConfig[0].hard_dependencies : "",
                softDependencyString = jumboConfig[0].soft_dependencies ? jumboConfig[0].soft_dependencies : "",
                optionalDependencyString = jumboConfig[0].optional_dependencies ? jumboConfig[0].optional_dependencies : "",
                conditionalDependenciesString = jumboConfig[0].conditional_dependencies ? jumboConfig[0].conditional_dependencies : "",
                primaryDepdendencies = [],
				softDependencies = [],
                optionalDepdendencies = [],
                conditionalDependencies = [],
                finalDependencies = [];
			var listingDependencyProcessor = new DependencyProcessor(scope, false, false);
			var firstLevelDependencyProcessor = new DependencyProcessor(scope, false, true);
			firstLevelDependencyProcessor.setEnforceInstalledAppNullVersionCheck(true);
			listingDependencyProcessor.setAppV2SourceAppId(jumboConfig[0].source_app_id);
			if (primarDependencyString) {
                primaryDepdendencies =  firstLevelDependencyProcessor.processDependency(primarDependencyString.split(","));
                for (var i = 0; i < primaryDepdendencies.length; i++)
                    primaryDepdendencies[i].dependency_type = "hard";
            }
            if (softDependencyString)  {
				listingDependencyProcessor.addToSoftDependency(softDependencyString);
			}
			if (optionalDependencyString) {
                optionalDepdendencies =  firstLevelDependencyProcessor.processDependency(optionalDependencyString.split(","));
                for (var i = 0; i < optionalDepdendencies.length; i++)
                    optionalDepdendencies[i].dependency_type = "optional";
            }
			if (conditionalDependenciesString)
				listingDependencyProcessor.addToConditionalDependencies(conditionalDependencies);
            listingDependencies = listingDependencies ? listingDependencies.concat("," + primarDependencyString) : primarDependencyString;
            var selectedOptionals = jumboConfig[0].selected_options;
            if (selectedOptionals.length > 0)
                listingDependencies = listingDependencies.concat("," + selectedOptionals.toString());

            if (listingDependencies) {
                finalDependencies = listingDependencyProcessor.processDependency(listingDependencies.split(","));
                for (var i = 0; i < finalDependencies.length; i++)
                    finalDependencies[i].dependency_type = "listing_dependencies";
            }
            dependencyInfo = primaryDepdendencies.concat(softDependencies).concat(optionalDepdendencies).concat(finalDependencies).concat(conditionalDependencies);
        }
        appManagerApiUtil.setResponseBody(dependencyInfo);
    } catch (err) {
        appManagerApiUtil.setError(err);
    }
})(request, response);
