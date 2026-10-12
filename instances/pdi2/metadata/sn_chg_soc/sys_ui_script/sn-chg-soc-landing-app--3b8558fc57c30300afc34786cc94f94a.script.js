var app = angular.module("sn.chg_soc.landing",
    ["sn.common",
    "sn.common.glide",
    "sn.app_common",
    "ui.bootstrap",
    "ngAnimate",
    "sn.app_itsm.now.filter",
    "sn.app_itsm.now.accessibility",
    "sn.app_itsm.now.iscroll",
    "sn.chg_soc.tooltip_overflow",
    "sn.chg_soc.landing_wizard",
    "sn.chg_soc.landing_splash_screens",
    "sn.chg_soc.notification"
    ]);
app.controller("ScheduleSoCController", ["$scope", "$window", "userPreferences", "getTemplateUrl", "i18n", "$timeout", "$filter", "snConnectService", "ScheduleService", "TextSearchService", "HighlightService", "SOC",
function ($scope, $window, userPreferences, getTemplateUrl, i18n, $timeout, $filter, snConnectService, ScheduleService, TextSearchService, HighlightService, SOC) {

    var scheduleSoCCtrl = this;
    var userPreferenceScheduleFilter = "com.snc.soc.landing_page.schedule_filter";
    var debouceTimeout;

    scheduleSoCCtrl.isRTL = angular.element("html").hasClass("rtl");
    scheduleSoCCtrl.showSchedules = false;
    scheduleSoCCtrl.textSearchReadOnly = true;
    scheduleSoCCtrl.textSearch = "";
    scheduleSoCCtrl.scheduleOffset = 0;
    scheduleSoCCtrl.limitReached = false;
    scheduleSoCCtrl.showSchedulePinnedMsg = false;
    scheduleSoCCtrl.loading = true;
    scheduleSoCCtrl.searching = false;
    scheduleSoCCtrl.canCreateSchedule = ($window.NOW.soc_schedules.canCreate === "true");

    scheduleSoCCtrl.filter = $window.NOW.soc_schedules.schedule_filter || "pinned";
    scheduleSoCCtrl.userID = $window.NOW.user_id;
    scheduleSoCCtrl.limit = parseInt($window.NOW.soc_schedules.schedule_limit || "40");
    scheduleSoCCtrl.maxSchedules = parseInt($window.NOW.soc_schedules.max_schedules || "300");
    scheduleSoCCtrl.notificationTimeout = parseInt($window.NOW.soc_schedules.notification_timeout || "4000");
    scheduleSoCCtrl.isChatEnabled = ($window.NOW.soc_schedules.chat_enabled === "true");
    scheduleSoCCtrl.isAccessibilityEnabled = ($window.NOW.soc_schedules.isAccessibilityEnabled === "true");
    scheduleSoCCtrl.showPinnedNotification = ($window.NOW.soc_schedules.pinned_notification === "true");

    $scope.$on("textSearch", function(event, textSearch) {
        scheduleSoCCtrl.textSearch = textSearch;
        scheduleSoCCtrl.searching = true;
        if (debouceTimeout)
            $timeout.cancel(debouceTimeout);
        debouceTimeout = $timeout(function() {
            _reset();
        }, 1000);
    });

    $scope.$watch("selectedSort", function(newValue, oldValue) {
        if (!newValue || !oldValue)
            return;
        _reset();
    });

    function _isFiltered() {
        return scheduleSoCCtrl.textSearch.trim() !== "";
    }

    $scope.isLoading = function() {
        return scheduleSoCCtrl.loading;
    };

    scheduleSoCCtrl.isSearching = function() {
        return scheduleSoCCtrl.searching;
    };

	scheduleSoCCtrl.pinMessage = function(schedule) {
		if (scheduleSoCCtrl.isPinned(schedule.sys_id.value))
			return i18n.format(scheduleSoCCtrl.form.unpinSchedule, {name: schedule.name.display_value});
		return i18n.format(scheduleSoCCtrl.form.pinSchedule, {name: schedule.name.display_value});
	};

	function _showPinnedNotification(schedule) {
		if (!schedule || !schedule.sys_id || !schedule.name || !scheduleSoCCtrl.showPinnedNotification)
			return;

		var msg = scheduleSoCCtrl.isPinned(schedule.sys_id.value) ? scheduleSoCCtrl.form.addTo : scheduleSoCCtrl.form.removeFrom;

		scheduleSoCCtrl.form.schedulePinnedMsg = i18n.format(msg, {
			name: schedule.name.display_value,
			yourPinned: scheduleSoCCtrl.form.pinned.title
		});

		scheduleSoCCtrl.showSchedulePinnedMsg = true;

		$timeout(function() {
			scheduleSoCCtrl.showSchedulePinnedMsg = false;
		}, scheduleSoCCtrl.notificationTimeout);

	}

    function _splashScreenVisibility() {
        scheduleSoCCtrl.showSplashMsg = ScheduleService.showSplashMsg(scheduleSoCCtrl.filter) && !_isFiltered();
        scheduleSoCCtrl.textSearchReadOnly = scheduleSoCCtrl.showSplashMsg;
        scheduleSoCCtrl.showSchedules = !scheduleSoCCtrl.showSplashMsg;
    }

    scheduleSoCCtrl.getTitle = function() {
        return scheduleSoCCtrl.form[scheduleSoCCtrl.filter].title || "";
    };
    scheduleSoCCtrl.getDescription = function() {
        return scheduleSoCCtrl.form[scheduleSoCCtrl.filter].description || "";
    };
    scheduleSoCCtrl.getInstruction = function() {
        return scheduleSoCCtrl.form[scheduleSoCCtrl.filter].instruction || "";
    };

    scheduleSoCCtrl.getProfile = function(userSysId) {
        if (!ScheduleService.schedules.hasOwnProperty("__struct"))
            return;
        return ScheduleService.schedules.__profile[userSysId];
    };

    scheduleSoCCtrl.getSummary = function (scheduleObj) {
        return scheduleObj.owner.display_value ? scheduleSoCCtrl.form.owner : scheduleSoCCtrl.form.groupOwner;
    };

    scheduleSoCCtrl.highlight = function (text, search) {
        return HighlightService.highlight(text, search, "soc-search-highlight");
    };

    scheduleSoCCtrl.foundSchedules = function () {
        var filteredSchedules = TextSearchService.getFilteredArray(scheduleSoCCtrl.getScheduleArray(), scheduleSoCCtrl.textSearch);
        return scheduleSoCCtrl.initialLoad || (_isFiltered() && filteredSchedules && filteredSchedules.length > 0);
    };

    scheduleSoCCtrl.showNoResultsFound = function() {
        if (!_isFiltered())
            return false;
        return !scheduleSoCCtrl.foundSchedules() && !scheduleSoCCtrl.isSearching() && !$scope.isLoading() && !scheduleSoCCtrl.showSplashMsg;
    };

    scheduleSoCCtrl.isPinned = function (sysId) {
        if (!ScheduleService.schedules.hasOwnProperty("__struct"))
            return false;
        return ScheduleService.schedules.__struct["pinned"].sysIds.indexOf(sysId) !== -1;
    };

    scheduleSoCCtrl.isDisabled = function() {
        if (!ScheduleService.schedules || !ScheduleService.schedules.__struct || $scope.isLoading())
            return true;
        return ScheduleService.schedules.__struct[scheduleSoCCtrl.filter].sysIds.length === 0 && !_isFiltered();
    };

    scheduleSoCCtrl.togglePinned = function ($event, schedule) {
		$event.stopPropagation();
		$event.preventDefault();

        if (!schedule || !schedule.sys_id)
            return;

        ScheduleService.togglePinned(schedule.sys_id.value, scheduleSoCCtrl.isPinned(schedule.sys_id.value));
        _showPinnedNotification(schedule);
        _splashScreenVisibility();
    };

    scheduleSoCCtrl.immediateCheck = function () {
        if (!ScheduleService.schedules.hasOwnProperty("__struct"))
            return false;
        return ScheduleService.hasMoreSchedules(scheduleSoCCtrl.filter);
    };

    scheduleSoCCtrl.getOrderBy = function() {
        if (!$scope.selectedSort)
            return "name";
        return $scope.selectedSort;
    };

    scheduleSoCCtrl.filterBy = function (filter) {
        if (scheduleSoCCtrl.filter === filter)
            return;

        scheduleSoCCtrl.filter = filter;
        $window.NOW.soc_schedules.schedule_filter = filter;
        _splashScreenVisibility();
        ScheduleService.hasReachedLimit(filter);
        userPreferences.setPreference(userPreferenceScheduleFilter, filter);
        if (ScheduleService.schedules.__struct[filter].sysIds.length <= ScheduleService.schedules.__struct[filter].maxLimit)
            scheduleSoCCtrl.getSchedules(scheduleSoCCtrl.textSearch);
    };

    scheduleSoCCtrl.getScheduleArray = function() {
        var arr =  [];
        if (ScheduleService.schedules.hasOwnProperty("__struct") && !scheduleSoCCtrl.searching)
            ScheduleService.schedules.__struct[scheduleSoCCtrl.filter].sysIds.forEach(function(sysId) {
                arr.push(ScheduleService.schedules.chg_soc_definition[sysId]);
            });
        return arr;
    };

    function _getLimit() {
        if (!ScheduleService.schedules.__struct)
            return scheduleSoCCtrl.limit;
		scheduleSoCCtrl.limit = ScheduleService.schedules.__struct[scheduleSoCCtrl.filter].limit; // Reset limit, just in case it's below minimum
        if (ScheduleService.schedules.__struct[scheduleSoCCtrl.filter].maxLimit - ScheduleService.schedules.__struct[scheduleSoCCtrl.filter].offset > scheduleSoCCtrl.limit)
            return scheduleSoCCtrl.limit;
        return ScheduleService.schedules.__struct[scheduleSoCCtrl.filter].maxLimit - ScheduleService.schedules.__struct[scheduleSoCCtrl.filter].offset;
    }

    scheduleSoCCtrl.getSchedules = function () {
        // Do not get more schedules if loading, limit reached, no more schedules or filtering is active
        if ($scope.isLoading() || ScheduleService.hasReachedLimit(scheduleSoCCtrl.filter) || !ScheduleService.hasMoreSchedules(scheduleSoCCtrl.filter))
            return;

        // Do not get more schedules if limit is zero or negative number
        if (ScheduleService.schedules.__struct[scheduleSoCCtrl.filter] && ScheduleService.schedules.__struct[scheduleSoCCtrl.filter].maxLimit < 1) {
            if (scheduleSoCCtrl.initialLoad)
                _splashScreenVisibility();
            return;
        }
        _getSchedules();
    };

    function _getSchedules() {
        var offset = ScheduleService.schedules.__struct[scheduleSoCCtrl.filter].offset;
        scheduleSoCCtrl.loading = true;
        ScheduleService.getSchedules(scheduleSoCCtrl.filter, scheduleSoCCtrl.getOrderBy(), offset, _getLimit(), scheduleSoCCtrl.textSearch.trim()).then(function (schedules) {
            scheduleSoCCtrl.initialLoad = false;
            _splashScreenVisibility();
            scheduleSoCCtrl.loading = false;
        })
        .catch(function(response) {
            if (response.status === 401)
                $window.location.reload();
        });
    }

    function _reset() {
        scheduleSoCCtrl.loading = true;
        ScheduleService.initialHit(scheduleSoCCtrl.filter, scheduleSoCCtrl.getOrderBy(), _getLimit(), scheduleSoCCtrl.textSearch.trim()).then(function (schedules) {
            scheduleSoCCtrl.initialLoad = false;
            _splashScreenVisibility();
            scheduleSoCCtrl.loading = false;
            scheduleSoCCtrl.searching = false;
        })
        .catch(function(response) {
            if (response.status === 401)
                $window.location.reload();
        });
    }

    scheduleSoCCtrl.initialHit = function() {
        scheduleSoCCtrl.loading = true;
        ScheduleService.initialHit(scheduleSoCCtrl.filter, scheduleSoCCtrl.getOrderBy(), _getLimit()).then(function (schedules) {
            scheduleSoCCtrl.initialLoad = false;
            _splashScreenVisibility();
            scheduleSoCCtrl.loading = false;
        })
        .catch(function(response) {
            if (response.status === 401)
                $window.location.reload();
        });
    };

    scheduleSoCCtrl.init = function () {
        scheduleSoCCtrl.initialLoad = true;
        scheduleSoCCtrl.initialHit();
    };

    /****************************
    * POPOVER RELATED FUNCTIONS *
    ****************************/
    scheduleSoCCtrl.userPopovers = {};

    angular.element($window.document).keyup(function ($event) {
        if ($event.keyCode === SOC.KEYS.ESCAPE) {
            Object.keys(scheduleSoCCtrl.userPopovers).forEach(function (memberKey) {
                scheduleSoCCtrl.userPopovers[memberKey].open = false;
            });
            $scope.$apply();
        }
    });

    scheduleSoCCtrl.getPopoverTemplate = function (userSysId) {
        var member = ScheduleService.schedules.__profile[userSysId];
        $scope.profile = {};
        $scope.profile.user = member;
        $scope.profile.user.sys_id = member.userID;
        $scope.profile.manager_name = member.manager_name;
        return getTemplateUrl("sn_chg_soc_avatar.xml");
    };

    scheduleSoCCtrl.closeMemberDialogs = function (scheduleSysId) {
        scheduleSysId = scheduleSysId + "";
        Object.keys(scheduleSoCCtrl.userPopovers).forEach(function (memberKey) {
            if (!scheduleSysId || memberKey.indexOf(scheduleSysId) === -1)
                scheduleSoCCtrl.userPopovers[memberKey].open = false;
        });
    };

    $scope.$watch("scheduleSoCCtrl.userPopovers", function(newValue, oldValue) {
        if (!newValue || !newValue.hasOwnProperty("open"))
            return;
        var popoverSysid;
        angular.forEach(oldValue, function(value, key) {
            if (value.open === true)
                popoverSysid = key;
        });
        if (!popoverSysid)
            return;
        angular.element("#" + popoverSysid + " .user-avatar").focus();
    }, true);

    scheduleSoCCtrl.togglePopover = function ($event, schedule) {
        if ($event.type === "keydown" && ($event.keyCode !== SOC.KEYS.ESCAPE || $event.keyCode !== SOC.KEYS.ENTER))
            return;
        $event.stopPropagation();
        if (!schedule.sys_id || schedule.owner.value === scheduleSoCCtrl.userID)
            return;
        if (scheduleSoCCtrl.userPopovers[schedule.sys_id.value])
            scheduleSoCCtrl.userPopovers[schedule.sys_id.value].open = !scheduleSoCCtrl.userPopovers[schedule.sys_id.value].open;

        // close all other dialogs
        scheduleSoCCtrl.closeMemberDialogs(schedule.sys_id.value);
    };

	scheduleSoCCtrl.popoverAriaLabel = function(schedule) {
		if (!schedule.owner.display_value)
			return '';
		return i18n.format(scheduleSoCCtrl.messages['Open popover'], {userName: schedule.owner.display_value});
	};

    scheduleSoCCtrl.openPopover = function (schedule) {
        if (!schedule.sys_id)
            return;
        if (!scheduleSoCCtrl.userPopovers[schedule.sys_id.value])
            scheduleSoCCtrl.userPopovers[schedule.sys_id.value] = {
                "open": false
            };
        return scheduleSoCCtrl.userPopovers[schedule.sys_id.value].open;
    };

    $scope.isChatEnabled = function (userProfile) {
        return scheduleSoCCtrl.isChatEnabled && userProfile.userID !== scheduleSoCCtrl.userID;
    };

    $scope.getBackgroundStyle = function () {
        if ($scope.profile && $scope.profile.user && $scope.profile.user.avatar && $scope.profile.user.avatar !== "")
            return {
                "background-image": "url(" + $scope.profile.user.avatar + ")"
            };
        if ($scope.profile.user && $scope.profile.user.name)
            return ""; // one-time watch (see angular doc)
        return void(0);
    };

    $scope.openDirectMessageConversation = function (event) {
        if (event.type === "keydown" && event.keyCode !== SOC.KEYS.ENTER)
            return;

        $timeout(function () {
            if ($scope.profile.user.sys_id)
                snConnectService.openWithProfile($scope.profile.user);
        }, 0, false);

        angular.element(".popover").each(function () {
            angular.element(this).remove();
        });
    };

    scheduleSoCCtrl.form = {};
    scheduleSoCCtrl.messages = {
        "Loading...": i18n.getMessage("Loading..."),
        "Searching...": i18n.getMessage("Searching..."),
        "Limit Reached": i18n.getMessage("You have reached the limit of visible Change Schedules in this view."),
        "No results found": i18n.getMessage("No results found"),
        "Open popover": i18n.getMessage("Open popover {userName}")
    };
    scheduleSoCCtrl.form.title = i18n.getMessage("Change Schedules");
    scheduleSoCCtrl.form.filterTitle = i18n.getMessage("Search by name or owner");
    scheduleSoCCtrl.form.pinSchedule = i18n.getMessage("Pin schedule {name}");
    scheduleSoCCtrl.form.unpinSchedule = i18n.getMessage("Unpin schedule {name}");
    scheduleSoCCtrl.form.pin = i18n.getMessage("Pin");
    scheduleSoCCtrl.form.icon = i18n.getMessage("icon");
    scheduleSoCCtrl.form.schedulePinnedMsg = "";
    scheduleSoCCtrl.form.addTo = i18n.getMessage("'{name}' added to '{yourPinned}'");
    scheduleSoCCtrl.form.removeFrom = i18n.getMessage("'{name}' removed from '{yourPinned}'");
    scheduleSoCCtrl.form.close = i18n.getMessage("Close");
    scheduleSoCCtrl.form.sendDirectMsg = i18n.getMessage("Send a direct message");
    scheduleSoCCtrl.form.notAvailable = i18n.getMessage("Not Available");
    scheduleSoCCtrl.form.owner = i18n.getMessage("Owner");
    scheduleSoCCtrl.form.groupOwner = i18n.getMessage("Group owner");
    scheduleSoCCtrl.form.userNameLabel = i18n.getMessage("User name");
    scheduleSoCCtrl.form.userTitleLabel = i18n.getMessage("User title");
    scheduleSoCCtrl.form.contactNumberLabel = i18n.getMessage("User contact number");
    scheduleSoCCtrl.form.emailLabel = i18n.getMessage("User email");
    scheduleSoCCtrl.form.managerLabel = i18n.getMessage("Manager");

    scheduleSoCCtrl.form.pinned = {};
    scheduleSoCCtrl.form["pinned"].title = i18n.getMessage("Pinned Schedules");
    scheduleSoCCtrl.form["pinned"].description = i18n.getMessage("You can pin a schedule from the All Schedules view to have quick access to it here.");
    scheduleSoCCtrl.form["pinned"].instruction = i18n.format(i18n.getMessage("To pin a schedule, hover over the card and click on the '{pin}' icon."), {pin : scheduleSoCCtrl.form.pin});

    scheduleSoCCtrl.form.own_belong = {};
    scheduleSoCCtrl.form["own_belong"].title = i18n.getMessage("Your Schedules");
    scheduleSoCCtrl.form["own_belong"].description = i18n.getMessage("The schedules which appear in Your Schedules are schedules you own or are owned by a group you are a member of.");

    scheduleSoCCtrl.form.all = {};
    scheduleSoCCtrl.form["all"].title = i18n.getMessage("All Schedules");
    scheduleSoCCtrl.form["all"].description = i18n.format(i18n.getMessage("{allSchedules} includes all schedules you have access right to view."), {allSchedules : scheduleSoCCtrl.form.all.title});

    $scope.form = scheduleSoCCtrl.form;
  }]);
