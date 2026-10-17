function todosTaskLineItemController($scope, $sanitize, $window, $sce, spModal, spUtil, i18n) {
    var c = this;
    if ($scope.data.displayValueList && $scope.data.displayValueList[0])
        $scope.data.displayValueList[0] = $sce.trustAsHtml($sanitize(String($scope.data.displayValueList[0])));

    if ($scope.data.displayValueList && $scope.data.displayValueList[1])
        $scope.data.displayValueList[1] = $sce.trustAsHtml($sanitize(String($scope.data.displayValueList[1])));
    var MOBILE_DEVICE_SCREEN_WIDTH = 767;
    $scope.mobileDevice = c.data.isMobile || ($window.innerWidth < MOBILE_DEVICE_SCREEN_WIDTH);
    $scope.visited = {};
    $scope.isSignPadVisible = false;
    $scope.$on('mobile-showSignPad', function(event, args) {
        $scope.isSignPadVisible = !$scope.isSignPadVisible;
    });

    $scope.selectedTab = 'details';

    $scope.$on('sn_hr_sp.todoTabSelected', function(event, data) {
        $scope.visited[data.tab] = true;
        $scope.selectedTab = data.tab;
    });

    c.isPortalInMessagingAppContext = function() {
        var isPortalInMessagingAppContext = false,
            clientName = '';
        // handling for MS Teams integration CS5921267
        if (document.body.classList.contains('embedded-experience-teams')) {
            isPortalInMessagingAppContext = true;
            clientName = 'Microsoft Teams';
        }

        // DEF0423166 : handling CS5921267 scenerio for Zoom integration
        if (document.body.classList.contains('embedded-experience-zoom')) {
            isPortalInMessagingAppContext = true;
            clientName = 'Zoom';
        }
        var message = 'A task with document type is not supported within {0}. Please {1}"{2}" {3}click here{4} to view the task.';
        c.displayMessage = i18n.getMessage(message).withValues([clientName,'<a href=', c.data.hrmToDoUrl,'target="_blank">','</a>']);
        return isPortalInMessagingAppContext;
    };

    c.getViewProfileText = function(name) {
        return $scope.data.CONST.i18n.VIEW_PROFILE.replace('{}', name);
    }

    c.triggerDelegatePopover = function(e) {
        e.preventDefault();
        c.showAllDelegatePopover = !c.showAllDelegatePopover;
    };

    c.canDelegate = function() {
        return !$scope.data.isCompleted &&
            !$scope.data.future &&
            $scope.data.isGranularDelegationActive &&
            $scope.data.active_duty_available &&
            !$scope.data.currentDelegates.noTableEntry &&
            !($scope.data.currentDelegates.delegate && $scope.data.currentDelegates.delegate.name);
    };

    if ($scope.data.isGranularDelegationActive) {
        // will be used for selected delegate info from edit delegate modal	
        c.selectedDelegate = [];
        // reference fn to controller - quick way to see all available methods
        c.editDelegate = editDelegate;
        c.getAvatar = getAvatar;
        c.showDelegateCount = showDelegateCount;
        c.singleTaskPageModal = singleTaskPageModal;
        c.updateSingleRecordDelegatesData = updateSingleRecordDelegatesData;

        var recordWatchQueryStr = 'document=' + $scope.data.sysId;
        recordWatchQueryStr += '^delegate=' + $scope.data.userId;
        recordWatchQueryStr += '^ORdelegation_record.user=' + $scope.data.userId;
        // when watcher fires, $emit to HRM Todo Summary widget to update delegate icon	
        spUtil.recordWatch(
            $scope,
            'sys_granular_delegate_m2m',
            recordWatchQueryStr,
            function() {
                c.updateSingleRecordDelegatesData();
                $scope.$emit('updateDelegateRecord');
            });
    }

    // returns CSS-ready prop for avatar image
    function getAvatar(avatarId) {
        if (avatarId)
            return {
                "background-image": "url(" + avatarId + ".iix?t=small)"
            };
    }

    function updateSingleRecordDelegatesData(name, data) {
        // remove stale data
        delete c.data.transport;
        if (!$scope.data.widgetMappings)
            constructWigetMappingsObj();
        c.server.update();
    }

    function constructWigetMappingsObj() {
        if ($scope.options && $scope.options.sysId) {
            var widgetMappings = [{
                condition: "",
                widgetSysId: $scope.data.widgetToRender.sys_id,
                widgetId: $scope.data.widgetToRender.id
            }];
            $scope.data.widgetMappings = widgetMappings;
        }
    }

    // open edit delegate modal
    function singleTaskPageModal(e, delegate) {
        var buttons = [{
            label: $scope.data.CONST.i18n.BUTTON.CANCEL,
            cancel: true
        }];

        if (!delegate || (delegate && !delegate.is_rule_based))
            buttons.push({
                label: $scope.data.CONST.i18n.BUTTON.SUBMIT,
                primary: true
            });
        if (e)
            c.tempDelegateData = {}; // used for shared data with edit delegate modal

        c.tempDelegateData["invitations"] = false;
        c.tempDelegateData["notifications"] = false;

        if (delegate) {
            c.tempDelegateData.update = true;
            c.tempDelegateData.delegateData = delegate;
            // only show delete button if delegate exists	and not created through rule
            if (!delegate.is_rule_based)
                buttons.splice(0, 0, {
                    label: $scope.data.CONST.i18n.BUTTON.DELETE,
                    remove: true
                });
        }

        spModal.open({
            title: $scope.data.CONST.i18n.MODAL_TITLE,
            widget: "7843ba3fb3361010f5302ddc16a8dca8", // Single record granular delegation
            widgetInput: {
                recordSysId: $scope.data.sysId,
                recordTableName: $scope.data.tableName
            },
            shared: c.tempDelegateData,
            buttons: buttons
        }).then(c.editDelegate);
    }

    function editDelegate(confirm) {
        if (confirm.cancel)
            return;
        // obj to send to server
        c.data.transport = {};

        if (confirm.primary) {
            c.data.transport.action = "createOrEditSingleRecordDelegate";
            c.data.transport.delegates = c.tempDelegateData;
        } else if (confirm.remove) {
            c.data.transport.action = "deleteSingleRecordDelegate";
            c.data.transport.delegation_record_id = c.tempDelegateData.delegateData.delegation_record_id;
        }
        if (!$scope.data.widgetMappings)
            constructWigetMappingsObj();
        c.server.update();
    }

    function showDelegateCount(count) {
        return $scope.data.CONST.i18n.DELEGATE_COUNT.replace('{}', count);
    }
}
