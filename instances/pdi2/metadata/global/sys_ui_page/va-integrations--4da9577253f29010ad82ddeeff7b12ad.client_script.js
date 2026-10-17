var myApps = angular.module('sn_vaIntergrationApp', []);
myApps.controller('mainCtrl', function($scope){
	$scope.getStoreApps = function(){
		var apps = [];
		var gr = new GlideRecord('sys_cs_channel');
		gr.addQuery('store_app_page_link', '!=', null);
		gr.query();
		while (gr.next()) {
			var providerGr = new GlideRecord('sys_cs_provider');
			providerGr.addQuery('channel', gr.sys_id);
			providerGr.setLimit(1);
			providerGr.query();
			var buttonLabel = 'Get app from Store';
			if (providerGr.next()) {
				buttonLabel = 'Installed';
			}
			var application = {
				icon: gr.getValue('icon'),
				name:  gr.getValue('name'),
				link: gr.getValue('store_app_page_link'),
				button: buttonLabel,
			};

			apps.push(application);
		}

		$scope.storeApps = apps;
	};

	$scope.disableIfInstalled = function(button) {
		return button === 'Installed';
    };
});
