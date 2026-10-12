function paSPClientController($compile, $element, $scope, $http, $timeout) {
	/* widget controller */
	var c = this;
	
	// Initial message
	c.initialMessageVisible = !Boolean(c.options.widget_id);
	c.initialMessage = c.data.i18n.initialMessage;
	
	// Title
	c.title = '';
	c.showTitle = (c.options.show_title && c.options.show_title !== 'false');
	if (c.options.widget_parameters) {
		var widgetParameters = JSON.parse(c.options.widget_parameters);
		if (typeof widgetParameters.widget_id === 'object')
			c.title = widgetParameters.widget_id.displayValue;
	}
	
	//PA messages
	if (!top.SNC.PA.msg || $.isEmptyObject(top.SNC.PA.msg)) {
		top.SNC.PA.msg = JSON.parse(c.data.i18n.paMsgs);
	}
	
	var httpOptions = {
		url: 'angular.do',
		params: {
			sysparm_type: 'pa_widget',
			type: 'getwidgetserviceportal',
			widget: c.options.widget_id
		}
	};
	$http(httpOptions, true).then(function afterResponse(result) {
		if (!result.data.type || !result.data.sys_id)
			return;
		
		c.initialMessageVisible = false;
		if (c.showTitle)
			c.titleId = result.data.sys_id;
		
		var compiledWidget;
		if (isReactWidget(result.data.type, result.data.newVisualizationEnabled)) {
			// Text Analytics Widget is in React
			c.widgetId = result.data.sys_id;
			c.uuid = result.data.uuid;
			c.reactComponent = true;
			c.lang = c.data.language;
			c.dow = c.data.dow;
			c.cutoffValue = result.data.text_cut_off_value;
			c.cutoffType = result.data.text_cut_off_type;
			c.cutoffCondition = result.data.text_cut_off_condition;
			c.defaultField = result.data.text_default_field;
			c.textLimit = result.data.text_limit;
			c.visualization = result.data.visualization;
			c.textWordsInTrendline = result.data.text_words_in_trendline;
			c.type = result.data.type;
			c.insightsEnabled = result.data.insightsEnabled;
			switch(c.type) {
				case 'text': c.widgetRoute = '/widgets/text-analytics'; break;
				case 'insight': c.widgetRoute = '/widgets/insights'; break;
				case 'time': c.widgetRoute = '/widgets/time-series'; break;
				case 'score': c.widgetRoute = '/widgets/single-score'; break;
				default: c.widgetRoute = '/widgets/text-analytics'; break;
			}
			
			$timeout(function afterAngularRender() {
				var element = angular.element('pa-react-wrapper', $element).get(0);
				window.servicePortalPaUIWidget.render(element);
			});
			$scope.$on('$destroy', function onAngularDestroy() {
				var element = angular.element('pa-react-wrapper', $element).get(0);
				window.servicePortalPaUIWidget.destroy(element);
			});
		} else {
			// Will be removed when we switch all widgets to react
			compiledWidget = $compile('<div class="pa-widget-' + result.data.type + '" widget="' + result.data.sys_id + '"></div>')($scope);
			angular.element('.pa-widget-service-portal', $element).append(compiledWidget);
		}
	});
	
	function isReactWidget(type, newVisualizationEnabled) {
		var reactWidgetTypes = ['text', 'insight'];
		if (newVisualizationEnabled) {
			reactWidgetTypes.push('time');
			reactWidgetTypes.push('score');
		}
 		return reactWidgetTypes.indexOf(type) != -1;
	}
}
