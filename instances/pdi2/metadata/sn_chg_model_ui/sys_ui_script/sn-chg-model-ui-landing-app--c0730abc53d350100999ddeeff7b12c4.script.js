var app = angular.module("sn.chg_model_ui.landing", ["sn.common",
	"sn.common.glide",
	"sn.app_common",
	"ui.bootstrap",
	"ngAnimate",
	"sn.app_itsm.now.filter",
	"sn.app_itsm.now.accessibility",
	"sn.app_itsm.now.iscroll",
	"sn.chg_model_ui.tooltip_overflow",
	"sn.chg_model_ui.landing_splash_screens",
	"sn.chg_model_ui.notification"
]);
app.controller("ChgModelLandingController", ["$scope", "$window", "userPreferences", "i18n", "$timeout", "chgModelService", "TextSearchService", "HighlightService",
	function($scope, $window, userPreferences, i18n, $timeout, chgModelService, TextSearchService, HighlightService) {

		var chgModelLandingCtrl = this;
		var userPreferenceScheduleFilter = "sn_chg_model_ui.landing_page.chg_model_filter";
		var debounceTimeout;

		chgModelLandingCtrl.isRTL = angular.element("html").hasClass("rtl");
		chgModelLandingCtrl.showChgModels = false;
		chgModelLandingCtrl.textSearchReadOnly = true;
		chgModelLandingCtrl.textSearch = "";
		chgModelLandingCtrl.scheduleOffset = 0;
		chgModelLandingCtrl.limitReached = false;
		chgModelLandingCtrl.showChgModelPinnedMsg = false;
		chgModelLandingCtrl.loading = true;
		chgModelLandingCtrl.searching = false;
		chgModelLandingCtrl.cardClicked = false;
		chgModelLandingCtrl.canCreateSchedule = ($window.NOW.chg_model_landing.canCreate === "true");

		chgModelLandingCtrl.filter = $window.NOW.chg_model_landing.chg_model_filter || "pinned";
		chgModelLandingCtrl.userID = $window.NOW.user_id;
		chgModelLandingCtrl.limit = parseInt($window.NOW.chg_model_landing.chg_model_limit || "40");
		chgModelLandingCtrl.maxChgModels = parseInt($window.NOW.chg_model_landing.max_chg_models || "300");
		chgModelLandingCtrl.notificationTimeout = parseInt($window.NOW.chg_model_landing.notification_timeout || "4000");
		chgModelLandingCtrl.isStdChgCatalogActive = ($window.NOW.chg_model_landing.isStdChgCatalogActive === "true");
		chgModelLandingCtrl.isAccessibilityEnabled = ($window.NOW.chg_model_landing.isAccessibilityEnabled === "true");
		chgModelLandingCtrl.showPinnedNotification = ($window.NOW.chg_model_landing.pinned_notification === "true");
		chgModelLandingCtrl.enableLegacyPreapprovedTitle = ($window.NOW.chg_model_landing.enableLegacyPreapprovedTitle === "true");

		$scope.$on("textSearch", function(event, textSearch) {
			chgModelLandingCtrl.textSearch = textSearch;
			chgModelLandingCtrl.searching = true;
			if (debounceTimeout)
				$timeout.cancel(debounceTimeout);
			debounceTimeout = $timeout(function() {
				_reset();
			}, 1000);
		});

		$scope.$watch("selectedSort", function(newValue, oldValue) {
			if (!newValue || !oldValue)
				return;

			_reset();
		});

		function _isFiltered() {
			return chgModelLandingCtrl.textSearch.trim() !== "";
		}

		$scope.isLoading = function() {
			return chgModelLandingCtrl.loading;
		};

		chgModelLandingCtrl.isSearching = function() {
			return chgModelLandingCtrl.searching;
		};

		function _showPinnedNotification(chgModel) {
			if (!chgModel || !chgModel.sys_id || !chgModel.name || !chgModelLandingCtrl.showPinnedNotification)
				return;

			var msg = chgModelLandingCtrl.isPinned(chgModel.sys_id.value) ? chgModelLandingCtrl.form.addTo : chgModelLandingCtrl.form.removeFrom;

			chgModelLandingCtrl.form.schedulePinnedMsg = i18n.format(msg, {
				name: chgModel.name.display_value,
				yourPinned: chgModelLandingCtrl.form.pinned.title
			});

			chgModelLandingCtrl.showChgModelPinnedMsg = true;

			$timeout(function() {
				chgModelLandingCtrl.showChgModelPinnedMsg = false;
			}, chgModelLandingCtrl.notificationTimeout);

		}

		function _splashScreenVisibility() {
			chgModelLandingCtrl.showSplashMsg = chgModelService.showSplashMsg(chgModelLandingCtrl.filter) && !_isFiltered();
			chgModelLandingCtrl.textSearchReadOnly = chgModelLandingCtrl.showSplashMsg;
			chgModelLandingCtrl.showChgModels = !chgModelLandingCtrl.showSplashMsg;
		}

		chgModelLandingCtrl.getTabs = function() {
			var tabs = ["pinned", "all", "change_templates"];
			if (chgModelLandingCtrl.isStdChgCatalogActive) {
				tabs.push("preapproved");
				tabs.push("change_models");
			}
			return tabs.join(" ");
		};

		chgModelLandingCtrl.getTitle = function() {
			return chgModelLandingCtrl.form[chgModelLandingCtrl.filter].splash_title || chgModelLandingCtrl.form[chgModelLandingCtrl.filter].title || "";
		};

		chgModelLandingCtrl.getDescription = function() {
			return chgModelLandingCtrl.form[chgModelLandingCtrl.filter].description || "";
		};

		chgModelLandingCtrl.highlight = function(text, search) {
			return HighlightService.highlight(text, search, "change-model__highlight");
		};

		chgModelLandingCtrl.clearFilters = function() {
			TextSearchService.clearFilters();
		};

		chgModelLandingCtrl.showClearFilters = function() {
			return _isFiltered();
		};

		chgModelLandingCtrl.foundChangeModels = function() {
			var filteredChgModels = TextSearchService.getFilteredArray(chgModelLandingCtrl.chgModelArray, chgModelLandingCtrl.textSearch);
			return chgModelLandingCtrl.initialLoad || (_isFiltered() && filteredChgModels && filteredChgModels.length > 0);
		};

		chgModelLandingCtrl.showNoResultsFound = function() {
			if (!_isFiltered())
				return false;

			return !chgModelLandingCtrl.foundChangeModels() && !chgModelLandingCtrl.isSearching() && !$scope.isLoading() && !chgModelLandingCtrl.showSplashMsg;
		};

		chgModelLandingCtrl.isPinned = function(sysId) {
			if (!chgModelService.changeModels.hasOwnProperty("__struct"))
				return false;

			return chgModelService.changeModels.__struct["pinned"].sysIds.indexOf(sysId) !== -1;
		};

		chgModelLandingCtrl.isDisabled = function() {
			if (!chgModelService.changeModels || !chgModelService.changeModels.__struct || $scope.isLoading())
				return true;

			return chgModelService.changeModels.__struct[chgModelLandingCtrl.filter].sysIds.length === 0 && !_isFiltered();
		};

		chgModelLandingCtrl.setCardClicked = function() {
			chgModelLandingCtrl.cardClicked = true;
		};

		chgModelLandingCtrl.isCardClicked = function() {
			return chgModelLandingCtrl.cardClicked;
		};

		chgModelLandingCtrl.togglePinned = function($event, chgModel) {
			$event.stopPropagation();
			$event.preventDefault();

			if (!chgModel || !chgModel.sys_id)
				return;

			chgModelService.togglePinned(chgModel.sys_id.value);
			_showPinnedNotification(chgModel);
			_splashScreenVisibility();
		};

		chgModelLandingCtrl.immediateCheck = function() {
			if (!chgModelService.changeModels.hasOwnProperty("__struct"))
				return false;

			return chgModelService.hasMoreChangeModels(chgModelLandingCtrl.filter);
		};

		chgModelLandingCtrl.getOrderBy = function() {
			if (!$scope.selectedSort)
				return "name";

			return $scope.selectedSort;
		};

		chgModelLandingCtrl.getPinA11yLabel = function(name, sysId) {
			return chgModelLandingCtrl.isPinned(sysId) ?
				i18n.format(chgModelLandingCtrl.form.unpinChangeModelA11y, {
					name: name
				}) :
				i18n.format(chgModelLandingCtrl.form.pinChangeModelA11y, {
					name: name
				});
		};

		chgModelLandingCtrl.filterBy = function(filter) {
			if (chgModelLandingCtrl.filter === filter)
				return;

			chgModelLandingCtrl.filter = filter;
			$window.NOW.chg_model_landing.chg_model_filter = filter;
			_splashScreenVisibility();
			chgModelService.hasReachedLimit(filter);
			userPreferences.setPreference(userPreferenceScheduleFilter, filter);
			chgModelLandingCtrl.getChangeModels(chgModelLandingCtrl.textSearch);
		};

		chgModelLandingCtrl.getChgModelArray = function() {
			var arr = [];

			if (!chgModelLandingCtrl.filter)
				return arr;

			if (chgModelService.changeModels.hasOwnProperty("__struct") && !chgModelLandingCtrl.searching) {
				var arraySysIds = chgModelService.changeModels.__struct[chgModelLandingCtrl.filter].sysIds;

				for (var i = 0; i < arraySysIds.length && i < chgModelLandingCtrl.maxChgModels; i++)
					arr.push(chgModelService.changeModels.chg_model[arraySysIds[i]]);
			}
			return arr;
		};

		chgModelLandingCtrl.chgModelArray = [];

		function _getLimit() {
			if (!chgModelService.changeModels.__struct)
				return chgModelLandingCtrl.limit;
			chgModelLandingCtrl.limit = chgModelService.changeModels.__struct[chgModelLandingCtrl.filter].limit; // Reset limit, just in case it's below minimum
			if (chgModelService.changeModels.__struct[chgModelLandingCtrl.filter].maxLimit - chgModelService.changeModels.__struct[chgModelLandingCtrl.filter].offset > chgModelLandingCtrl.limit)
				return chgModelLandingCtrl.limit;

			return chgModelService.changeModels.__struct[chgModelLandingCtrl.filter].maxLimit - chgModelService.changeModels.__struct[chgModelLandingCtrl.filter].offset;
		}

		chgModelLandingCtrl.getChangeModels = function() {
			if ($scope.isLoading() || chgModelService.hasReachedLimit(chgModelLandingCtrl.filter) || !chgModelService.hasMoreChangeModels(chgModelLandingCtrl.filter)) {
				chgModelLandingCtrl.chgModelArray = chgModelLandingCtrl.getChgModelArray();
				return;
			}

			// Do not get more records if limit is zero or negative number
			if (chgModelService.changeModels.__struct[chgModelLandingCtrl.filter] && chgModelService.changeModels.__struct[chgModelLandingCtrl.filter].maxLimit < 1) {
				if (chgModelLandingCtrl.initialLoad)
					_splashScreenVisibility();

				return;
			}
			_getChangeModels();
		};

		function _getChangeModels() {
			var offset = chgModelService.changeModels.__struct[chgModelLandingCtrl.filter].offset;
			chgModelLandingCtrl.loading = true;
			chgModelService.getChangeModels(chgModelLandingCtrl.filter, chgModelLandingCtrl.getOrderBy(), offset, _getLimit(), chgModelLandingCtrl.textSearch.trim())
				.then(function(changeModels) {
					chgModelLandingCtrl.initialLoad = false;
					_splashScreenVisibility();
					chgModelLandingCtrl.chgModelArray = chgModelLandingCtrl.getChgModelArray();
					chgModelLandingCtrl.loading = false;
				})
				.catch(function(response) {
					if (response.status === 401)
						$window.location.reload();
				});
		}

		function _reset() {
			chgModelLandingCtrl.loading = true;
			chgModelService.initialHit(chgModelLandingCtrl.filter, chgModelLandingCtrl.getOrderBy(), _getLimit(), chgModelLandingCtrl.textSearch.trim())
				.then(function(changeModels) {
					chgModelLandingCtrl.initialLoad = false;
					_splashScreenVisibility();
					chgModelLandingCtrl.searching = false;
					chgModelLandingCtrl.chgModelArray = chgModelLandingCtrl.getChgModelArray();
					chgModelLandingCtrl.loading = false;
				})
				.catch(function(response) {
					if (response.status === 401)
						$window.location.reload();
				});
		}

		chgModelLandingCtrl.initialHit = function() {
			chgModelLandingCtrl.loading = true;
			chgModelService.initialHit(chgModelLandingCtrl.filter, chgModelLandingCtrl.getOrderBy(), _getLimit())
				.then(function(changeModels) {
					chgModelLandingCtrl.initialLoad = false;
					_splashScreenVisibility();
					chgModelLandingCtrl.chgModelArray = chgModelLandingCtrl.getChgModelArray();
					chgModelLandingCtrl.loading = false;
				})
				.catch(function(response) {
					if (response.status === 401)
						$window.location.reload();
				});
		};

		chgModelLandingCtrl.init = function() {
			chgModelLandingCtrl.initialLoad = true;
			chgModelLandingCtrl.initialHit();
		};

		chgModelLandingCtrl.getStateModel = function(chgModel) {
			if (!chgModel || !chgModel.state_choices)
				return i18n.getMessage("No state model defined");

			var msg = i18n.getMessage("State model: {states}");
			var states = chgModel.state_choices.map(function(state) { return state.label; }).join(", ");
			return i18n.format(msg, { states: states });
		};

		chgModelLandingCtrl.getModelType = function(chgModel) {
			if (chgModel.sys_class_name.value === 'chg_template')
				return chgModel.sttrm_model.display_value;
			return i18n.getMessage("State model");
		};

		chgModelLandingCtrl.getAccentStyle = function(color) {
			if (!color)
				return {};

			return { "background-color": color };
		};

		chgModelLandingCtrl.form = {};
		chgModelLandingCtrl.messages = {
			"Loading...": i18n.getMessage("Loading..."),
			"Searching...": i18n.getMessage("Searching..."),
			"Limit Reached": i18n.getMessage("You have reached the limit of visible Change Request Models in this view."),
			"No results found": i18n.getMessage("No results found")
		};

		chgModelLandingCtrl.form.title = i18n.getMessage("Create a change request");
		chgModelLandingCtrl.form.clearFilters = i18n.getMessage("Clear Filters");
		chgModelLandingCtrl.form.pinChangeModel = i18n.getMessage("Pin Change Model");
		chgModelLandingCtrl.form.pinChangeModelA11y = i18n.getMessage("Pin Change Model - {name}");
		chgModelLandingCtrl.form.unpinChangeModel = i18n.getMessage("Unpin Change Model");
		chgModelLandingCtrl.form.unpinChangeModelA11y = i18n.getMessage("Unpin Change Model - {name}");
		chgModelLandingCtrl.form.pin = i18n.getMessage("Pin");
		chgModelLandingCtrl.form.icon = i18n.getMessage("icon");
		chgModelLandingCtrl.form.schedulePinnedMsg = "";
		chgModelLandingCtrl.form.addTo = i18n.getMessage("'{name}' added to '{yourPinned}'");
		chgModelLandingCtrl.form.removeFrom = i18n.getMessage("'{name}' removed from '{yourPinned}'");
		chgModelLandingCtrl.form.close = i18n.getMessage("Close");

		chgModelLandingCtrl.form.pinned = {};
		chgModelLandingCtrl.form.pinned.title = i18n.getMessage("Pinned");
		chgModelLandingCtrl.form.pinned.splash_title = i18n.getMessage("No pinned models");
		chgModelLandingCtrl.form.pinned.description = i18n.getMessage("You have no pinned models. When you pin a model, the model will be shown in this tab and you can access it directly.");

		chgModelLandingCtrl.form.change_models = {};
		chgModelLandingCtrl.form.change_models.title = i18n.getMessage("Models");
		chgModelLandingCtrl.form.change_models.splash_title = chgModelLandingCtrl.form.change_models.title;
		chgModelLandingCtrl.form.change_models.description = i18n.getMessage("A subset of Change Request types which have a change model.");

		chgModelLandingCtrl.form.preapproved = {};
		chgModelLandingCtrl.form.preapproved.title = chgModelLandingCtrl.enableLegacyPreapprovedTitle ? i18n.getMessage("Preapproved") : i18n.getMessage("Standard changes");
		chgModelLandingCtrl.form.preapproved.splash_title = chgModelLandingCtrl.form.preapproved.title;
		chgModelLandingCtrl.form.preapproved.description = chgModelLandingCtrl.enableLegacyPreapprovedTitle ? i18n.getMessage("A subset of Change Request types which are preapproved.") : i18n.getMessage("A subset of Change Request types which are standard changes.");

		chgModelLandingCtrl.form.all = {};
		chgModelLandingCtrl.form.all.title = i18n.getMessage("All");
		chgModelLandingCtrl.form.all.splash_title = chgModelLandingCtrl.form.all.title;
		chgModelLandingCtrl.form.all.description = i18n.getMessage("All includes all change models you have access right to view.");

		chgModelLandingCtrl.form.change_templates = {};
		chgModelLandingCtrl.form.change_templates.title = i18n.getMessage("Templates");
		chgModelLandingCtrl.form.change_templates.splash_title = chgModelLandingCtrl.form.change_templates.title;
		chgModelLandingCtrl.form.change_templates.description = i18n.getMessage("You have no change templates you have access right to view.");

		$scope.form = chgModelLandingCtrl.form;
	}
]);
