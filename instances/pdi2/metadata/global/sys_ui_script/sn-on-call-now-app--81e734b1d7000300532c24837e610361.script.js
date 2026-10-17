angular.module("sn.on_call.now", ["sn.on_call.now.groups"]);

angular.module("sn.on_call.now.groups", ["sn.common", "sn.app_common", "ui.bootstrap", "sn.on_call.now.filters", "sn.common.glide", "sn.on_call.now.iscroll", "sn.on_call.now.showTooltipOnTextOverflow", "ngAnimate"]).constant("ON_CALL", {
    "SERVICE": {
        "QUERY": "/api/now/on_call_rota/oncallgroups",
        "QUERY_SEARCH": "/api/now/on_call_rota/searchoncallgroups"
    }
});

angular.module('sn.on_call.now.groups').config(function($uibTooltipProvider) {
    var isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints;
    if (isTouchDevice) {
        var options = {
            trigger: 'none'
        };
        $uibTooltipProvider.options(options);
    }
});

angular.module("sn.on_call.now.iscroll", []).directive("iScroll", ["$rootScope", "$window", "$timeout", function($rootScope, $window, $timeout) {
    return {
        link: function(scope, elem, attrs) {
            var checkWhenEnabled, handler, scrollDistance, scrollEnabled, scrollElem;
            $window = angular.element($window);

            if (attrs.iScrollContainer)
                scrollElem = angular.element(attrs.iScrollContainer);

            scrollDistance = 0;
            if (attrs.iScrollDistance !== null) {
                scope.$watch(attrs.iScrollDistance, function(value) {
                    scrollDistance = parseInt(value, 10);
                    return scrollDistance;
                });
            }
            scrollEnabled = true;
            checkWhenEnabled = false;
            if (attrs.iScrollDisabled !== null) {
                scope.$watch(attrs.iScrollDisabled, function(value) {
                    scrollEnabled = !value;
                    if (scrollEnabled && checkWhenEnabled) {
                        checkWhenEnabled = false;
                        return handler();
                    }
                });
            }

            handler = function() {
                var elementBottom, remaining, shouldScroll, windowBottom;
                if (scrollElem)
                    windowBottom = scrollElem.height() + scrollElem.scrollTop();
                else
                    windowBottom = $window.height() + $window.scrollTop();
                elementBottom = elem.offset().top + elem.height();
                remaining = elementBottom - windowBottom;
                shouldScroll = remaining <= $window.height() * scrollDistance;
                if (shouldScroll && scrollEnabled) {
                    if ($rootScope.$$phase)
                        return scope.$eval(attrs.iScroll);
                    else
                        return scope.$apply(attrs.iScroll);
                } else if (shouldScroll) {
                    checkWhenEnabled = true;
                    return checkWhenEnabled;
                }
            };

            // Attach handler to scroll event
            if (scrollElem)
                scrollElem.on("scroll", handler);
            else
                $window.on("scroll", handler);

            scope.$on("$destroy", function() {
                if (scrollElem)
                    return scrollElem.off("scroll", handler);
                return $window.off("scroll", handler);
            });

            return $timeout(function() {
                if (attrs.iScrollImmediateCheck === "true")
                    if (scope.$eval(attrs.iScrollImmediateCheck))
                        return handler();
                    else
                        return handler();
            }, 0);
        }
    };
}]);

angular.module("sn.on_call.now.showTooltipOnTextOverflow", []).directive("showTooltipOnTextOverflow", [function() {
    return {
        restrict: "A",
        link: function(scope, element, attrs) {
            var elem = element[0];
            scope.$watch(
                function() {
                    return elem.scrollWidth;
                },
                function() {
                    var firstElem = element[0];
                    if (firstElem.offsetWidth < firstElem.scrollWidth)
                        attrs.tooltipEnable = "true";
                }
            );
        }
    };
}]);

angular.module("sn.on_call.now.filters", ["sn.common", "sn.app_common"]);

angular.module("sn.on_call.now.filters").filter("memberfilter", [function() {
    return function(members, textMemberSearch) {
        if (!textMemberSearch)
            return members;

        var filteredMembers = [];
        members.forEach(function(member) {
            if (member.user && member.user.name && member.user.name.toLowerCase().indexOf(textMemberSearch.toLowerCase()) !== -1)
                filteredMembers.push(member);
        });
        return filteredMembers;
    };
}]);

angular.module("sn.on_call.now.filters").filter("groupfilter", ["GroupFilterService", function(GroupFilterService) {
    return function(groups, filterBy, textSearch, textSearchType, pinnedGroups) {
        return GroupFilterService.getFilteredGroups(groups, filterBy, textSearch, textSearchType, pinnedGroups);
    };
}]);

angular.module("sn.on_call.now.groups").service("GroupFilterService", ["$window", "PinnedService", "TextSearchService", "ManagedBelongService", function($window, PinnedService, TextSearchService, ManagedBelongService) {
    var groupFilterService = this;

    var _allGroups = [];

    function getAllGroups(groups) {
        if (_allGroups.length !== groups.length)
            _allGroups = groups.slice();
        return _allGroups;
    }

    groupFilterService.getFilteredGroups = function(groups, filterBy, textSearch, textSearchType, pinnedGroups) {
        var filteredGroups = [];

        if (filterBy === "all")
            filteredGroups = getAllGroups(groups);
        else if (filterBy === "manage_belong")
            filteredGroups = ManagedBelongService.getFilteredGroups(groups, $window.NOW.user_id || "");
        else if (filterBy === "pinned")
            filteredGroups = PinnedService.getFilteredGroups(groups, pinnedGroups);
        else
            filteredGroups = [];

        return TextSearchService.getFilteredGroups(filteredGroups, textSearch, textSearchType);
    };
}]);

angular.module("sn.on_call.now.groups").service("ManagedBelongService", [function() {
    var managedBelongService = this;

    var _manageBelong = [];
    var _groups = [];

    managedBelongService.getFilteredGroups = function(groups, activeUserID) {
        if (!groups || groups.length < 1 || !activeUserID) {
            _manageBelong = [];
            _groups = [];
        }
        // Only re-filter if there are more or less groups
        else if (_groups.length !== groups.length) {
            _groups = groups.concat(_groups);
            var manageGroups = [];
            var belongToGroups = [];
            groups.filter(function(group) {
                // Manage Group
                if (group.manager && group.manager.indexOf(activeUserID) !== -1)
                    manageGroups.push(group);
                else {
                    // Belong to Group
                    if (group.users) {
                        var users = group.users.filter(function(user) {
                            if (user.indexOf(activeUserID) !== -1)
                                return true;
                        });
                        if (users.length > 0)
                            belongToGroups.push(group);
                    }
                }
            });
            // First managed then belonging to
            _manageBelong = manageGroups.concat(belongToGroups);
        }
        return _manageBelong;
    };

}]);

