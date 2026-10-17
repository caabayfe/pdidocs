(function($, moment) {
	'use strict';
	/* Usage:
	 * Date Time Picker:
	 *
	 * <span class='input-group' sn-cab-date-time-picker='' display-type='dateTime' date-value="dateValueInScope" date-time-format="DD-MMM-YY hh:mm:ss a">
			<input type='text' class="form-control"></input>
			<span class="input-group-btn">
				<a role="button" class="btn btn-default btn-ref">
					<span aria-hidden="true" class="icon-calendar icon"></span>
					<span class="sr-only">${gs.getMessage('Select date and time')}</span>
				</a>
			</span>
		</span>
	 *
	 *
	 */
	angular.module("sn.itsm.vcab.common")
	.constant("MiniCalendarViewMode", {
		"DAY": "datepicker-days",
		"MONTH": "datepicker-months",
		"YEAR": "datepicker-years",
		"HOURS": "timepicker-hours",
		"MINUTES": "timepicker-minutes"
	})
	.directive('snCabDateTimePicker', function($timeout, $document, $rootScope, $window, isMobile, Keys, MiniCalendarViewMode) {
			return {
				restrict: "A",
				scope: {
					displayType: '@', //dateTime or date
					dateFormat: '@',
					dateTimeFormat: '@',
					dateValue: '=' // Should be a Date object
				},
				link: function($scope, iEl, iAttrs) {
					var lang = $("html").attr("lang");
					moment.locale(lang);
					var dateField = $('input', iEl);
					var dateTimePicker;
					var dateTimePickerObj;
					if (!$.fn.datetimepicker)
						throw 'snCabDateTimePicker: datetimepicker plugin is required but not available.';
					if (!moment)
						throw 'snCabDateTimePicker: moment js is required but not available.';
					var currentFormat;
					var config;
					function getDateStr() {
						if ($scope.dateValue)
							return moment.tz($scope.dateValue, currentFormat, $window.g_tz);
						return '';
					}

					if ($scope.displayType === 'dateTime') {
						if (!$scope.dateTimeFormat)
							throw 'dateTimeFormat not provided';
						currentFormat = $scope.dateTimeFormat;
						config = {
							language: lang,
							sideBySide: !isMobile(),
							icons: {
								date: "icon-calendar icon",
								up: "icon-vcr-up icon",
								down: "icon-vcr-down icon"
							},
							defaultDate: getDateStr(),
							format: $scope.dateTimeFormat,
							direction: 'up',
							use24hours: $scope.dateTimeFormat.indexOf('a') < 0 && $scope.dateTimeFormat.indexOf('h') < 0
						};
						dateTimePicker = iEl.datetimepicker(config);
						dateTimePicker.on("dp.hide", function(event) {
							var dateTimePickerButton = $(event.currentTarget).find("button");
							if (dateTimePickerButton.attr("aria-expanded") === "false")
								return;
							dateTimePickerButton.attr("aria-expanded", false);
							removeTimePickerChangeViewHandler();
							$timeout(function() {
								dateTimePickerButton.focus();
							});
						});
						dateTimePickerObj = iEl.data('DateTimePicker');
					}

					if ($scope.displayType === 'date') {
						if (!$scope.dateFormat)
							throw 'dateFormat not provided';
						currentFormat = $scope.dateFormat;
						config = {
							icons: {
								date: "icon-calendar icon"
							},
							defaultDate: getDateStr(),
							format: $scope.dateFormat //needs to be a date format not having time
						};
						dateTimePicker = iEl.datetimepicker(config);
						dateTimePickerObj = iEl.data('DateTimePicker');
					}

					function setValue() {
						var v = dateField.val();
						if (v)
							$scope.dateValue = moment.tz(v, currentFormat, $window.g_tz);
						else
							$scope.dateValue = null;
					}
					if (dateField) {
						dateField.on('change.cdp paste.cdp keyup.cdp', function() {
							$timeout(setValue);
						});
					}

					var isDateTimePickerOpen = false;
					function hideDatePicker() {
						if (isDateTimePickerOpen && dateTimePickerObj)
							dateTimePickerObj.hide();
					}
					$rootScope.$on('dp.show', function($event, msgId) {
						if (msgId === 'dp_show_' + $scope.$id)
							return;
						hideDatePicker();
					});
					function addTimePickerChangeViewHandler() {
						$(".picker-open .timepicker-hour").on("click", handleTimePickerChangeView.bind(this, "hour"));
						$(".picker-open .timepicker-minute").on("click", handleTimePickerChangeView.bind(this, "minute"));
						$(".picker-open .timepicker-hour").on("click", handleTimePickerChangeView.bind(this, "hour"));
						$(".picker-open .timepicker-hours").on("click", handleTimePickerChangeView.bind(this, "hours"));
						$(".picker-open .timepicker-minutes").on("click", handleTimePickerChangeView.bind(this, "minutes"));
					}
					function removeTimePickerChangeViewHandler() {
						$(".timepicker-hour").off("click");
						$(".timepicker-minute").off("click");
						$(".timepicker-hours").off("click");
						$(".timepicker-minutes").off("click");
					}
					function handleTimePickerChangeView(view, event) {
						$timeout(function() {
							if (view === "hour" || view === "minute")
								$(".picker-open .timepicker-hours:visible,.picker-open .timepicker-minutes:visible").find("td:first").focus();
							else if (view === "hours")
								$(".picker-open .timepicker-hour").focus();
							else if (view === "minutes")
								$(".picker-open .timepicker-minute").focus();
						});
					}
					function isKeySupported(evtKey) {
						switch (evtKey) {
							case Keys.ESCAPE:
							case Keys.ENTER:
							case Keys.SPACE:
							case Keys.TABKEY:
							case Keys.LEFT_ARROW:
							case Keys.UP_ARROW:
							case Keys.RIGHT_ARROW:
							case Keys.DOWN_ARROW:
								return true;
						}
						return false;
					}
					function handleDateTimePicker(evt) {
						// Only supported keys
						if (!isKeySupported(evt.which))
							return;
						if ($(".datepicker td.day[tabindex]").length === 0) { // Bootstrap removes tabindex attr when re-renders, so adding them back
							$dateTimePicker.find("th,td.day,span.month,span.year").not("td[tabindex],th.dow").attr("tabindex", 0); // Add tabindex to date picker elements
							$dateTimePicker.find("td.hour,td.minute,span.timepicker-hour,span.timepicker-minute").not("td[tabindex]").attr("tabindex", 0); // Add tabindex to time picker elements
						}
						var index;
						var next;
						var focused = $(document.activeElement);
						var list = $(".bootstrap-datetimepicker-widget:visible").find(".prev:visible, .next:visible, [tabindex='0']:visible, td[class]:visible").not(".separator,span.icon,.datepicker-years .picker-switch");
						if (typeof index === "undefined")
							index = list.index(focused);
						evt.preventDefault();
						evt.stopPropagation();
						switch (evt.which) {
							case Keys.TABKEY:
							case Keys.LEFT_ARROW:
							case Keys.RIGHT_ARROW:
								if ((evt.which === Keys.TABKEY && !evt.shiftKey) || evt.which === Keys.RIGHT_ARROW)
									index = (index === list.length - 1) ? 0 : index + 1;
								else if ((evt.which === Keys.TABKEY && evt.shiftKey) || evt.which === Keys.LEFT_ARROW)
									index = (index === 0) ? list.length - 1 : index - 1;
								next = list.get(index);
								break;
							case Keys.UP_ARROW:
								if (focused.hasClass("timepicker-minute")) {
									$("a.btn[data-action=incrementMinutes]").click();
									return;
								}
								else if (focused.hasClass("timepicker-hour")) {
									$("a.btn[data-action=incrementHours]").click();
									return;
								}
								if (focused.hasClass("hour") || focused.hasClass("minute")) {
									var noOfcols = 4;
									var minicalView = $(".timepicker > div:visible");
									focused = $(document.activeElement);
									list = minicalView.find(".hour:visible,.minute:visible");
									index = list.index(focused);
									index = (index < 4) ? list.length - (noOfcols - index) : index - noOfcols;
									next = list.get(index);
									break;
								}

								if (focused.is("th")) {
									next = list.get(list.length - 3); // stay in datepicker
									break;
								}
								var minicalView = $(".datepicker > div:visible");
								var noOfcols = (minicalView.attr("class") === MiniCalendarViewMode.DAY) ? 7 : 4;
								var noOfHeaderElements = (minicalView.attr("class") !== MiniCalendarViewMode.YEAR) ? 3 : 2;
								if (index === noOfHeaderElements)
									index = 0;
								else if (index > noOfHeaderElements && index < noOfHeaderElements + noOfcols - 1)
									index = 1;
								else
									index -= noOfcols;
								next = list.get(index);
								break;
							case Keys.DOWN_ARROW:
								if (focused.hasClass("timepicker-minute")) {
									$("a.btn[data-action=decrementMinutes]").click();
									return;
								}
								else if (focused.hasClass("timepicker-hour")) {
									$("a.btn[data-action=decrementHours]").click();
									return;
								}
								if (focused.hasClass("hour") || focused.hasClass("minute")) {
									var noOfcols = 4;
									var minicalView = $(".timepicker > div:visible");
									focused = $(document.activeElement);
									list = minicalView.find(".hour:visible,.minute:visible");
									index = list.index(focused);
									index = (index >= list.length - 4) ? index % 4 : index + 4;
									next = list.get(index);
									break;
								}

								var minicalView = $(".datepicker > div:visible");
								if (focused.is("th")) {
									var noOfHeaderElements = (minicalView.attr("class") !== MiniCalendarViewMode.YEAR) ? 3 : 2;
									next = list.get(noOfHeaderElements);
									break;
								}
								switch (minicalView.attr("class")) {
									case MiniCalendarViewMode.DAY:
										index = (index + 7 > list.length - 3) ? 0 : $(list[index + 7]).is(".datepicker th") || $(list[index + 7]).is(".datepicker td") ? index + 7 : 0;
										break;
									case MiniCalendarViewMode.MONTH:
									case MiniCalendarViewMode.YEAR:
										index = (index + 3 > list.length - 3) ? 0 : $(list[index + 3]).is(".datepicker th") || $(list[index + 3]).is(".datepicker span") ? index + 3 : 0;
										break;
								}
								next = list.get(index);
								break;
							case Keys.SPACE:
							case Keys.ENTER:
								var previousView = $(".datepicker > div:visible").attr("class");
								focused.click();
								if ($(".datepicker td.day[tabindex]").length === 0) { // Bootstrap removes tabindex attr when re-renders, so adding them back
									$dateTimePicker.find("th,td.day,span.month,span.year").not("td[tabindex],th.dow").attr("tabindex", 0); // Add tabindex to date picker elements
									$dateTimePicker.find("td.hour,td.minute,span.timepicker-hour,span.timepicker-minute").not("td[tabindex]").attr("tabindex", 0); // Add tabindex to time picker elements
								}
								var currentView = $(".datepicker > div:visible").attr("class");
								var minicalView = $(".datepicker > div:visible");
								if (previousView !== currentView) {
									if (currentView === MiniCalendarViewMode.YEAR || (currentView === MiniCalendarViewMode.MONTH && previousView === MiniCalendarViewMode.YEAR))
										next = $("span.active:visible");
									else if (currentView === MiniCalendarViewMode.DAY && previousView === MiniCalendarViewMode.MONTH)
										next = $("td.active:visible");
									else
										switch (currentView) {
											case MiniCalendarViewMode.DAY:
											case MiniCalendarViewMode.MONTH:
												next = $(".picker-switch:visible");
												break;
											case MiniCalendarViewMode.YEAR:
												next = $("span.active:visible");
												break;
										}
								}
								else {
									// Make it easier for keyboard navigation and once the date is selected, move to the timepicker
									next = $(".bootstrap-datetimepicker-widget:visible").find(".timepicker-picker:visible span.timepicker-hour, .timepicker-hours:visible td:first, .timepicker-minutes:visible td:first");
									next.focus();
									return;
								}
								break;
							case Keys.ESCAPE:
								hideDatePicker();
								return;
							}
						if (next)
							next.focus();
					}

					function onKeyDown($event) {
						if ($($event.target).parents(".bootstrap-datetimepicker-widget").length === 1) {
							handleDateTimePicker($event);
							return;
						}
						if ($event.which !== Keys.ESCAPE)
							return;
						hideDatePicker();
						$event.stopPropagation();
						$event.preventDefault();
					}

					function onClickOverDatePicker($event) {
						$event.stopPropagation();
						$event.stopImmediatePropagation();
					}

					if (dateTimePicker) {
						dateTimePicker.on('dp.change', function() {
							$timeout(setValue);
						});
						var $dateTimePicker;
						dateTimePicker.on("dp.hide", function() {
							if ($dateTimePicker)
								$dateTimePicker.off("click", onClickOverDatePicker);
							if ($("body > div.bootstrap-datetimepicker-widget.picker-open").length === 0)
								$scope.$emit("dp.hide");
							isDateTimePickerOpen = false;
						});

						dateTimePicker.on("dp.show", function(event){
							$dateTimePicker = $("body > div.bootstrap-datetimepicker-widget.picker-open");
							if ($dateTimePicker.length === 0) {
								$scope.$emit("dp.hide");
								isDateTimePickerOpen = false;
								return;
							}
							$dateTimePicker.off("keydown");
							$dateTimePicker.on("keydown", handleDateTimePicker);
							$(event.currentTarget).find("button").attr("aria-expanded", "true");
							$scope.$emit("dp.show", ["dp_show_" + $scope.$id]);
							isDateTimePickerOpen = true;
							$dateTimePicker.off('click', onClickOverDatePicker);
							$dateTimePicker.on("click", onClickOverDatePicker);
							$timeout(function() {
								$dateTimePicker.find("th,td.day,span.month,span.year").not("td[tabindex],th.dow").attr("tabindex", 0); // Add tabindex to date picker elements
								$dateTimePicker.find("td.hour,td.minute,span.timepicker-hour,span.timepicker-minute").not("td[tabindex]").attr("tabindex", 0); // Add tabindex to time picker elements
								removeTimePickerChangeViewHandler();
								addTimePickerChangeViewHandler();
								$(".datepicker .prev:visible").focus();
							});
						});
					}

					$scope.$on('$destroy', function () {
						if ($dateTimePicker) {
							$dateTimePicker.off('click', onClickOverDatePicker);
							removeTimePickerChangeViewHandler();
						}
						if (dateField) {
							dateField.off('.cdp');
							dateField = null;
						}
						if (dateTimePickerObj)
							dateTimePickerObj.destroy();
					});
				}
			};
		});
}(jQuery, moment));
