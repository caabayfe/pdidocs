angular.element(document).ready(function() {
    angular.module('sn.common.ui')
        .config(function($provide) {
            $provide.value('systemProperties', window.NOW.notificationProperties);
            $provide.value('modalPath', '${sysparm_modal_path}');
            $provide.value('shouldModalOpen', true);
            //$provide.value('concourseSettings', concourseSettings);
            //$provide.value('applicationID', '');
        });
    angular.module('sn.concourse_view_stack').config(function($provide) {
        $provide.value('systemProperties', window.NOW.notificationProperties);
    });
    angular.module('sn.common.ui').service('viewStackService', function(i18n, systemProperties, modalPath) {
        "use strict";
        var defaultViews = [{
                tab: 'notifications',
                name: 'notifications_category',
                template: 'notification_preference_category.xml',
                title: i18n.getMessage('Applications')
            },
            {
                tab: 'notifications',
                name: 'notifications_channel',
                template: 'notification_preference_channel.xml',
                title: i18n.getMessage('Channels')
            },
            {
                tab: 'notifications',
                name: 'notifications_form',
                template: 'notification_preference_form.xml',
                title: i18n.getMessage('Apply Conditions')
            }
        ];
        if (window.NOW.user.allRoles.indexOf('snc_external') == -1) {
            defaultViews.push({
                tab: 'notifications',
                name: 'notifications_general',
                template: systemProperties.notifications ? 'notification_preference_general.xml' : 'concourse_settings_notifications_connect.xml',
                replace: true,
                icon: 'notification-bell',
                title: i18n.getMessage('Notifications')
            });
        }
        return {
            /**
             * get a view and optionally extend it with some options, useful to overwrite title etc.
             *
             * @param key
             * @param options
             * @returns {*}
             */
            get: function get(key, options) {
                var defaultView = defaultViews.filter(function(item) {
                    return item.name == key;
                })[0];
                if (!defaultView) {
                    throw 'Invalid view key: ' + key;
                }
                return angular.extend({}, defaultView, options);
            },
            /**
             * Get all view objects with replace = true
             * @returns {Array|*}
             */
            getTopLevelViews: function getTopLevelViews() {
                return defaultViews
                    .filter(function(view) {
                        return view.replace;
                    })
                    .map(function(view) {
                        return angular.extend({}, view);
                    });
            }
        };
    });
    angular.module('sn.common.ui').controller('notificationController', function($scope, $timeout, glideUrlBuilder, getTemplateUrl, i18n, snCustomEvent, viewStackService, modalPath, shouldModalOpen) {
        "use strict";
        //$scope.settings = angular.extend({}, concourseSettings);
        $scope.animateViewStackHeaders = false;
        /**
         * kick off settings
         */
        activate();
        function updateAriaRecordMessage(event) {
            if (!event || !event.action)
                return;
            var ariaMsg = '';
            if (event.action === 'sysverb_insert')
                ariaMsg = i18n.getMessage('record inserted');
            else if (event.action === 'sysverb_update')
                ariaMsg = i18n.getMessage('record updated');
            else if (event.action === 'sysverb_delete')
                ariaMsg = i18n.getMessage('record deleted');
            clearAriaLiveRegion();
            // Setting value in DOM directly due to limitations with JAWS and aria-live elements set using Angular data binding.
            var ariaRecordMsgElem = angular.element('#aria_live_iframe_action');
            if (ariaRecordMsgElem.length) {
                var actionMsgSpan = angular.element("<span id='iframe_action_message'>" + ariaMsg + "</span>");
                ariaRecordMsgElem.append(actionMsgSpan);
            }
        }
        function clearAriaLiveRegion() {
            var ariaRecordMsgElem = angular.element('#iframe_action_message');
            if (ariaRecordMsgElem.length)
                ariaRecordMsgElem.remove();
        }
        snCustomEvent.on('iframe_form.sysverb_insert', updateAriaRecordMessage);
        snCustomEvent.on('iframe_form.sysverb_delete', updateAriaRecordMessage);
        snCustomEvent.on('iframe_form.sysverb_update', updateAriaRecordMessage);
        $scope.previousView = function previousView() {
            if ($scope.viewStack.length > 1) {
                return $scope.viewStack[$scope.viewStack.length - 2];
            }
        };
        $scope.currentView = function currentView() {
            return $scope.viewStack[$scope.viewStack.length - 1];
        };
        $scope.getViewTemplate = function getViewTemplate(view) {
            return getTemplateUrl(view.template);
        };
        $scope.openView = openView;
        $scope.back = function($event) {
            if ($event.type === 'keypress' && $event.keyCode !== 13 && $event.keyCode !== 32) {
                return;
            }
            if ($event.type === 'keypress' && ($event.keyCode === 13 || $event.keyCode === 32)) {
                // Prevents keypress from being repropagated as a mouse click
                $event.preventDefault();
                $event.stopPropagation();
            }
            back();
        };
        $scope.$on('concourse_settings.view.open', function(e, data) {
            _addViewObject(data);
        });
        $scope.$on('concourse_settings.view.back', function() {
            back(true);
        });
        $scope.$on('concourse_settings.view.render_complete', function() {
            initialFocus();
        });
        $scope.openViewOnKeypress = function($event) {
            var firstView = this.views[0].name;
            var lastView = this.views[this.views.length - 1].name;
            if ($event.keyCode === 40) { // Down arrow key
                if (this.$last) {
                    return openViewWithFocus(firstView);
                } else if (this.$$nextSibling) {
                    return openViewWithFocus(this.$$nextSibling.view.name);
                }
            } else if ($event.keyCode === 38) { // Up arrow key
                if (this.$first) {
                    return openViewWithFocus(lastView);
                } else if (this.$$prevSibling) {
                    return openViewWithFocus(this.$$prevSibling.view.name);
                }
            }
            return;
        };
        function openViewWithFocus(view) {
            angular.element('[data-tab-name=' + view + ']').focus();
            openView(view);
        }
        function initialFocus() {
            var currentView = $scope.currentView();
            if (!currentView)
                return;
            // Prevents setting focus back to initFocus when infinite scroll renders more results.
            if (currentView.initialFocusSet)
                return;
            // initFocus is a jqLite query selector. If multiple elements are returned, the first element will be focused. 
            if (currentView.initFocus) {
                currentView.initialFocusSet = true;
                $timeout(function() {
                    var elem = angular.element(currentView.initFocus);
                    if (elem.length)
                        elem[0].focus();
                });
            }
        }
        function back() {
            if ($scope.viewStack.length === 1) {
                return;
            }
            var view = $scope.viewStack.pop();
            $scope.$broadcast('concourse_settings.view.closed', view);
            if (view.previouslyFocusedElement) {
                $timeout(function() {
                    view.previouslyFocusedElement.focus();
                });
            } else if ($scope.viewStack.length === 1) {
                angular.element('[data-tab-name=' + $scope.viewStack[0].name + ']').focus();
            }
        }
        function activate() {
            $scope.viewStack = [viewStackService.get("notifications_general")];
            $scope.views = viewStackService.getTopLevelViews();
            if (!modalPath)
                return;
            // break apart our modal path, load each one as a view
            var parts = getModalPathParts();
            parts.forEach(function(part) {
                openView(part.view, part.options);
            });
            if (shouldModalOpen)
                toggleModal(true);
        }
        /**
         * given a key and some options, get a view object
         * @param view
         * @param options
         */
        function openView(view, options) {
            var view = viewStackService.get(view, options);
            _addViewObject(view);
        }
        /**
         * Add a view object to our view stack
         * @param view
         * @private
         */
        function _addViewObject(view) {
            if (view.replace) {
                $scope.viewStack = [];
                $scope.animateViewStackHeaders = false;
            }
            $scope.viewStack.push(view);
            if ($scope.viewStack.length > 1) {
                $scope.animateViewStackHeaders = true;
            }
        }
        function getModalPathParts() {
            var parts = (modalPath || "").split(".");
            parts.shift();
            var views = [];
            parts.forEach(function(part) {
                var url = glideUrlBuilder.newGlideUrl(part);
                views.push({
                    view: url.contextPath,
                    options: {
                        params: url.getParams()
                    }
                });
            });
            return views;
        }
        function toggleModal(bool) {
            var message = bool ? 'dialog.settingsModal.show' : 'dialog.settingsModal.close';
            $scope.$evalAsync(function() {
                $scope.$broadcast(message);
            });
        }
    });
    angular.bootstrap(document.documentElement, [
        'sn.common.ui',
        'sn.concourse',
        'sn.concourse_view_stack',
        'sn.common.notification',
        'sn.notification_preference'
    ]);
});
