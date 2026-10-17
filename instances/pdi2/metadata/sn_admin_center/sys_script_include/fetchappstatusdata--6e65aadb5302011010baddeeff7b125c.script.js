var FetchAppStatusData = Class.create();

FetchAppStatusData.prototype = {
    initialize: function() {
		this._appsDataApi = new sn_appclient.AppsDataAPI();
	},
	
	fetchData: function(appIds) {
		var apps = {};
		var appsObj = {};
		if (!this._appsDataApi) {
			gs.error('Unable to instantiate sn_appclient.AppsDataAPI');
			
			return null;
		}
		
		apps = this._appsDataApi.getEntitledApps(appIds);
		for (var i = 0; i < apps.length; i++) {
			if (apps[i].isApplication)
				appsObj[apps[i].sys_id] = apps[i];
			else
				appsObj[apps[i].plugin_id] = apps[i];
		}

		return appsObj;
	},

	getAppDependencies: function(appStatus) {
		var dependencies = [];
		if (appStatus.dependencies) {
			if (Array.isArray(appStatus.dependencies)) {
				var formattedDependencies = [];
				for (var arrayIndex = 0; arrayIndex < appStatus.dependencies.length; arrayIndex++) {
					var arrayElement = appStatus.dependencies[arrayIndex];
					if (typeof arrayElement === 'string') {
						var splittedElements = arrayElement.split(',');
						formattedDependencies.push.apply(formattedDependencies, splittedElements);
					}
				}
				appStatus.dependencies = formattedDependencies;
			}
			var dependencyStatusData = this._appsDataApi.getAppDependencyStatus('', appStatus.dependencies);
			for (var j = 0; j < dependencyStatusData.length; j++)
				dependencies.push(this.generateDependency(dependencyStatusData[j].orig_string, dependencyStatusData[j].Id, dependencyStatusData[j].status));
		}

		return dependencies;
	},
	
	generateDependency: function(id, name, status) {
		return {dependency_id: id, dependency_name: name, dependency_status: status};
	},

    type: 'FetchAppStatusData'
};
