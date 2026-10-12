angular.module("sn.chg_soc.gantt", [])
	.service("ganttChart", ["$window", "SOC", function($window, SOC) {
		var ganttChart = this;
		var ganttInstance = {};

		function GanttModel(id) {
			this.id = id;
			this.gantt = $window.Gantt.getGanttInstance(id);
			this.taskLayerId = "";

			this.addTaskLayer = function(taskLayerRenderer) {
				if (typeof taskLayerRenderer !== "function")
					return;

				this.taskLayerId = this.gantt.addTaskLayer(taskLayerRenderer);
			};

			this.removeTaskLayer = function() {
				if (!this.taskLayerId)
					return;
				this.gantt.removeTaskLayer(this.taskLayerId);
				this.taskLayerId = "";
			};
		}

		ganttChart.getInstance = function(id) {
			if (ganttInstance[id])
				return ganttInstance[id];

			ganttInstance[id] = new GanttModel(id);
			return ganttInstance[id];
		};

		ganttChart.getGantt = function(id) {
			if (ganttInstance[id])
				return ganttInstance[id].gantt;

			return null;
		};

		ganttChart.updateGanttData = function(id, data) {
			var records = (data && data.data) ? records = data : { "data" : data, "links" : [] };
			records.links = (data && data.links) ? data.links : [];
			var gantt = ganttChart.getGantt(id);
			gantt.clearAll();
			ganttChart.addNowMarker(id);
			gantt.parse(records, "json");
		};

		ganttChart.updateMarkerInterval = function(id, markerId) {
			var gantt = ganttChart.getGantt(id);
			var dateToStr = gantt.date.date_to_str(gantt.config.task_date);
			var today = gantt.getMarker(markerId);
			today.start_date = new Date();
			today.title = dateToStr(today.start_date);
			gantt.updateMarker(markerId);
		};

		ganttChart.addNowMarker = function(id) {
			var gantt = ganttChart.getGantt(id);
			var dateToStr = gantt.date.date_to_str(gantt.config.task_date);
			var markerId = gantt.addMarker({
				start_date: new Date(),
				css: "today-marker",
				title: dateToStr(new Date()),
				text: " "
			});
			setInterval(ganttChart.updateMarkerInterval(id, markerId), 1000*60);
		};
	}])
	.service("ganttScale", ["ganttChart", "urlService", "userPreferences", "SOC", function(ganttChart, urlService, userPreferences, SOC) {
		var ganttScale = this;

		var getDateByRangeUnit = function(dateObject, rangeMember, rangeUnit) {
			return moment(dateObject)[rangeMember](rangeUnit).toDate();
		};

		var getScaleWidth = function() {
			var width = 0;
			var ganttScale = angular.element(".gantt_task");
			var ganttVertScroll = angular.element(".gantt_ver_scroll");
			if (ganttScale) {
				width = ganttScale.width();
				if (ganttVertScroll)
					width -= ganttVertScroll.width();
			}
			return width;
		};

		var weekTemplate = function (date) {
			// Using gantt object attached to window as date translations only work
			// when locale is defined on this gantt object and not instance of gantt.
			var dateFormatter = gantt.date.date_to_str("%j %M %Y");
			var mDate = moment(date);

			var startOfWeek = dateFormatter(mDate.startOf(SOC.ISO_WEEK).toDate());
			var endOfWeek = dateFormatter(mDate.endOf(SOC.ISO_WEEK).toDate());
			return startOfWeek + " - " + endOfWeek;
		};

		ganttScale.startDate = new Date();
		ganttScale.endDate = new Date();
		// 10 levels in total, indexed from 0.
		ganttScale.level = 6;
		ganttScale.scales = [
			{// 1 year
				date_scale: "%Y",
				scale_unit: "year",
				step: 1,
				columns: 12,
				min_column_width: 70,
				subscales: [{ unit: "month", step: 1, date: "%F"}],
				range_unit: "year",
				template: null
			},
			{// 6 months
				date_scale: "%Y",
				scale_unit: "month",
				step: 6,
				columns: 6,
				min_column_width: 60,
				subscales: [{ unit: "month", step: 1, date: "%F"}],
				range_unit: "year",
				template: null
			},
			{// 3 months
				date_scale: "%Y",
				scale_unit: "month",
				step: 3,
				columns: 3,
				min_column_width: 60,
				subscales: [{ unit: "month", step: 1, date: "%F"}],
				range_unit: "year",
				template: null
			},
			{// 1 month
				date_scale: "%F %Y",
				scale_unit: "month",
				step: 1,
				columns: 30,
				min_column_width: 24,
				subscales: [{ unit: "day", step: 1, date: "%j" }],
				range_unit: "month",
				template: null
			},
			{// 2 weeks
				scale_unit: "day",
				step: 7,
				columns: 14,
				min_column_width: 60,
				subscales: [{ unit:"day", step:1, date: "%D, %j" }],
				range_unit: SOC.ISO_WEEK,
				template: weekTemplate
			},
			{// 1 week
				date_scale: "%j %M %Y",
				scale_unit: "day",
				step: 1,
				columns: 14,
				min_column_width: 50,
				subscales: [{ unit: "hour", step:12, date: "%H:%i" }],
				range_unit: "day",
				template: null
			},
			{// 5 days - Default
				date_scale: "%j %M %Y",
				scale_unit: "day",
				step: 1,
				columns: 15,
				min_column_width: 50,
				subscales: [{ unit: "hour", step:8, date: "%H:%i" }],
				range_unit: "day",
				template: null
			},
			{// 24 hours
				date_scale: "%j %M %Y",
				scale_unit: "hour",
				step: 12,
				columns: 24,
				min_column_width: 50,
				subscales: [{ unit: "hour", step:1, date: "%H:%i" }],
				range_unit: "day",
				template: null
			},
			{// 16 hours
				date_scale: "%j %M %Y",
				scale_unit: "hour",
				step: 8,
				columns: 16,
				min_column_width: 50,
				subscales: [{ unit: "hour", step:1, date: "%H:%i" }],
				range_unit: "day",
				template: null
			},
			{// 8 hours
				date_scale: "%j %M %Y",
				scale_unit: "hour",
				// As this has a sub-scale, this step will be used to group the sub-scale
				// Each "8" hour block will hold 8 cells of 1 hour each
				step: 8,
				columns: 8,
				min_column_width: 50,
				// Sub-scale specifies that each sub-cell should represent 1 hour
				subscales: [{ unit: "hour", step:1, date: "%H:%i" }],
				range_unit: "day",
				template: null
			}
		];
		ganttScale.scaleMax = ganttScale.scales.length - 1;

		ganttScale.setDateRange = function(tasks) {
			var gantt = ganttChart.getGantt(urlService.socId);
			angular.forEach(tasks, function(task) {
				var startDate = gantt.date.parseDate(task.start_date, SOC.DATE_FORMAT);
				var endDate = gantt.date.parseDate(task.end_date, SOC.DATE_FORMAT);
				if (startDate && ganttScale.startDate.getTime() > startDate.getTime())
					ganttScale.startDate = startDate;
				if (endDate && ganttScale.endDate.getTime() < endDate.getTime())
					ganttScale.endDate = endDate;
			});
		};

		ganttScale.configureScale = function(level) {
			var gantt = ganttChart.getGantt(urlService.socId);
			if (typeof level === "number" && !isNaN(level))
				ganttScale.level = level;
			ganttScale.level = ganttScale.level < 0 ? 0 : ganttScale.level;
			ganttScale.level = ganttScale.level > ganttScale.scales.length - 1 ? ganttScale.scales.length - 1 : ganttScale.level;
			gantt.config.date_scale = ganttScale.scales[ganttScale.level].date_scale;
			gantt.config.scale_unit = ganttScale.scales[ganttScale.level].scale_unit;
			gantt.config.step = ganttScale.scales[ganttScale.level].step;
			gantt.config.subscales = ganttScale.scales[ganttScale.level].subscales;
			gantt.config.start_date = getDateByRangeUnit(ganttScale.startDate, "startOf", ganttScale.scales[ganttScale.level].range_unit);
			gantt.config.end_date = getDateByRangeUnit(ganttScale.endDate, "endOf", ganttScale.scales[ganttScale.level].range_unit);
			var minWidth = getScaleWidth() / ganttScale.scales[ganttScale.level].columns;
			gantt.config.min_column_width = minWidth > ganttScale.scales[ganttScale.level].min_column_width ? minWidth : ganttScale.scales[ganttScale.level].min_column_width;
			gantt.templates.date_scale = ganttScale.scales[ganttScale.level].template;
		};

		ganttScale.zoom = function(level, definitionId) {
			ganttScale.configureScale(level);
			userPreferences.setPreference(SOC.ZOOM_LEVEL_PREF, ganttScale.level);
			var gantt = ganttChart.getGantt(urlService.socId);
			gantt.render();
		};

		ganttScale.getLevel = function() {
			return ganttScale.level;
		};

		ganttScale.setLevel = function(level) {
			ganttScale.level = level;
		};

		(function(definitionId) {
			userPreferences.getPreference(SOC.ZOOM_LEVEL_PREF).then(
				function(scaleLevel) {
					var userLevel = parseInt(scaleLevel, 10);
					if (typeof userLevel !== "number" || isNaN(userLevel))
						return;
					ganttScale.zoom(userLevel, definitionId);
				});
		})(urlService.socId);
	}])
	.directive("ganttFullSize", ["ganttScale", "$window", function(ganttScale, $window) {
		return {
			restrict: 'A',
			link: function($scope, $element, $attrs) {
				var parentSibling = $attrs.ganttFullSize;
				var directiveId = '.ganttFullSize' + $scope.$id;
				function adjust(configure) {
					if (!configure)
						ganttScale.configureScale();
					angular.element($element).css({
						position: 'absolute',
						bottom: 0,
						width: '100%',
						top: (angular.element(parentSibling).offset().top + angular.element(parentSibling).outerHeight()) + 'px'
					});
				}
				adjust(true);
				angular.element($window).on('resize' + directiveId, function () {
					adjust();
				});
				$scope.$on('$destroy', function () {
					angular.element($window).off(directiveId);
				});
			}
		};
	}]);
