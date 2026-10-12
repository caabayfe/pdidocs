angular.module("sn.change_request.next_available_time", ["ui.bootstrap"])
	.constant("NEXT_AVAILABLE_TIME", {
		"URL": "/api/now/change_request_calendar/change/nextavailabletime/",
		"SYSPARM_CK": "?sysparm_ck=",
		"KEYS": {
			"TABKEY": 9,
			"ENTER": 13,
			"ESCAPE": 27,
			"SPACE": 32,
			"LEFT": 37,
			"UP": 38,
			"RIGHT": 39,
			"DOWN": 40
		},
		"VIEW_MODE": {
			"DAY": 0,
			"MONTH": 1,
			"YEAR": 2
		},
		"FORM": {
			"MODAL": "chg_next_available_time"
		}
	})
	.config(function($locationProvider) {
		$locationProvider.html5Mode({
			enabled: true,
			requireBase: false
		});
	})
	.service("snCalendarNextAvailableTimeService", function(i18n, $http, $q, $rootScope, NEXT_AVAILABLE_TIME, $window) {
		var snCalendarNextAvailableTimeService = this;

		snCalendarNextAvailableTimeService.getSlots = function(chgId, range) {
			chgId = sanitizeSysId(chgId);
			if (!chgId)
				return null;

			var deferred = $q.defer();
			var url = NEXT_AVAILABLE_TIME.URL + chgId + NEXT_AVAILABLE_TIME.SYSPARM_CK + $window.g_ck;
			$http.post(url, range).then(function(response) {
				deferred.resolve(response.data.result);
			}, function(response) {
				deferred.reject(response);
			});
			return deferred.promise;
		};
		snCalendarNextAvailableTimeService.submit = function(chgId, data) {
			chgId = sanitizeSysId(chgId);
			if (!chgId)
				return null;

			var deferred = $q.defer();
			var url = NEXT_AVAILABLE_TIME.URL + chgId + NEXT_AVAILABLE_TIME.SYSPARM_CK + $window.g_ck;
			$http.put(url, data).then(function(response) {
				deferred.resolve(response.data.result);
			}, function(response) {
				deferred.reject(response);
			});
			return deferred.promise;
		};
		snCalendarNextAvailableTimeService.abort = function(promise) {
			$q.resolve(promise);
		};
		snCalendarNextAvailableTimeService.broadcast = function(type, msg) {
			$rootScope.$broadcast("sn.cnat." + type, msg);
		};
		snCalendarNextAvailableTimeService.translate = function() {
			var locale = {
				"days": {
					previous: i18n.getMessage("Previous month"),
					next: i18n.getMessage("Next month")
				},
				"months": {
					next: i18n.getMessage("Next year"),
					previous: i18n.getMessage("Previous year"),
				},
				"years": {
					previous: i18n.getMessage("Previous decade"),
					next: i18n.getMessage("Next decade")
				},
				"today": i18n.getMessage("Today")
			};
			return locale;
		};
		snCalendarNextAvailableTimeService.normalizeKeyCode = function(evt) {
			evt.charCode = evt.charCode === 0 ? evt.keyCode : evt.charCode;
			return evt;
		};
		snCalendarNextAvailableTimeService.locale = function() {
			var lang = angular.element("html").attr("lang");
			var momentLocaleMapper = {
				'pb': 'pt-br', //Portuguese-Brazil
				'fq': 'fr-ca', //French Canadian
				'fc': 'fr-ca', //French Canadian
				'zt': 'zh-tw', //Chinese Traditional
				'zh': 'zh-cn' //Chinese Simplified
			};
			return momentLocaleMapper[lang] ? momentLocaleMapper[lang] : lang;
		};
	})
	.directive("snChangeDatePicker", function(i18n, getTemplateUrl, $timeout, NEXT_AVAILABLE_TIME, snCalendarNextAvailableTimeService) {
		return {
			replace: true,
			restrict: "E",
			templateUrl: getTemplateUrl("sn_next_available_time_date_picker.xml"),
			link: function($scope, element, $attrs) {
				function handler(evt) {
					evt = snCalendarNextAvailableTimeService.normalizeKeyCode(evt);
					var index;
					var next;
					var minicalObj = angular.element(element).datetimepicker().data("DateTimePicker");
					var focused = angular.element(document.activeElement);
					var list = angular.element(".datepicker > div:visible").find(".prev:visible, .next:visible, [tabindex='0']");
					if (typeof index === "undefined")
						index = list.index(focused);
					switch (evt.charCode) {
						case NEXT_AVAILABLE_TIME.KEYS.TABKEY:
						case NEXT_AVAILABLE_TIME.KEYS.LEFT:
						case NEXT_AVAILABLE_TIME.KEYS.RIGHT:
							var nav = focused.parents(".bootstrap-datetimepicker-widget");
							if (nav.length) {
								evt.preventDefault();
								evt.stopPropagation();
								if ((evt.charCode === NEXT_AVAILABLE_TIME.KEYS.TABKEY && !evt.shiftKey) || evt.charCode === NEXT_AVAILABLE_TIME.KEYS.RIGHT)
									index = (index === list.length - 1) ? 0 : index + 1;
								else if ((evt.charCode === NEXT_AVAILABLE_TIME.KEYS.TABKEY && evt.shiftKey) || evt.charCode === NEXT_AVAILABLE_TIME.KEYS.LEFT)
									index = (index === 0) ? list.length - 1 : index - 1;
								next = list.get(index);
							}
							break;
						case NEXT_AVAILABLE_TIME.KEYS.UP:
							if (focused.is("th")) {
								next = list.get(list.length - 1);
								break;
							}
							var noOfcols = (minicalObj.viewMode === NEXT_AVAILABLE_TIME.VIEW_MODE.DAY) ? 7 : 4;
							var noOfHeaderElements = 3;
							if (index === noOfHeaderElements)
								index = 0;
							else if (index > noOfHeaderElements && index < noOfHeaderElements + noOfcols - 1)
								index = 1;
							else
								index -= noOfcols;
							next = list.get(index);
							break;
						case NEXT_AVAILABLE_TIME.KEYS.DOWN:
							if (focused.is("th")) {
								next = list.get(3);
								break;
							}
							switch (minicalObj.viewMode) {
								case NEXT_AVAILABLE_TIME.VIEW_MODE.DAY:
									index = (index + 7 > list.length - 1) ? 0 : index + 7;
									break;
								case NEXT_AVAILABLE_TIME.VIEW_MODE.MONTH:
								case NEXT_AVAILABLE_TIME.VIEW_MODE.YEAR:
									index = (index + 4 > list.length - 1) ? 0 : index + 4;
									break;
							}
							next = list.get(index);
							break;
						case NEXT_AVAILABLE_TIME.KEYS.ENTER:
							focused.click();
							next = focused;
							break;
						case NEXT_AVAILABLE_TIME.KEYS.ESCAPE:
							evt.preventDefault();
							evt.stopPropagation();
							minicalObj.hide();
							return;
					}
					if (next)
						next.focus();
				}
				angular.element(element).datetimepicker({
					language: snCalendarNextAvailableTimeService.locale(),
					format: "L",
					viewMode: 'days',
					pickTime: false,
					icons: {
						previous: 'icon-arrow-left',
						next: 'icon-arrow-right'
					},
					defaultDate: $scope.getCurrentDate(),
					translation: snCalendarNextAvailableTimeService.translate()
				}).on("dp.show", function(event) {
					$timeout(function() {
						angular.element(event.currentTarget).find("button").attr("aria-expanded", true);
						var minical = angular.element(".bootstrap-datetimepicker-widget");
						minical.attr("aria-expanded", true);
						minical.off("keydown"); // make sure the keydown event is not attached
						minical.on("keydown", handler);
						minical.find("table").attr("role", "presentation");
						angular.element(".datepicker div:visible th.prev").focus();
					});
				}).on('dp.change', function(event) {
					if (!event.oldDate.isValid()) return;
					$scope.setCurrentDate(event.date);
				}).on("dp.hide", function(event) {
					if (angular.element(event.currentTarget).find("button").attr("aria-expanded") === "false")
						return;
					angular.element(event.currentTarget).find("button").attr("aria-expanded", false);
					var minical = angular.element(".bootstrap-datetimepicker-widget");
					minical.attr("aria-expanded", false);
					minical.off("keydown");
					angular.element("#change-date-picker").focus();
				}).on("sn.changeview", function(event) {
					if (angular.element(event.currentTarget).find("button").attr("aria-expanded") === "false")
						return;
					angular.element(".datepicker-" + event.view + " .prev").focus();
				});
			},
			controller: function($scope) {
				$scope.$on('modal.closing', function(event) {
					angular.element('#datetimepicker1').data("DateTimePicker").destroy();
				});
				$timeout(function() {
					angular.element("#change-date-picker").focus();
				});
			}
		};
	})
	.directive("snFormNextAvailableTime", function(i18n, getTemplateUrl, $window, $timeout, NEXT_AVAILABLE_TIME, snCalendarNextAvailableTimeService) {
		"use strict";
		return {
			replace: true,
			restrict: "E",
			scope: {
				title: "@"
			},
			templateUrl: function(tElement, tAttrs) {
				return getTemplateUrl("sn_next_available_time_window.xml");
			},
			link: function($scope, $element, $attrs) {
				$scope.form = true;

				angular.element($window.document).on("keydown", function(event) {
					event = snCalendarNextAvailableTimeService.normalizeKeyCode(event);
					if (NEXT_AVAILABLE_TIME.KEYS.ESCAPE === event.charCode && $scope.form && $window && $window.parent && $window.parent.GlideModal)
						setTimeout(function() {
							new $window.parent.GlideModal().get(NEXT_AVAILABLE_TIME.FORM.MODAL).destroy();
						}, 0);
				});
			},
			controller: ["snCalendarNextAvailableTimeService", "i18n", "$scope", "$timeout", "$window", "$location", "NEXT_AVAILABLE_TIME", NextAvailableModalInstanceCtrl]
		};
	})
	.directive("snCalendarNextAvailableTime", function(i18n, getTemplateUrl, $uibModal, $window, $timeout) {
		"use strict";
		return {
			replace: true,
			restrict: "E",
			scope: {
				title: "@"
			},
			templateUrl: function(tElement, tAttrs) {
				if (!tAttrs.template)
					return getTemplateUrl("sn_next_available_time.xml");
				return getTemplateUrl(tAttrs.template);
			},
			link: function($scope, $element, $attrs) {
				$scope.messages = {
					"Scheduling Assistant": i18n.getMessage("Scheduling Assistant")
				};

				if (!$scope.title)
					$scope.title = $scope.messages["Scheduling Assistant"];

				$scope.show = function() {
					if ($scope.$parent && $scope.$parent.$parent && $scope.$parent.$parent.fieldPermission) {
						var fieldPermission = $scope.$parent.$parent.fieldPermission;
						return (fieldPermission.start_date.canRead && fieldPermission.start_date.canWrite && fieldPermission.end_date.canRead && fieldPermission.end_date.canWrite);
					}
					return true;
				};
				$scope.templateXML = (!$attrs.templateModal) ? "sn_next_available_time_window.xml" : $attrs.templateModal;
				$scope.ctrller = (!$attrs.controller || typeof $attrs.controller !== "function") ? NextAvailableModalInstanceCtrl : $attrs.controller;
			},
			controller: function($scope) {
				$scope.openNextAvailableTimeWindow = function() {
					var modalInstance = $uibModal.open({
						animation: true,
						templateUrl: getTemplateUrl($scope.templateXML),
						controller: $scope.ctrller,
						size: "sm"
					});
				};
				$scope.$on("isLoading", function(loadingElements) {
					$scope.loadingElements = loadingElements;
				});
			}
		};
	});

