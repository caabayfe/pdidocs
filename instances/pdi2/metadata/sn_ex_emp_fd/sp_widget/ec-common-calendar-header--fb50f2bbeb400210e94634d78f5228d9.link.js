function(scope) {
	var $rootScope = $injector.get('$rootScope');
	var $sce = $injector.get("$sce");
	var $sanitize = $injector.get("$sanitize");
	
	if (scope.data.schedulerConfig && scope.data.schedulerConfig.mode)
		scope.viewScale = scope.data.schedulerConfig.mode;

	scope.switchDayWeekView = function (scale) {
		if (scope.viewScale != scale) {
			scope.viewScale = scale;
			$rootScope.$broadcast('changeMode', scale);
		}
	};

	scope.$on('modeChange', function (event, scale) {
		scope.viewScale = scale;
		scope.renderTooltip();
	});

	scope.$on('dateChange', function (event, date) {
		scope.selectedDate = new moment([date.getFullYear(), date.getMonth(), date.getDate()]).format(scope.userDateFormat);
	});
	
	scope.$on('headerContentChange', function (event, changedHeaderContent) {
		/* $sanitize(string) is converting special characters of few languages to hex codes.
				hence we are encoding the decoded special characters again using DOMParser */
		var sanitizedDecodedString = new DOMParser().parseFromString($sanitize(changedHeaderContent), "text/html").body.textContent
		scope.headerContent = $sce.trustAsHtml(sanitizedDecodedString).toString();
	});

}