angular.module("sn.on_call.now.groups").service("PinnedService", [function() {
    var pinnedService = this;
    var _groups = [];
    var _pinnedGroupSysIds = "";
    var _filteredGroups = [];

    // Verify that pinned groups have not changed (includeing order in which they are pinned)
    function _pinnedGroupsChanged(pinnedGroups) {
        var pinnedGroupSysIds = pinnedGroups.map(function(group) {
            return group.sys_id;
        }).join();
        if (pinnedGroupSysIds !== _pinnedGroupSysIds) {
            _pinnedGroupSysIds = pinnedGroupSysIds;
            return true;
        }
        return false;
    }

    pinnedService.getFilteredGroups = function(groups, pinnedGroups) {

        if (!groups || groups.length < 1 || !pinnedGroups || pinnedGroups.length < 1) {
            _filteredGroups = [];
            _groups = [];
            _pinnedGroupSysIds = [];
        } else if (_groups.length !== groups.length || _pinnedGroupsChanged(pinnedGroups)) {
            _filteredGroups = groups.filter(function(group) {
                return pinnedGroups.indexOf(group.sys_id) !== -1;
            });
            _groups = groups.slice();
            _pinnedGroupSysIds = pinnedGroups.slice();
        }

        return _filteredGroups;
    };

}]);

angular.module("sn.on_call.now.groups").service("TextSearchService", ["$sanitize", function($sanitize) {
    var textSearchService = this;

    textSearchService.getFilteredGroups = function(filteredGroups, textSearch, textSearchType) {
        if (!textSearch)
            return filteredGroups;

        var textFilteredGroups = [];
        filteredGroups.forEach(function(group) {
            if (textSearchType === 'group_schedule') {
                if (group.name.toLowerCase().indexOf(textSearch.toLowerCase()) !== -1)
                    textFilteredGroups.push(group);
                else if (group.rota && group.rota.name.toLowerCase().indexOf(textSearch.toLowerCase()) !== -1)
                    textFilteredGroups.push(group);
            } else if (textSearchType === 'user')
                if (group.rota && group.rota.rosters) {
                    var i;
                    for (i = 0; i < group.rota.rosters.length; i++) {
                        var roster = group.rota.rosters[i];
                        if (roster.member &&
                            roster.member.user &&
                            roster.member.user.name.toLowerCase().indexOf(textSearch.toLowerCase()) !== -1) {
                            textFilteredGroups.push(group);
                            break;
                        }
                    }
                }
        });
        return textFilteredGroups;
    };
}]);

angular.module("sn.on_call.now.groups").service("HighlightService", ["$sanitize", "$sce", function($sanitize, $sce) {
    var highlightService = this;

    highlightService.highlight = function(text, highlightText, highlightClass) {
        if (!highlightText || !highlightClass)
            return text;
        var cleanHighlightText = highlightText;
        var cleanHighlightClass = $sanitize(highlightClass);
        var pattern = new RegExp(cleanHighlightText, "gi");
        return $sce.trustAsHtml(text.replace(pattern, '<span class="' + cleanHighlightClass + '">$&</span>'));
    };
}]);

angular.module("sn.on_call.now.groups").service("GroupService", ["$window", "$http", "$q", "filterFilter", "modelUtil", "ON_CALL", function($window, $http, $q, filterFilter, modelUtil, ON_CALL) {

    var groupService = this;
    var _groupsBySysId = {};
    var _hasMoreGroups = {
        'pinned': true,
        'manage_belong': true,
        'all': true,
        'search': true
    };
    // This limit is driven by system property: com.snc.on_call_rotation.landing_page.group_limit
    groupService.groupHardLimit = parseInt($window.NOW.on_call_groups.group_limit || "20");

    // group limit is the batch of group data return from each request
    groupService.groupLimit = groupService.groupHardLimit;

    function buildDataModel(result, filter) {
        var groups = [];
        var overlappingRotasCount = 0;

        if (!result || !result.onCallData)
            return groups;

        result.onCallData.forEach(function(onCallElem) {
            if (onCallElem.group && !result.groups[onCallElem.group].rota)
                result.groups[onCallElem.group].rota = result.rotas[onCallElem.rota];
            else if (onCallElem.group && result.groups[onCallElem.group].rota && !result.groups[onCallElem.group + "_" + onCallElem.rota] && result.groups[onCallElem.group].rota && result.groups[onCallElem.group].rota.sys_id != onCallElem.rota) {
                var cloneGroupData = angular.copy(result.groups[onCallElem.group]);
                cloneGroupData.rota = result.rotas[onCallElem.rota];
                result.groups[onCallElem.group + "_" + onCallElem.rota] = cloneGroupData;
                overlappingRotasCount++;
            }

            if (onCallElem.rota && !result.rotas[onCallElem.rota].rosters) {
                result.rotas[onCallElem.rota].rosters = [];
                result.rotas[onCallElem.rota].rosters.push(result.rosters[onCallElem.roster]);
            } else if ((onCallElem.rota && onCallElem.roster) && result.rotas[onCallElem.rota].rosters.indexOf(result.rosters[onCallElem.roster]) === -1)
                result.rotas[onCallElem.rota].rosters.push(result.rosters[onCallElem.roster]);

            if (onCallElem.roster && !result.rosters[onCallElem.roster].member) {
                result.rosters[onCallElem.roster].member = result.members[onCallElem.memberId] || {};
                if (onCallElem.userId && result.users[onCallElem.userId]) {
                    result.rosters[onCallElem.roster].member.user = result.users[onCallElem.userId];
                    result.rosters[onCallElem.roster].member.user.displayName = result.rosters[onCallElem.roster].member.user.name;
                }
            }
        });

        Object.keys(result.groups).forEach(function(outerKey) {
            var group = result.groups[outerKey];
            group.id = outerKey;
            group.filter = filter;
            groups.push(group);
            _groupsBySysId[outerKey] = group;
        });

        groups.sort(function(a, b) {
            if (a.name < b.name)
                return -1;
            if (a.name > b.name)
                return 1;
            return 0;
        });

        // If groups length matches limit we will always make one more request
        _hasMoreGroups[filter] = groups.length === (groupService.groupLimit + overlappingRotasCount);

        return groups;
    }

    groupService.hasMoreGroups = function(filter) {
        return _hasMoreGroups[filter];
    };

    groupService.resetSearch = function() {
        _hasMoreGroups.search = true;
    };

    groupService.setGroupLimit = function(groupLimit) {
        groupService.groupLimit = parseInt(groupLimit);
        if (!groupService.groupLimit || isNaN(groupService.groupLimit) || groupService.groupLimit > groupService.groupHardLimit)
            groupService.groupLimit = groupService.groupHardLimit;
    };

    groupService.getGroupBySysId = function(groupSysId) {
        if (!groupSysId)
            return {};
        return _groupsBySysId[groupSysId];
    };

    function escapeHtml(html) {
        var text = document.createTextNode(html);
        var p = document.createElement('p');
        p.appendChild(text);
        return p.innerHTML;
    }

    groupService.getGroups = function(offset, groupLimit, filter, isSearch, textSearch, textSearchType, foundGroupsSysIds) {
        groupService.setGroupLimit(groupLimit);
        var deferred = $q.defer();
        var url;
        if (isSearch) {
            url = ON_CALL.SERVICE.QUERY_SEARCH + "?sysparm_ck=" + $window.g_ck + "&offset=" + offset + "&group_limit=" + groupService.groupLimit + "&filter=" + filter;
            var reqBody = {};
            reqBody.text = escapeHtml(textSearch);
            reqBody.textSearchType = textSearchType;
            reqBody.ignoreGroupSysIds = foundGroupsSysIds;

            $http({
                method: 'POST',
                url: url,
                data: reqBody,
            }).then(function(response) {
                deferred.resolve(buildDataModel(response.data.result, filter));
            }, function(response) {
                modelUtil.failNicely(response);
                deferred.reject(response);
            });
        } else {
            url = ON_CALL.SERVICE.QUERY + "?sysparm_ck=" + $window.g_ck + "&offset=" + offset + "&group_limit=" + groupService.groupLimit + "&filter=" + filter;
            $http.get(url).then(function(response) {
                deferred.resolve(buildDataModel(response.data.result, filter));
            }, function(response) {
                modelUtil.failNicely(response);
                deferred.reject(response);
            });
        }
        return deferred.promise;
    };
}]);