function sanitizeSysId(sysId) {
	sysId = sysId + '';
	var regexSysId = /[0-9a-f]{32}/;
	var foundArr = sysId.match(regexSysId);
	return (Array.isArray(foundArr) && foundArr.length === 1) ? foundArr[0] : '';
}

function NextAvailableModalInstanceCtrl(snCalendarNextAvailableTimeService, i18n, $scope, $timeout, $window, $location, NEXT_AVAILABLE_TIME, $uibModalInstance) {
	$scope.tabbable = {
		"include": "button:visible, [tabindex]:visible",
		"exclude": "[tabindex='-1'], [disabled='disabled']"
	};
	$scope.messages = {
		"Calendar": i18n.getMessage("Calendar"),
		"Cancel": i18n.getMessage("Cancel"),
		"Close": i18n.getMessage("Close"),
		"Select Available Time": i18n.getMessage("Select Available Time"),
		"Time Zone": i18n.getMessage("Time Zone"),
		"from_to": i18n.getMessage("from {0} to {1}"),
		"Today": i18n.getMessage("Today"),
		"Previous week": i18n.getMessage("Previous week"),
		"Next week": i18n.getMessage("Next week"),
		"to": i18n.getMessage("change_management_to_string").toLowerCase(),
		"No Available Time": i18n.getMessage("No Available Time"),
		"Loading": i18n.getMessage("Loading"),
		"Search": i18n.getMessage("Search"),
		"No availability found, try again.": i18n.getMessage("No availability found, try again."),
		"Searching for availability...": i18n.getMessage("Searching for availability..."),
		"Scheduling conflict avoided. Save the form to schedule the change request.": i18n.getMessage("Scheduling conflict avoided. Save the form to schedule the change request."),
		"No Permission": i18n.getMessage("No Permission")
	};
	var slotSelected = {};
	var locale = snCalendarNextAvailableTimeService.locale();
	moment.locale(locale);
	moment.updateLocale(locale, {
		week: {
			dow: (parseInt(window.g_first_day_of_week) === 1) ? 0 : 1
		}
	});
	var timezone = $window.g_tz;
	var timeFormat = $window.g_time_format;
	var dateTimeFormat = $window.g_date_time_format;
	var systemDateTimeFormat = "YYYY-MM-DD HH:mm:ss";
	var currentTime;
	var mToday = moment.tz(timezone).startOf("day");
	var range = {};
	var modalLoaded = false;
	var lastFocused;
	$scope.title = $scope.messages["No availability found, try again."];
	$scope.intro_message = "";
	$scope.reason_message = "";
	$scope.display_message = "";
	$scope.crossSlots = [];
	$scope.slots = [];
	$scope.timezone = moment().tz(timezone).zoneAbbr();
	$scope.isLoading = false;
	$scope.showSearch = true;

	var chgId = sanitizeSysId($location.search().sysparm_changeId);

	var requestPromise;
	var fullyExpanded = false;

	init();

	function init() {
		lastFocused = angular.element(document.activeElement);
		$scope.isLoading = true;
		$scope.showSearch = true;
		snCalendarNextAvailableTimeService.abort(requestPromise); // abort any request as we're about to start a new one

		if (currentTime) {
			var startWeekTZ = currentTime.startOf("week").format(systemDateTimeFormat);
			var endWeekTZ = currentTime.endOf("week").format(systemDateTimeFormat);
			range.startDate = moment.tz(startWeekTZ, timezone).utc().format(systemDateTimeFormat);
			range.endDate = moment.tz(endWeekTZ, timezone).utc().format(systemDateTimeFormat);
			getHeader();
		}

		requestPromise = snCalendarNextAvailableTimeService.getSlots(chgId, range);
		requestPromise.then(function(result) {
			$scope.crossSlots = [];
			$scope.slots = [];
			var objResult = result.spans;
			if (!objResult && result.display_message) {
				$scope.title = $scope.messages["No Permission"];
				$scope.display_message = result.display_message;
				$scope.showSearch = false;
				return;
			}
			if (objResult.length > 0 && range.hasOwnProperty("startDate") && !modalLoaded) {
				currentTime = getMomentDate(objResult[0].start.display_value);
				getHeader();
			} else if (objResult.length === 0 && !modalLoaded) {
				angular.element(".modal-dialog").removeClass("modal-lg");
				angular.element(".modal-dialog").addClass("modal-sm");
				$scope.intro_message = result.intro_message;
				$scope.reason_message = result.reason_message;
				$scope.display_message = result.display_message;
				currentTime = null;
				var newRangeStart = getMomentDate(result.suggested_range.start);
				var newRangeEnd = getMomentDate(result.suggested_range.end);
				range.startDate = newRangeStart.format(systemDateTimeFormat);
				range.endDate = newRangeEnd.format(systemDateTimeFormat);
				if (!modalLoaded) return;
			}
			modalLoaded = true;
			if ($scope.form) {
				$window.parent.$j("#chg_next_available_time > .modal-dialog").removeClass("modal-sm");
				$window.parent.$j("#chg_next_available_time > .modal-dialog").addClass("modal-lg");
			} else {
				angular.element(".modal-dialog").addClass("modal-lg");
				angular.element(".modal-dialog").removeClass("modal-sm");
			}
			for (var index = 0; index < objResult.length; index++) {
				var slot = objResult[index];
				if (getMomentDate(slot.start.display_value).isBefore(mToday))
					continue; // don't show slots that start in the past
				if (!currentTime) {
					currentTime = getMomentDate(slot.start.display_value);
					getHeader();
				}
				var startInCurrentWeek = isCurrentWeek(slot.start.display_value, "[)");
				var endInCurrentWeek = isCurrentWeek(slot.end.display_value, "(]");
				if (startInCurrentWeek || endInCurrentWeek) {
					var slotObj = getTimes(slot);
					slotObj.prev_week = (!startInCurrentWeek && endInCurrentWeek) ? true : false;
					slotObj.next_week = (startInCurrentWeek && !endInCurrentWeek) ? true : false;
					slotObj = calculateColumnNumber(slotObj);
					if (slotObj.crossover)
						$scope.crossSlots.push(slotObj);
					else
						$scope.slots.push(slotObj);
				}
			}
			$scope.crossSlots = calculateRowNumber($scope.crossSlots);
			$scope.slots = calculateRowNumber($scope.slots);

			/** HELPERS **/
			function getTimes(span) {
				var sd = getMomentDate(span.start.display_value);
				var ed = getMomentDate(span.end.display_value);
				if (ed.format("HH:mm:ss") === "00:00:00")
					ed.add("-1", "seconds"); // if midnight, we don't want it to think it's crossover to next day
				var diff = ed.startOf("day").diff(sd.startOf("day"), "days");
				return {
					startDate: getMomentDate(span.start.display_value).format("YYYY-MM-DD"),
					start: getMomentDate(span.start.display_value).format(timeFormat),
					startDateTime: getMomentDate(span.start.display_value).format(dateTimeFormat),
					start_date_display: span.start.display_value,
					endDate: getMomentDate(span.end.display_value).format("YYYY-MM-DD"),
					end: getMomentDate(span.end.display_value).format(timeFormat),
					endDateTime: getMomentDate(span.end.display_value).format(dateTimeFormat),
					end_date_display: span.end.display_value,
					crossover: diff > 0,
					spandiff: diff,
					start_date_utc: getMomentDate(span.start.display_value).utc().format(systemDateTimeFormat),
					end_date_utc: getMomentDate(span.end.display_value).utc().format(systemDateTimeFormat),
					start_date_utc_display: getMomentDate(span.start.display_value).utc().format(dateTimeFormat),
					end_date_utc_display: getMomentDate(span.end.display_value).utc().format(dateTimeFormat)
				};
			}
		}).finally(function() {
			$scope.isLoading = false;
			$timeout(function() {
				if ($scope.form && !fullyExpanded) {
					var contentHeight = angular.element($window.document).outerHeight();
					// We add 4px here because GlideModal defines a parent div that is absolutely positioned, top: 2px, bottom: 2px
					$window.parent.$j("#chg_next_available_time div.container-fluid").outerHeight(contentHeight + 4);
					fullyExpanded = true;
				}
				if (lastFocused)
					lastFocused.focus();
				var modalEl = angular.element("#cnat");
				if (modalEl.find("#cnat-data:visible").length === 0)
					if (lastFocused.hasClass("btn-cnat-search"))
						angular.element(".btn-cnat-search").focus();
					else
						angular.element(".btn-cnat-cancel").focus();
			});
		});
	}

	function getMomentDate(sDate) {
		return moment.tz(sDate, dateTimeFormat, timezone);
	}

	function isCurrentWeek(dateTimeDisplayValue, restriction) {
		var mDate = getMomentDate(dateTimeDisplayValue);
		var mBoW = moment.tz($scope.cols[0].id + " 00:00:00", systemDateTimeFormat, timezone);
		var mEoW = moment.tz($scope.cols[6].id + " 23:59:59", systemDateTimeFormat, timezone);
		mEoW.add("1", "seconds"); // Move the end of the week to the correct limit (midnight)
		return (mDate.isBetween(mBoW, mEoW, "second", restriction) && mDate.isSameOrAfter(mToday, "day"));
	}

	function getHeader() {
		$scope.cols = [];
		$scope.title = currentTime.startOf("week").format("DD MMMM YYYY") + " - " + currentTime.endOf("week").format("DD MMMM YYYY");
		var t = currentTime.clone();
		for (var j = 0; j < 7; j++) {
			t.startOf('week').add(j, "days");
			$scope.cols.push({
				id: t.format("YYYY-MM-DD"),
				day: t.format("DD"),
				dow: t.format("dddd"),
				value: t.format("YYYY-MM-DD"),
				isToday: t.isSame(moment().tz(timezone), "day")
			});
		}
	}

	function findColumnIndex(value) {
		for (var i = 0; i < $scope.cols.length; i++)
			if ($scope.cols[i].id === value)
				return i + 1;
		return 1;
	}

	function calculateColumnNumber(span) {
		if (span.prev_week)
			span.colStart = 1;
		if (span.next_week)
			span.colSpan = 7;

		var sd = null;
		var ed = null;
		if (!span.prev_week && span.next_week) {
			sd = moment.utc(span.start_date_utc_display, dateTimeFormat).tz(timezone);
			span.colStart = findColumnIndex(sd.format("YYYY-MM-DD"));
			span.colSpan = span.colSpan - findColumnIndex(sd.format("YYYY-MM-DD")) + 1;
		} else if (span.prev_week && !span.next_week) {
			ed = moment.utc(span.end_date_utc_display, dateTimeFormat).tz(timezone);
			span.colSpan = findColumnIndex(ed.format("YYYY-MM-DD"));
		} else if (!span.prev_week && !span.next_week) {
			sd = moment.utc(span.start_date_utc_display, dateTimeFormat).tz(timezone);
			ed = moment.utc(span.end_date_utc_display, dateTimeFormat).tz(timezone);
			if (ed.format("HH:mm:ss") === "00:00:00")
				ed.add("-1", "seconds"); // Don't want to show it crosses to the next week if it finishes at midnight
			span.colStart = findColumnIndex(sd.format("YYYY-MM-DD"));
			span.colSpan = ed.startOf("day").diff(sd.startOf("day"), "days") + 1;
		}
		return span;
	}

	function calculateRowNumber(slotsArray) {
		if (slotsArray.length === 0)
			return slotsArray;

		slotsArray[0].row = 1;
		for (var i = 1; i < slotsArray.length; i++) {
			var counter = 1;
			for (var j = 0; j < i; j++) {
				var prevSD = moment.tz(slotsArray[j].startDate, "YYYY-MM-DD", timezone);
				var prevED = moment.tz(slotsArray[j].endDate, "YYYY-MM-DD", timezone);
				var dateCollision = moment.tz(slotsArray[i].startDate, "YYYY-MM-DD", timezone).isBetween(prevSD, prevED, null, "[]");
				if (dateCollision && counter === slotsArray[j].row)
					counter += 1;
			}
			slotsArray[i].row = counter;
		}
		return slotsArray;
	}

	function findSlot(array, col) {
		var BoD = moment.tz(col.id, "YYYY-MM-DD", timezone).startOf("day");
		var EoD = moment.tz(col.id, "YYYY-MM-DD", timezone).endOf("day");
		if (!array.find) // IE11
			for (var i = 0; i < array.length; i++) {
				var slot = array[i];
				var mSlotStartDateTime = getMomentDate(slot.startDateTime);
				var mSlotEndDateTime = getMomentDate(slot.endDateTime);
				var isInPreviousColumn = mSlotStartDateTime.isBefore(BoD, "second") && mSlotEndDateTime.isSameOrBefore(BoD, "second");
				var isInNextColumn = mSlotStartDateTime.isSameOrAfter(EoD, "second") && mSlotEndDateTime.isAfter(EoD, "second");
				return !isInPreviousColumn && !isInNextColumn;
			}
		else
			return array.find(function(slot) {
				var mSlotStartDateTime = getMomentDate(slot.startDateTime);
				var mSlotEndDateTime = getMomentDate(slot.endDateTime);
				var isInPreviousColumn = mSlotStartDateTime.isBefore(BoD, "second") && mSlotEndDateTime.isSameOrBefore(BoD, "second");
				var isInNextColumn = mSlotStartDateTime.isSameOrAfter(EoD, "second") && mSlotEndDateTime.isAfter(EoD, "second");
				return !isInPreviousColumn && !isInNextColumn;
			});
	}

	function setMinicalendar(mDate) {
		var minicalObj = angular.element("div#datetimepicker1").datetimepicker().data("DateTimePicker");
		minicalObj.setDate(mDate);
	}

	$scope.isInitLoading = function() {
		return $scope.isLoading && !modalLoaded;
	};

	$scope.isLoaded = function() {
		return currentTime && !$scope.isLoading;
	};

	$scope.isEmpty = function() {
		return $scope.isLoaded() && ($scope.crossSlots.length === 0 && $scope.slots.length === 0) && !modalLoaded;
	};

	$scope.hasCrossSlots = function() {
		return $scope.crossSlots.length > 0;
	};

	$scope.getSlotDisplayValue = function(slot) {
		var val = "";
		if (!slot)
			return val;
		if (slot.hasOwnProperty("start"))
			val = slot.start;
		if (slot.hasOwnProperty("end"))
			val += " - " + slot.end;
		return val;
	};

	$scope.getSlotAriaDisplayValue = function(slot) {
		if (!slot)
			return;
		var s = moment.utc(slot.start_date_utc_display, dateTimeFormat);
		var e = moment.utc(slot.end_date_utc_display, dateTimeFormat);
		var aria;
		if (s.tz(timezone).format("dddd DD MMMM YYYY") === e.tz(timezone).format("dddd DD MMMM YYYY"))
			aria = s.tz(timezone).format("dddd DD MMMM YYYY") + " " + $scope.messages["from_to"].withValues([s.tz(timezone).format(timeFormat), e.tz(timezone).format(timeFormat)]);
		else
			aria = $scope.messages["from_to"].withValues([s.tz(timezone).format("dddd DD MMMM YYYY HH:mm:ss"), e.tz(timezone).format("dddd DD MMMM YYYY HH:mm:ss")]);
		return aria;
	};

	$scope.hasSlots = function(col) {
		if (findSlot($scope.crossSlots, col)) return true;
		if (findSlot($scope.slots, col)) return true;
		return false;
	};

	$scope.getStyles = function(slot, index) {
		if (!slot)
			return;
		if (!slot.hasOwnProperty("startDate") && $scope.hasSlots(slot))
			return;

		var row = (!slot.row) ? 1 : slot.row;
		var colStart = (!slot.colStart) ? index + 1 : slot.colStart;
		var colSpan = (!slot.colSpan) ? 1 : slot.colSpan;

		var startRowStyle = "grid-row-start: " + row + ";";
		var startRowStyleIE = "-ms-grid-row: " + row + ";";

		var startColStyle = "grid-column-start: " + colStart + ";";
		var startColStyleIE = "-ms-grid-column: " + colStart + ";";

		var endColStyle = "grid-column-end: span " + colSpan + ";";
		var endColStyleIE = "-ms-grid-column-span: " + colSpan + ";";

		var result = startRowStyle + startRowStyleIE + startColStyle + startColStyleIE + endColStyle + endColStyleIE;
		return result;
	};

	$scope.isSelected = function(slot, rowIndex) {
		if (Object.keys(slotSelected).length === 0)
			return false;
		if (typeof rowIndex === "number")
			slot = slot[rowIndex];
		if (!slot)
			return false;
		return slot.start === slotSelected.start && slot.end === slotSelected.end &&
			slot.startDate === slotSelected.startDate && slot.endDate === slotSelected.endDate;
	};

	$scope.selectSlot = function(slot, $evt, rowIndex) {
		$evt = snCalendarNextAvailableTimeService.normalizeKeyCode($evt);
		// Ignore any other key that it's not Space or Enter
		if ($evt.type === "keyup" && ($evt.charCode !== NEXT_AVAILABLE_TIME.KEYS.SPACE && $evt.charCode !== NEXT_AVAILABLE_TIME.KEYS.ENTER))
			return;

		$evt.preventDefault(); // This prevents scrolling when pressing Space bar
		if (typeof rowIndex === "number")
			slotSelected = slot[rowIndex];
		else
			slotSelected = slot;

		var isEnterPressed = ($evt.type === "keyup" && $evt.charCode === NEXT_AVAILABLE_TIME.KEYS.ENTER) ||
			($evt.type === "click" && $evt.originalEvent && $evt.originalEvent.pointerType === "" && $evt.originalEvent.detail === 0) ||
			($evt.type === "click" && $evt.originalEvent && typeof $evt.originalEvent.pointerType === "undefined" && $evt.originalEvent.detail === 0);
		if (isEnterPressed)
			$scope.submit($evt);
	};

	$scope.disableSubmit = function() {
		if (!slotSelected || Object.keys(slotSelected).length === 0)
			return true;
		return false;
	};

	$scope.getCurrentDate = function() {
		if (!currentTime)
			currentTime = moment().tz(timezone);
		return currentTime;
	};

	$scope.setCurrentDate = function(d) {
		currentTime = (d && d._isAMomentObject) ? d : getMomentDate(d);
		init();
	};

	$scope.isToday = function(obj) {
		return obj.isToday;
	};

	$scope.goThisWeek = function(event) {
		setMinicalendar(moment().tz(timezone));
	};

	$scope.navigateWeek = function(value, event) {
		setMinicalendar(currentTime.clone().add(value, "week"));
	};

	$scope.hasScrollbar = function(isCrossOverSlot) {
		if (navigator.userAgent.match(/iPad/i) !== null)
			return false;
		var el = (isCrossOverSlot) ? angular.element(".cnat-crossover-wrapper") : angular.element(".cnat-slots-wrapper");
		if ($window._isIE || ($window._isFF && !$window._isChrome))
			el.css("overflow-y", "auto");
		else
			el.css("-ms-overflow-style", "-ms-autohiding-scrollbar");
		return el.get(0).scrollHeight > el.get(0).clientHeight + 1; // Add 1px to compensate the border
	};

	$scope.search = function() {
		currentTime = null;
		init();
	};

	$scope.cancel = function() {
		if ($uibModalInstance)
			$uibModalInstance.dismiss("cancel");
		if ($scope.form && $window && $window.parent && $window.parent.GlideModal)
			setTimeout(function() {
				new $window.parent.GlideModal().get(NEXT_AVAILABLE_TIME.FORM.MODAL).destroy();
			}, 0);
	};

	$scope.abort = function() {
		if (requestPromise !== null)
			snCalendarNextAvailableTimeService.abort(requestPromise);
		$scope.cancel();
	};

	$scope.submit = function($evt) {
		$evt.preventDefault();
		$evt.stopPropagation();
		if (!$scope.form)
			snCalendarNextAvailableTimeService.submit(chgId, slotSelected).then(function(result) {
				snCalendarNextAvailableTimeService.broadcast("update", result);
			});
		if ($scope.form && $window && $window.parent && $window.parent.g_form) {
			var formWindow = $window.parent;
			formWindow.g_scratchpad.next_available_time = {};
			formWindow.g_scratchpad.next_available_time.start_date = slotSelected.start_date_display;
			formWindow.g_scratchpad.next_available_time.end_date = slotSelected.end_date_display;
			formWindow.g_form.clearMessages();
			formWindow.g_form.addInfoMessage($scope.messages["Scheduling conflict avoided. Save the form to schedule the change request."]);
		}
		$scope.cancel();
	};
}
