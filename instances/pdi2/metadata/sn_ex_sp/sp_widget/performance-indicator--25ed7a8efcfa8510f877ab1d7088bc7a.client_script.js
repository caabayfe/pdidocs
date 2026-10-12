api.controller = function($uibModal, $scope, $window, $location, $http, spUtil) {
	/* widget controller */
	var c = this;
	c.isLoading = true;
	c.isPerfDataCollected = false;
	c.error = false;
	var previousPage = null;
	var newPage = null;
	c.displayIndicatorsOnWidgets = false;
	c.widgets = [];
	c.wa = "";
	c.instanceUrl = $window.location.origin;
	c.currentUser = {};
	c.openModal = function() {
		c.modalInstance = $uibModal.open({
			templateUrl: 'perf-indicator-template',
			scope: $scope,
			backdrop: true,
			size: "lg"
		});

		newPage = $location.search();

		c.modalInstance.opened.then(function() {
			if (!c.isPerfDataCollected || (previousPage != newPage)) {
				c.isLoading = true;
				c.widgets = [];
				c.calculatePerf();
				c.isPerfDataCollected = true;
				previousPage = newPage;
			}
		});
	};

	c.closeModal = function() {
		c.modalInstance.close();
	};

	c.copyMetrics = function() {
		var user = c.currentUser.displayValue ||  c.data.userName;
		var page = $window.NOW.page_id || $window.NOW.start_page_id;
		var textArea = document.createElement("p");
		textArea.innerHTML = '<strong>${User:}</strong> ' + user + '<br/>';
		textArea.innerHTML += '<strong>${Time:}</strong> ' + new Date() + '<br/>';
		textArea.innerHTML += '<strong>${Page:}</strong> ' + page;

		// Avoid scrolling to bottom
		textArea.style.top = "0";
		textArea.style.left = "0";
		textArea.style.position = "fixed";

		$("#excelTable").append(textArea);

		var tab_text = '<html xmlns:x="urn:schemas-microsoft-com:office:excel">';
		tab_text = tab_text + '<head><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>';
		tab_text = tab_text + '<x:Name>${Stats Description}</x:Name>';
		tab_text = tab_text + '<x:WorksheetOptions><x:Panes></x:Panes></x:WorksheetOptions></x:ExcelWorksheet>';
		tab_text = tab_text + '</x:ExcelWorksheets></x:ExcelWorkbook></xml></head><body>';
		tab_text = tab_text + "<table border='1px'>";
		tab_text = tab_text + $("#excelTable").html();
		tab_text = tab_text + '</table></body></html>';

		data_type = 'data:application/vnd.ms-excel;';

		var blob = new Blob([tab_text], {
			type: data_type
		});
		var a = document.createElement("a");
		var url = $window.URL.createObjectURL(blob);
		a.href = url;
		a.download = 'Stats.xls';
		a.click();
		$window.URL.revokeObjectURL(url);
		$(textArea).remove();
	};

	c.calculatePerf = function(getTotalMetrics) {
		c.wa = $("div [widget='widget'][sn-atf-area!='Performance Indicator']");
		c.calc(c.wa, 0);
	};

	c.calc = function(wa, i) {
		if (i == wa.length) {
			c.widgets.sort(function(a, b) {
				return a.load_time_ms < b.load_time_ms ? 1 : -1;
			});
			var input = {};
			input.widgets = c.widgets;
			input.action = 'getData';
			c.server.get(input).then(function(response) {
				c.widgets = response.data.newWidgets;
				c.isPerfDataCollected = true;
				c.isLoading = false;
			});
			return;
		}
		var widgetEntry = {};
		$0 = wa[i];
		var scope = $($0).scope();
		var height = $($0).height();
		var width = $($0).width();
		var widget;
		try {
			widget = scope.widget;
		} catch (error) {
		}

		if(widget){
			if (widget.sys_id == '' || !widget.sys_id)
				c.calc(wa, i + 1);
			else {
				widgetEntry.isVisible = (height != 0 && width != 0);
				widgetEntry.name = widget.name;
				widgetEntry.rectangle = widget.rectangle_id || 'undefined';
				widgetEntry.sys_id = widget.sys_id;
				widgetEntry.indexInWidgetList = i;

				// if this is not a nested widget, go ahead and refresh it.
				if (!scope.$parent || !scope.$parent.widget) {
					var time_begin = performance.now();
					spUtil.refresh($scope).then(function() {
						var time_end = performance.now();
						timing = parseInt(time_end - time_begin);
						widgetEntry.load_time_ms = parseInt(time_end - time_begin) || 0;
						c.widgets.push(widgetEntry);
						c.calc(wa, i + 1);
					});
				} else {
					c.calc(wa, i + 1);
				}
			}
		}
	};

	c.getUserData = function() {
		c.error = false;
		if (!c.currentUser.value) {
			c.widgets.forEach(function(widget) {
				widget.first_load_time_ms = '';
			});
			return;	
		}
		var input = {action: 'getUserData', sysId: c.currentUser.value, widgets: c.widgets};
		c.server.get(input).then(function(response) {
			c.widgets = response.data.newWidgets;
			var allEmpty = c.widgets.every(function(widget) {
				return !widget.first_load_time_ms;
			});
			if (allEmpty) {
				c.error = true; // Set error flag to true
			} else {
				c.widgets.sort(function(a, b) {
					return b.first_load_time_ms - a.first_load_time_ms;
				});
			}
		});
	}

	c.reloadPerfData = function() {
		if ($scope.data.statsEnabled) {
			c.getUserData();
			return;
		}
		c.isLoading = true;
		c.widgets = [];
		c.isPerfDataCollected = false;
		c.calculatePerf();				
	};

	c.updatePerfStats = function() {
		c.server.get({action: 'toggleStats', value: $scope.data.statsEnabled});
	}

};