angular.module('sn.on_call.now.groups').constant('KeyCode', {
    ENTER: 13,
    SPACE: 32,
    TAB: 9,
    ESCAPE: 27,
    RIGHT_ARROW: 39,
    LEFT_ARROW: 37,
    UP_ARROW: 38,
    DOWN_ARROW: 40
});

angular.module("sn.on_call.now.groups").service("slackService", function($http, $q, i18n, snNotification, $window) {
    var TYPE = {
        DANGER: "danger"
    };
    var MESSAGES = {
        TECH_ERROR: i18n.getMessage("Cannot connect to Slack due to technical error, please contact administrator."),
        SLACK_ERROR: i18n.getMessage("Slack account is not present for this user email id, please contact administrator.")
    };
    var CONSTANTS = {
        TIME: 5000
    };

    return {

        getSlackInfo: function(sys_id) {
            var deferred = $q.defer();
            var url = "/api/now/on_call_rota/slack/getUserInfo/" + sys_id;
            $http.get(url).then(function(response) {
                deferred.resolve(response.data.result);
            }, function(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        },

        openSlackApp: function(sys_id) {
            this.getSlackInfo(sys_id).then(function(slackDetails) {
                if (slackDetails && slackDetails.status === "Success")
                    $window.location.href = "slack://user?team=" + slackDetails.team_id + "&id=" + slackDetails.user_id;
                else if (slackDetails && slackDetails.status === "Error")
                    snNotification.show(TYPE.DANGER, MESSAGES.SLACK_ERROR, CONSTANTS.TIME);
                else
                    snNotification.show(TYPE.DANGER, MESSAGES.TECH_ERROR, CONSTANTS.TIME);
            }, function() {
                snNotification.show(TYPE.DANGER, MESSAGES.TECH_ERROR, CONSTANTS.TIME);
            });
        }
    };
});

angular.module("sn.on_call.now.groups").controller("ModalRostersCtrl", function(i18n, $window, KeyCode) {
    var modalRostersCtrl = this;
    var modalId = "on_call_who_and_escalation";

    function getUrl(group) {
        var url = "/$on_call_who_and_escalation.do?sysparm_group_id=";
        var params = "";
        params += group.sys_id;
        params += "&sysparm_rota_id=" + group.rota.sys_id;
        params += "&sysparm_stack=no";
        if ($window.NOW.USER_PREF.IS_DARK_THEME_ENABLED) {
            params += "&sysparm_use_polaris=false";
        }

        return url + params;
    }

    function dismissModalDialog() {
        setTimeout(function() {
            var modal = GlideModal.prototype.get(modalId);
            modal.destroy();
        }, 0);
    }

    function isModalOutOfViewport(el) {
        if (el && (el.width() + el.offset().left) > this.window.innerWidth)
            return true;
        return false;
    }

    modalRostersCtrl.open = function($event, group) {
        $event.stopPropagation();
        var modal = new GlideModal(modalId);
        modal.template = glideCustomModalTemplate;
        modal.renderIframe(getUrl(group), function() {
            var iframeElement = this.parent.jQuery('iframe')[0];
            if (iframeElement)
                iframeElement.title = i18n.getMessage('Roster and escalation details');
            var modalContainer = this.parent.jQuery('#on_call_who_and_escalation');
            var modalDialogEl = modalContainer.find(".modal-dialog");
            if (isModalOutOfViewport(modalDialogEl)) {
                modalContainer.css({
                    "overflow-x": "scroll"
                });
            }
        });
        $window.NOW.CustomEvent.observe("DismissOCGlideModal", dismissModalDialog);
    };

    modalRostersCtrl.handleKeyAction = function($event, group, groupOnCallCtrl) {
        if ($event.which == KeyCode.ENTER || $event.which == KeyCode.SPACE) {
            groupOnCallCtrl.closeMemberDialogs('');
            modalRostersCtrl.open($event, group);
            $event.preventDefault();
        }
    };
});

angular.module("sn.on_call.now.groups").controller("GroupOnCallController", ["$scope", "GroupService", "GroupFilterService", "ManagedBelongService", "PinnedService", "TextSearchService", "$window", "$location", "userPreferences", "getTemplateUrl", "i18n", "$timeout", "snConnectService", "HighlightService", "$injector", "$sce", "$interval", "KeyCode", "slackService", "$sanitize", function($scope, GroupService, GroupFilterService, ManagedBelongService, PinnedService, TextSearchService, $window, $location, userPreferences, getTemplateUrl, i18n, $timeout, snConnectService, HighlightService, $injector, $sce, $interval, KeyCode, slackService, $sanitize) {

    var groupOnCallCtrl = this;
    var userPreferenceGroups = "com.snc.on_call_rotation.landing_page.pinned_groups";
    var userPreferenceGroupFilter = "com.snc.on_call_rotation.landing_page.group_filter";

    groupOnCallCtrl.isRTL = angular.element("html").hasClass("rtl");
    groupOnCallCtrl.showOnCallRotas = false;
    groupOnCallCtrl.groups = [];
    groupOnCallCtrl.quantity = 2;
    groupOnCallCtrl.textSearchReadOnly = true;
    groupOnCallCtrl.textSearch = "";
    groupOnCallCtrl.textSearchType = "group_schedule";
    groupOnCallCtrl.groupFilter = $window.NOW.on_call_groups.group_filter || "pinned";
    groupOnCallCtrl.groupLimit = GroupService.groupHardLimit;
    groupOnCallCtrl.maxGroups = parseInt($window.NOW.on_call_groups.max_groups || "300");
    groupOnCallCtrl.notificationTimeout = parseInt($window.NOW.on_call_groups.notification_timeout || "4000");
    groupOnCallCtrl.isChatEnabled = ($window.NOW.on_call_groups.chat_enabled === "true" && $window.NOW.isPolarisEnabled !== 'true');
    groupOnCallCtrl.isSlackActive = ($window.NOW.is_Slack_Spoke_Installed === "true");
    groupOnCallCtrl.isTeamsActive = ($window.NOW.is_MS_Teams_Installed === "true");
    groupOnCallCtrl.showWizardBtn = ($window.NOW.on_call_groups.show_wizard_btn === "true");
    groupOnCallCtrl.isAccessibilityEnabled = ($window.NOW.on_call_groups.isAccessibilityEnabled === "true");
    groupOnCallCtrl.showPinnedNotification = ($window.NOW.on_call_groups.pinned_notification === "true");
    groupOnCallCtrl.isWizardBtnPrimary = false;
    groupOnCallCtrl.groupOffset = 0;
    groupOnCallCtrl.pinnedGroups = $window.NOW.on_call_groups.pinned_groups ? $window.NOW.on_call_groups.pinned_groups.split(",") : [];
    groupOnCallCtrl.userTimeFormat = $window.NOW.user_time_format;

    groupOnCallCtrl.tabs = {
        'pinned': {
            groups: [],
            groupOffset: 0
        },
        'manage_belong': {
            groups: [],
            groupOffset: 0
        },
        'all': {
            groups: [],
            groupOffset: 0
        },
        'search': {
            groups: [],
            groupOffset: 0
        }
    };


    groupOnCallCtrl.isLoading = false;
    groupOnCallCtrl.limitReached = false;
    groupOnCallCtrl.noMoreGroups = false;
    groupOnCallCtrl.showGroupPinnedMsg = false;
    groupOnCallCtrl.showPinnedSplashMsg = false;
    groupOnCallCtrl.showManageBelongSplashMsg = false;
    groupOnCallCtrl.showAllSplashMsg = false;

    groupOnCallCtrl.membersPopover = {};

    // I18N messages section
    groupOnCallCtrl.form = {};
    groupOnCallCtrl.form.title = i18n.getMessage("On-Call Schedules");
    groupOnCallCtrl.form.loading = i18n.getMessage("Loading...");
    groupOnCallCtrl.form.new = i18n.getMessage("New");
    groupOnCallCtrl.form.to = i18n.getMessage("{0} to {1}");
    groupOnCallCtrl.form.allOnCallSchedules = i18n.getMessage("All On-Call Schedules");
    groupOnCallCtrl.form.myOnCallSchedules = i18n.getMessage("My On-Call Schedules");
    groupOnCallCtrl.form.pinnedOnCallSchedules = i18n.getMessage("Your Pinned On-Call Schedules");
    groupOnCallCtrl.form.pinnedOnCallSchedulesTitle = i18n.getMessage("Pinned On-Call Schedules");
    groupOnCallCtrl.form.filterTitle = i18n.getMessage("Search On-Call Schedules");
    groupOnCallCtrl.form.filterOptions = [{
        value: "group_schedule",
        label: i18n.getMessage("Group / Schedule")
    }, {
        value: "user",
        label: i18n.getMessage("User")
    }];
    groupOnCallCtrl.form.nobodyOnCall = i18n.getMessage("Nobody is On-Call now");
    groupOnCallCtrl.form.somebodyOnCall = i18n.getMessage("On-Call Members will be available today from:");
    groupOnCallCtrl.form.pinOnCallSchedule = i18n.getMessage("Pin On-Call Schedule");
    groupOnCallCtrl.form.unpinOnCallSchedule = i18n.getMessage("Unpin On-Call Schedule");
    groupOnCallCtrl.form.pin = i18n.getMessage("Pin");
    groupOnCallCtrl.form.icon = i18n.getMessage("icon");
    groupOnCallCtrl.form.onCallSchedulePinnedMsg = "";
    groupOnCallCtrl.form.addTo = i18n.getMessage("added to");
    groupOnCallCtrl.form.showEscalationPath = i18n.getMessage("Show escalation details");
    groupOnCallCtrl.form.showRosterEscalationPath = i18n.getMessage("Roster and escalation details");
    groupOnCallCtrl.form.close = i18n.getMessage("Close");
    groupOnCallCtrl.form.limitReachedMsg = i18n.getMessage("You have reached the limit of visible On-Call Schedules in this view.");
    groupOnCallCtrl.form.sendDirectMsg = i18n.getMessage("Send a direct message");
    groupOnCallCtrl.form.notAvailable = i18n.getMessage("Not Available");
    groupOnCallCtrl.form.manager = i18n.getMessage("Manager");
    groupOnCallCtrl.form.noResultsFound = i18n.getMessage("No results found");
    groupOnCallCtrl.form.userNameLabel = i18n.getMessage("User name");
    groupOnCallCtrl.form.userTitleLabel = i18n.getMessage("User title");
    groupOnCallCtrl.form.contactNumberLabel = i18n.getMessage("User contact number");
    groupOnCallCtrl.form.emailLabel = i18n.getMessage("User email");
    groupOnCallCtrl.form.groupLabel = i18n.getMessage("Group name");
    groupOnCallCtrl.form.rotaLabel = i18n.getMessage("Shift name");
    groupOnCallCtrl.form.pinnedDesc = i18n.getMessage("To pin an On-Call Schedule to this tab, point to the card on the All On-Call Schedules tab and click the Pin icon.");
    groupOnCallCtrl.form.manageBelongDesc = i18n.getMessage("On this tab, you access schedules that you manage or that you are a member of.");
    i18n.getMessage('"{0}", there are no active On-Call Schedules.', function(msg) {
        groupOnCallCtrl.form.allOnCallSchedulesDesc = msg.withValues([groupOnCallCtrl.form.allOnCallSchedules]);
    });

    function _splashScreenVisibility() {
        groupOnCallCtrl.isWizardBtnPrimary = groupOnCallCtrl.pinnedGroups.length === 0;
        groupOnCallCtrl.showPinnedSplashMsg = (groupOnCallCtrl.groupFilter === "pinned" && PinnedService.getFilteredGroups(groupOnCallCtrl.groups, groupOnCallCtrl.pinnedGroups).length === 0);
        groupOnCallCtrl.showManageBelongSplashMsg = (groupOnCallCtrl.groupFilter === "manage_belong" && ManagedBelongService.getFilteredGroups(groupOnCallCtrl.groups, $window.NOW.user_id).length === 0);
        groupOnCallCtrl.showAllSplashMsg = (groupOnCallCtrl.groupFilter === "all" && groupOnCallCtrl.groups.length === 0);
        groupOnCallCtrl.textSearchReadOnly = groupOnCallCtrl.showPinnedSplashMsg || groupOnCallCtrl.showManageBelongSplashMsg || groupOnCallCtrl.showAllSplashMsg;
        if (groupOnCallCtrl.textSearchReadOnly)
            groupOnCallCtrl.textSearch = "";
        groupOnCallCtrl.showOnCallRotas = (groupOnCallCtrl.groups.length > 0 && !groupOnCallCtrl.showPinnedSplashMsg && !groupOnCallCtrl.showManageBelongSplashMsg && !groupOnCallCtrl.showAllSplashMsg);

        // Strip out extraneous tabindex
        $timeout(function() {
            angular.element(".sub-avatar").each(function() {
                angular.element(this).removeAttr("tabindex");
            });
        }, 0);
    }

    function _getGroupLimit() {
        var groupLimit = GroupService.groupHardLimit;
        return groupLimit;
    }

    function _groupLimitReached() {
        var groupLimitReached = groupOnCallCtrl.groups.length + groupOnCallCtrl.groupLimit > groupOnCallCtrl.maxGroups;
        groupOnCallCtrl.limitReached = groupLimitReached;
        return groupLimitReached;
    }

    groupOnCallCtrl.showLimitReachedMessage = function() {
        return groupOnCallCtrl.limitReached && groupOnCallCtrl.textSearch == '' && groupOnCallCtrl.tabs[groupOnCallCtrl.groupFilter].groups && groupOnCallCtrl.tabs[groupOnCallCtrl.groupFilter].groups.length > 0;
    };

    function _uniqueConcat(arr1, arr2) {
        if (!arr1 || arr1.length === 0) {
            if (!arr2 || arr2.length === 0)
                return [];
            else
                return arr2;
        }

        if (!arr2 || arr2.length === 0)
            return arr1;

        var uniqueSet = {};
        var dupArr = arr1.concat(arr2);
        dupArr.forEach(function(elem) {
            if (elem.id)
                uniqueSet[elem.id] = elem;
        });

        if (typeof Object.values === "function")
            return Object.values(uniqueSet);

        var uniqueArr = [];
        Object.keys(uniqueSet).map(function(key) {
            uniqueArr.push(uniqueSet[key]);
        });
        return uniqueArr;
    }

    groupOnCallCtrl.filterBy = function(filter) {
        if (groupOnCallCtrl.groupFilter === filter)
            return;
        groupOnCallCtrl.isLoading = false;
        groupOnCallCtrl.textSearch = "";
        groupOnCallCtrl.groupFilter = filter;
        $window.NOW.on_call_groups.group_filter = groupOnCallCtrl.groupFilter;
        _splashScreenVisibility();
        userPreferences.setPreference(userPreferenceGroupFilter, groupOnCallCtrl.groupFilter);
        groupOnCallCtrl.getGroups();
    };

    groupOnCallCtrl.getGroupCountMessage = function(groups) {
        if (!groups)
            return;
        var filteredGroups = GroupFilterService.getFilteredGroups(groups, groupOnCallCtrl.groupFilter, groupOnCallCtrl.textSearch, groupOnCallCtrl.textSearchType, groupOnCallCtrl.pinnedGroups);
        if (!filteredGroups || filteredGroups.length == 0) {
            return i18n.getMessage('No groups found');
        }
        return i18n.format(i18n.getMessage('{0} groups found'), [filteredGroups.length]);
    };

    groupOnCallCtrl.handleKeyAction = function(filter, event) {
        if (event.which == KeyCode.ENTER || event.which == KeyCode.SPACE) {
            groupOnCallCtrl.filterBy(filter);
            event.preventDefault();
        } else if (event.which === KeyCode.RIGHT_ARROW) {
            var next = getNextSibling(event.target);
            if (next)
                $timeout(function() {
                    next.click();
                    next.focus();
                });
            event.preventDefault();
        } else if (event.which === KeyCode.LEFT_ARROW) {
            var previous = getPreviousSibling(event.target);
            if (previous)
                $timeout(function() {
                    previous.click();
                    previous.focus();
                });
            event.preventDefault();
        }
    };

    function getNextSibling(element) {
        var next = angular.element(element).next();
        if (next.length == 0)
            return null;
        if (next.hasClass('disabled'))
            return getNextSibling(next);
        return next;
    }

    function getPreviousSibling(element) {
        var previous = angular.element(element).prev();
        if (previous.length == 0)
            return null;
        if (previous.hasClass('disabled'))
            return getPreviousSibling(previous);
        return previous;
    }

    function escapeHTML(text) {
        if (!text) return '';
        text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return text;
    }

    function handleSpecialCharacters(search) {
        var pattern = /[!@#$%^&*()+=\-[\]\\';,./{}|":?~_]/g;
        return search.replace(pattern, '\\$&');
    }

    groupOnCallCtrl.highlight = function(text, search, stopHighlightCondition) {
        text = escapeHTML(text);
        search = handleSpecialCharacters(search);
        search = escapeHTML(search)
        if (stopHighlightCondition)
            return text;
        return HighlightService.highlight(text, search, "oc-search-highlight");
    };

    groupOnCallCtrl.foundGroups = function() {
        var filteredGroups = GroupFilterService.getFilteredGroups(groupOnCallCtrl.groups, groupOnCallCtrl.groupFilter, groupOnCallCtrl.textSearch, groupOnCallCtrl.textSearchType, groupOnCallCtrl.pinnedGroups);
        return (filteredGroups && filteredGroups.length > 0);
    };

    groupOnCallCtrl.redirectFromGroupsCard = function(groupId) {
        var userId = $window.NOW.user_id;
        var isManager = groupOnCallCtrl.groups.some(function(item) {
            return item.sys_id == groupId && item.isCurrentUserRotaMgr;
        });
        if (isManager) {
            //for manager
            $window.location.href = "$oc_workbench.do?sysparm_redirect=" + encodeURIComponent("$oc_groups.do") + "&sysparm_group_id=" + groupId;
            return;
        }
        var isMember = groupOnCallCtrl.groups.some(function(item) {
            return item.sys_id == groupId && item.isCurrentUserGrpMember;
        });
        if (isMember) {
            //for user
            $window.location.href = "$oc_workbench.do?sysparm_redirect=" + encodeURIComponent("$oc_groups.do") + "&sysparm_group_id=" + groupId;
            return;
        }
        groupOnCallCtrl.redirectCalendar(groupId);
    };

    groupOnCallCtrl.redirectCalendar = function(groupId) {
        $window.location.href = "on_call_rotation_calendar_launcher.do?sysparm_redirect=" + encodeURIComponent("$oc_groups.do") + "&sysparm_group_id=" + groupId + "&sysparm_ck=" + $window.g_ck;
    };

    groupOnCallCtrl.redirectWizard = function() {
        $window.location.href = "expert_shell.do?sysparm_sys_id=0eace47cbf1211003f07e2c1ac07396c&sysparm_initial=true";
    };

    groupOnCallCtrl.showRosters = function($event) {
        $event.stopPropagation();
    };

    groupOnCallCtrl.isPinned = function(groupId) {
        return groupOnCallCtrl.pinnedGroups.indexOf(groupId) !== -1;
    };

    groupOnCallCtrl.getActionCountAriaMessage = function(actionsCount) {
        var totalPendingAction = actionsCount.gaps + actionsCount.oddities + actionsCount.timeOffRequests;
        return i18n.format(i18n.getMessage('{0} Pending actions, {1} gaps identified, {2} conflicts identified, {3} time off requests'), [totalPendingAction, actionsCount.gaps, actionsCount.oddities, actionsCount.timeOffRequests]);
    };

    groupOnCallCtrl.togglePinned = function($event, group) {
        $event.stopPropagation();

        if (!group || !group.id)
            return;

        var index = groupOnCallCtrl.pinnedGroups.indexOf(group.sys_id);
        if (index > -1) {
            while (index > -1) {
                groupOnCallCtrl.pinnedGroups.splice(index, 1);
                index = groupOnCallCtrl.pinnedGroups.indexOf(group.sys_id);
            }
        } else {
            groupOnCallCtrl.pinnedGroups.push(group.sys_id);
            groupOnCallCtrl.form.onCallSchedulePinnedMsg = '"' + group.name + '" ' + groupOnCallCtrl.form.addTo + ' "' + groupOnCallCtrl.form.pinnedOnCallSchedules + '"';
            if (groupOnCallCtrl.showPinnedNotification) {
                groupOnCallCtrl.showGroupPinnedMsg = true;
                $timeout(function() {
                    groupOnCallCtrl.showGroupPinnedMsg = false;
                }, groupOnCallCtrl.notificationTimeout);
            }
        }

        groupOnCallCtrl.pinnedGroups.sort(function(a, b) {
            var groupA = GroupService.getGroupBySysId(a);
            var groupB = GroupService.getGroupBySysId(b);
            if (groupA && !groupB)
                return -1;
            if (!groupA && groupB)
                return 1;
            if (!groupA && !groupB)
                return 0;

            var groupAName = groupA.name;
            var groupBName = groupB.name;
            if (groupAName < groupBName) return -1;
            if (groupAName > groupBName) return 1;
            return 0;
        }, this);

        $window.NOW.on_call_groups.pinned_groups = groupOnCallCtrl.pinnedGroups.join(",");
        userPreferences.setPreference(userPreferenceGroups, $window.NOW.on_call_groups.pinned_groups);
        groupOnCallCtrl.showPinnedSplashMsg = (groupOnCallCtrl.groupFilter === "pinned" && PinnedService.getFilteredGroups(groupOnCallCtrl.groups, groupOnCallCtrl.pinnedGroups).length === 0);
        if (groupOnCallCtrl.showPinnedSplashMsg)
            groupOnCallCtrl.showOnCallRotas = false;

        var $element = angular.element($event.target);
        var $parentElement = $element.parent();
        if ($element.hasClass('pinned'))
            $timeout(function() {
                $parentElement.find('.unpinned').focus();
            }, 100);
        else
            $timeout(function() {
                $parentElement.find('.pinned').focus();
            }, 100);
    };

    groupOnCallCtrl.getPopoverTemplate = function(member) {
        $scope.profile = member;
        var isAccessibilityEnabled = ($window.NOW.on_call_groups.isAccessibilityEnabled === "true");
        if (isAccessibilityEnabled)
            $scope.tabindex = 0;
        return getTemplateUrl("on_call_avatar.xml");
    };

    groupOnCallCtrl.closeMemberDialogs = function(memberSysId) {
        memberSysId = memberSysId + "";
        Object.keys(groupOnCallCtrl.membersPopover).forEach(function(memberKey) {
            if (!memberSysId || memberKey.indexOf(memberSysId) === -1)
                groupOnCallCtrl.membersPopover[memberKey].open = false;
        });
    };

    groupOnCallCtrl.togglePopover = function($event, roster) {
        $event.stopPropagation();
        var id = roster.member.id || (roster.id + " " + roster.member.user.id);
        if (groupOnCallCtrl.membersPopover[id])
            groupOnCallCtrl.membersPopover[id].open = !groupOnCallCtrl.membersPopover[id].open;

        if (groupOnCallCtrl.membersPopover[id].open) {
            var intervalPromise = $interval(function() {
                if (angular.element('.start-of-popover').length > 0) {
                    angular.element('.start-of-popover').focus();
                    $interval.cancel(intervalPromise);
                }
            }, 200);
            groupOnCallCtrl.openedPopoverElement = $event.target;

            var $profileIcon = angular.element($event.target);
            if ($profileIcon.length) {
                var offsetTop = $profileIcon.offset().top;
                var offsetBottom = offsetTop - (angular.element(window).height() - $profileIcon.height());
                if (offsetTop > 250) {
                    if (offsetBottom > -250 && offsetTop > 500)
                        groupOnCallCtrl.profilePlacement = 'right-bottom';
                    else
                        groupOnCallCtrl.profilePlacement = 'right';
                } else
                    groupOnCallCtrl.profilePlacement = 'right-top';
            }
        }
        // close all other dialogs
        groupOnCallCtrl.closeMemberDialogs(id);
    };

    $window.document.on('click', function(event) {
        var isAvatarClicked = angular.element(event.target).parents('.user-presence').length > 0;
        if (!isAvatarClicked) {
            $timeout(function() {
                // close all dialogs
                groupOnCallCtrl.closeMemberDialogs("");
            });
        }
    });

    groupOnCallCtrl.onProfilePopoverKeyDown = function(event, roster) {
        var id = roster.member.id || (roster.id + " " + roster.member.user.id);
        if (event.keyCode === KeyCode.ESCAPE) {
            groupOnCallCtrl.membersPopover[id].open = false;
            angular.element(groupOnCallCtrl.openedPopoverElement).focus();
        }
    };

    groupOnCallCtrl.startOfPopoverKeyDown = function(event) {
        if (event.shiftKey && event.keyCode === KeyCode.TAB) {
            angular.element('.end-of-popover').focus();
        }
    };
    groupOnCallCtrl.endOfPopoverKeyDown = function(event) {
        if (event.keyCode === KeyCode.TAB) {
            angular.element('.start-of-popover').focus();
        }
    };

    groupOnCallCtrl.openPopover = function(roster) {
        var id = roster.member.id || (roster.id + " " + roster.member.user.id);
        if (!groupOnCallCtrl.membersPopover[id])
            groupOnCallCtrl.membersPopover[id] = {
                "open": false
            };
        return groupOnCallCtrl.membersPopover[id].open;
    };

    groupOnCallCtrl.immediateCheck = function() {
        return groupOnCallCtrl.groupFilter === "all";
    };

    groupOnCallCtrl.getGroups = function() {
        groupOnCallCtrl.noMoreGroups = !GroupService.hasMoreGroups(groupOnCallCtrl.groupFilter);

        // Do not get more groups if loading, limit reached, no more groups, or filter is pinned and all pinned has been retrieved
        if (groupOnCallCtrl.isLoading || _groupLimitReached() || groupOnCallCtrl.noMoreGroups) {
            _splashScreenVisibility();
            return;
        }

        // Do not get more groups if limit is zero or negative number
        var groupLimit = _getGroupLimit();
        if (groupLimit < 1) {
            if (groupOnCallCtrl.initialLoad)
                _splashScreenVisibility();
            return;
        }

        if ((groupLimit <= groupOnCallCtrl.groups.length) && (!event || event.type != 'scroll')) {
            _splashScreenVisibility();
            return;
        }

        groupOnCallCtrl.isLoading = true;

        GroupService.getGroups(groupOnCallCtrl.tabs[groupOnCallCtrl.groupFilter].groupOffset, groupLimit, groupOnCallCtrl.groupFilter).then(function(groups) {
            groupOnCallCtrl.tabs[groupOnCallCtrl.groupFilter].groups = _uniqueConcat(groupOnCallCtrl.tabs[groupOnCallCtrl.groupFilter].groups, groups);
            groupOnCallCtrl.tabs[groupOnCallCtrl.groupFilter].groupOffset = groupOnCallCtrl.tabs[groupOnCallCtrl.groupFilter].groupOffset + groupLimit;

            var pinnedAndManage = _uniqueConcat(groupOnCallCtrl.tabs['pinned'].groups, groupOnCallCtrl.tabs['manage_belong'].groups);
            var searchedAndAll = _uniqueConcat(groupOnCallCtrl.tabs['search'].groups, groupOnCallCtrl.tabs['all'].groups);
            var allGroups = _uniqueConcat(pinnedAndManage, searchedAndAll);
            sortGroups(allGroups);
            groupOnCallCtrl.groups = allGroups;

            groupOnCallCtrl.initialLoad = false;
            _splashScreenVisibility();
            groupOnCallCtrl.isLoading = false;
        });

    };

    function sortGroups(groups) {
        groups.sort(function(groupA, groupB) {
            var groupAName = groupA.name.toLowerCase();
            var groupBName = groupB.name.toLowerCase();
            if (groupAName < groupBName)
                return -1;
            if (groupAName > groupBName)
                return 1;
            return 0;
        });
    }
    groupOnCallCtrl.init = function() {
        groupOnCallCtrl.initialLoad = true;
        groupOnCallCtrl.getGroups();
    };

    // This limit is driven by system property: com.snc.on_call_rotation.landing_page.debounce_wait
    var debounceWait = parseInt($window.NOW.on_call_groups.debounce_wait || "500");
    // Search for Groups that have not yet been retrieved
    var debounceTimeout;
    $scope.$on("textSearch", function() {
        if (debounceTimeout)
            $timeout.cancel(debounceTimeout);
        debounceTimeout = $timeout(function() {
            // each new search must flush offset
            groupOnCallCtrl.searchGroups(true);
        }, debounceWait);
    });

    groupOnCallCtrl.textSearchTypeChange = function() {
        groupOnCallCtrl.textSearch = '';
    };

    groupOnCallCtrl.searchGroups = function(isNewSearch) {
        if (!groupOnCallCtrl.textSearch || groupOnCallCtrl.textSearch.length < 3)
            return;

        groupOnCallCtrl.isLoading = true;

        if (isNewSearch) {
            GroupService.resetSearch();
            groupOnCallCtrl.tabs['search'].groupOffset = 0;
        }

        var groupLimit = _getGroupLimit();
        var alreadyFetchedGroupsThatMatchesSearch = _getGroupSysIds(groupOnCallCtrl.textSearch);

        GroupService.getGroups(groupOnCallCtrl.tabs['search'].groupOffset, groupLimit, 'search', true, groupOnCallCtrl.textSearch, groupOnCallCtrl.textSearchType, alreadyFetchedGroupsThatMatchesSearch).then(function(groups) {
            groupOnCallCtrl.tabs['search'].groups = _uniqueConcat(groupOnCallCtrl.tabs['search'].groups, groups);
            groupOnCallCtrl.tabs['search'].groupOffset = groupOnCallCtrl.tabs['search'].groupOffset + groupLimit;
            var pinnedAndManage = _uniqueConcat(groupOnCallCtrl.tabs['pinned'].groups, groupOnCallCtrl.tabs['manage_belong'].groups);
            var searchedAndAll = _uniqueConcat(groupOnCallCtrl.tabs['search'].groups, groupOnCallCtrl.tabs['all'].groups);
            var allGroups = _uniqueConcat(pinnedAndManage, searchedAndAll);
            sortGroups(allGroups);
            groupOnCallCtrl.groups = allGroups;
            _splashScreenVisibility();
            groupOnCallCtrl.isLoading = false;
        });

    };

    function _getGroupSysIds(textSearch) {
        var groupSysIds = [];
        if (!textSearch || !groupOnCallCtrl.groups || groupOnCallCtrl.groups.length < 1)
            return "";

        groupSysIds = groupOnCallCtrl.groups.filter(function(group) {
                return (group.name && group.name.toLowerCase().indexOf(textSearch.toLowerCase()) !== -1) ||
                    (group.rota && $sanitize(group.rota.name).toLowerCase().indexOf(textSearch.toLowerCase()) !== -1);
            })
            .map(function(group) {
                return group.sys_id;
            })
            .join(",");
        return groupSysIds;
    }

    // All $scope exposed API used by on_call_avatar.xml
    $scope.isChatEnabled = function() {
        // this was called too: showDirectMessagePromptFn()
        return groupOnCallCtrl.isChatEnabled;
    };

    $scope.getBackgroundStyle = function() {
        if ($scope.profile && $scope.profile.user && $scope.profile.user.avatar && $scope.profile.user.avatar !== "")
            return {
                "background-image": "url(" + $scope.profile.user.avatar + ")"
            };
        if ($scope.profile.user && $scope.profile.user.name)
            return ""; // one-time watch (see angular doc)
        return void(0);
    };

    $scope.openSlackApp = function(sys_id) {
        slackService.openSlackApp(sys_id);
    };

    $scope.openDirectMessageConversation = function(evt) {
        if (evt && evt.keyCode === 9)
            return;

        $timeout(function() {
            if ($scope.profile.user)
                snConnectService.openWithProfile($scope.profile.user);
        }, 0, false);

        angular.element(".popover").each(function() {
            angular.element(this).remove();
        });
    };

    groupOnCallCtrl.getMembers = function(rota) {
        if (rota.rosters.length == 0)
            return "";
        return i18n.format(i18n.getMessage("{0} members"), rota.rosters.length);
    };

    groupOnCallCtrl.pendingActionMsg = function(actionsCount) {
        var tooltipHtml = "";
        if (actionsCount) {
            tooltipHtml += i18n.getMessage("Pending Actions:");
            tooltipHtml += "<div>" + i18n.format(i18n.getMessage("Gaps identified = {0}"), actionsCount.gaps) + "</div>";
            tooltipHtml += "<div>" + i18n.format(i18n.getMessage("Conflicts identified = {0}"), actionsCount.oddities) + "</div>";
            tooltipHtml += "<div>" + i18n.format(i18n.getMessage("Time off requests = {0}"), actionsCount.timeOffRequests) + "</div>";
            return $sce.trustAsHtml(tooltipHtml);
        }
        return "";
    };

    $scope.form = groupOnCallCtrl.form;

    if ($injector.has('notifyCallService')) {
        var notifyCallService = $injector.get('notifyCallService');
        $scope.isNotifyCallAvailable = notifyCallService.isAvailable.bind(notifyCallService);
        $scope.callPerson = notifyCallService.call.bind(notifyCallService);
        $scope.isNotifyCallEnabled = notifyCallService.isOnline.bind(notifyCallService);
        var dereg = notifyCallService.registerCloseHandler(function() {
            var popupBtn = angular.element('.popover-content .oc-user-profile .call > button');
            if (popupBtn.length)
                popupBtn.focus();
            else if ($scope.profile && $scope.profile.user)
                angular.element('#' + $scope.profile.roster + '_' + $scope.profile.user.sys_id + ' .user-avatar .user-presence').focus();
        });
        $scope.$on('$destroy', function() {
            if (dereg)
                dereg();
        });
    }
}]);

angular.module("sn.on_call.now.groups").directive("snOncallHeader", function(getTemplateUrl) {
    "use strict";

    return {
        replace: true,
        restrict: "E",
        templateUrl: getTemplateUrl("on_call_header.xml"),
        link: function(scope) {
            scope.$watch("groupOnCallCtrl.textSearch", function(newValue, oldValue) {
                if (newValue === undefined)
                    return;
                if (newValue.length > 2)
                    scope.$emit("textSearch", newValue);
            });
        }
    };
});

angular.module("sn.on_call.now.groups").directive("snOncallPinnedNotification", function(getTemplateUrl) {
    "use strict";

    return {
        replace: true,
        restrict: "E",
        templateUrl: getTemplateUrl("on_call_pinned_notification.xml")
    };
});

angular.module("sn.on_call.now.groups").directive("snOncallGroupCard", function(getTemplateUrl) {
    "use strict";

    return {
        restrict: "E",
        templateUrl: getTemplateUrl("on_call_group_card.xml")
    };
});

angular.module("sn.on_call.now.groups").directive("snOncallEmptyCard", function(getTemplateUrl) {
    "use strict";

    return {
        restrict: "E",
        templateUrl: getTemplateUrl("on_call_empty_card.xml")
    };
});

angular.module("sn.on_call.now.groups").directive("snOncallSplashScreens", function(getTemplateUrl) {
    "use strict";

    return {
        replace: true,
        restrict: "E",
        templateUrl: getTemplateUrl("on_call_splash_screens.xml")
    };
});

angular.module("sn.on_call.now.groups").directive("snOncallPageDecoration", function(getTemplateUrl) {
    "use strict";

    return {
        replace: true,
        restrict: "E",
        templateUrl: getTemplateUrl("on_call_page_decoration.xml")
    };
});

angular.module("sn.on_call.now.groups").directive("snOncallUserProfile", function(getTemplateUrl, snCustomEvent, $window, avatarProfilePersister, $timeout, $http, i18n, $injector) {
    "use strict";

    return {
        replace: true,
        restrict: "E",
        templateUrl: getTemplateUrl("on_call_avatar.xml"),
        scope: {
            profile: "=",
            group: "=",
            showDirectMessagePrompt: "="
        },
        link: function(scope) {
            scope.showDirectMessagePromptFn = function() {
                if (scope.showDirectMessagePrompt) {
                    var activeUserID = $window.NOW.user_id || "";
                    return !(!scope.profile || activeUserID === scope.profile.user.sys_id || (scope.profile.user.document && activeUserID === scope.profile.user.document));
                } else
                    return false;
            };

        },
        controller: function($scope, snConnectService, $element) {
            var isAccessibilityEnabled = ($window.NOW.on_call_groups.isAccessibilityEnabled === "true");
            if (isAccessibilityEnabled)
                $scope.tabindex = 0;

            $scope.form = {};
            $scope.form.sendDirectMsg = i18n.getMessage("Send a direct message");
            $scope.form.notAvailable = i18n.getMessage("Not Available");
            $scope.form.manager = i18n.getMessage("Manager");

            $scope.isChatEnabled = function() {
                return ($window.NOW.on_call_groups.chat_enabled === "true" && $window.NOW.isPolarisEnabled !== 'true');
            };

            if ($scope.profile && $scope.profile.user.sys_id && avatarProfilePersister.getAvatar($scope.profile.user.sys_id)) {
                $scope.profile = avatarProfilePersister.getAvatar($scope.profile.user.sys_id);
                $scope.$emit("sn-user-profile.ready");
            } else {
                var url = "/api/now/live/profiles/sys_user." + $scope.profile.user.sys_id;
                $http.get(url).then(function(response) {
                    angular.merge($scope.profile, response.data.result);
                    avatarProfilePersister.setAvatar($scope.profile.user.sys_id, $scope.profile);
                    $scope.$emit("sn-user-profile.ready");
                });
            }

            $scope.getBackgroundStyle = function() {
                if ($scope.profile && $scope.profile.user && $scope.profile.user.avatar && $scope.profile.user.avatar !== "")
                    return {
                        "background-image": "url(" + $scope.profile.user.avatar + ")"
                    };
                if ($scope.profile.user && $scope.profile.user.name)
                    return ""; // one-time watch (see angular doc)
                return void(0);
            };

            $scope.openDirectMessageConversation = function(evt) {
                if (evt && evt.keyCode === 9)
                    return;

                $timeout(function() {
                    if ($scope.profile.user)
                        snConnectService.openWithProfile($scope.profile.user);
                }, 0, false);

                angular.element(".popover").each(function() {
                    angular.element(this).remove();
                });
            };

            if ($injector.has('notifyCallService')) {
                var notifyCallService = $injector.get('notifyCallService');
                $scope.isNotifyCallAvailable = notifyCallService.isAvailable.bind(notifyCallService);
                $scope.callPerson = notifyCallService.call.bind(notifyCallService);
                $scope.isNotifyCallEnabled = notifyCallService.isOnline.bind(notifyCallService);
                var dereg = notifyCallService.registerCloseHandler(function() {
                    $element.find('.oc-message-container.call button').focus();
                });
                $scope.$on('$destroy', function() {
                    if (dereg)
                        dereg();
                });
            }
        }
    };
});
