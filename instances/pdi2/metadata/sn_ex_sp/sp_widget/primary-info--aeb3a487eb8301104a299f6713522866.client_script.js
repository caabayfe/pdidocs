api.controller = function($window, $timeout, $scope, spUtil, spModal, $sce, $sanitize) {
    var c = this;
    c.viewShowMore = true;
    c.showMoreText = '${Show more}';
    c.primaryField = c.data.primaryInfo.fields;
    if(c.primaryField){
      c.primaryField.forEach(function(field) {
        if (field.fieldType === 'translated_html' || field.fieldType === 'html') {
          field.htmlValue = $sce.trustAsHtml($sanitize(field.value));
        }
      });
    }


    c.displayField = function(index) {
        if (!c.viewShowMore)
            return true;
        var windowWidth = $window.innerWidth;
        if (windowWidth >= 1200 && index > 7) {
            return false;
        } else if ((windowWidth < 1200 || (c.data.primaryInfo.widgetSpan && c.data.primaryInfo.widgetSpan === 9)) && windowWidth > 768 && index > 5) {
            return false;
        } else if (windowWidth <= 768 && index > 3) {
            return false;
        }
        return true;
    };

    c.displayShowMore = function() {
        var windowWidth = $window.innerWidth;
        if (windowWidth >= 1200 && c.primaryField.length > 8) {
            return true;
        } else if ((windowWidth < 1200 || (c.data.primaryInfo.widgetSpan && c.data.primaryInfo.widgetSpan === 9)) && windowWidth > 768 && c.primaryField.length > 6) {
            return true;
        } else if (windowWidth <= 768 && c.primaryField.length > 4) {
            return true;
        }
        return false;
    };

    c.getShowMoreIconClass = function() {
        return c.viewShowMore ? 'fa-chevron-down' : 'fa-chevron-up';
    };

    c.clickShowMore = function(event) {
        c.viewShowMore = !c.viewShowMore;
        c.showMoreText = c.viewShowMore ? '${Show more}' : '${Show less}';
        if (!c.viewShowMore) {
            if (event.target && event.target.parentElement) {
                var parentElement = event.target.parentElement;
                var startIndex = parentElement.getElementsByClassName('primary-info-field').length;
                $timeout(function() {
                    focusNextElement(startIndex, parentElement);
                });
            }
        }
    };

    function focusNextElement(startIndex, parentElement) {
        for (var i = startIndex; i < c.primaryField.length; i++) {
            var focusableElement = parentElement.getElementsByClassName('primary-info-user-link');
            if (focusableElement && focusableElement.length) {
                focusableElement[0].focus();
                break;
            }
        }
    }

    c.getPrimaryFieldClass = function() {
        if (c.data.primaryInfo.widgetSpan && c.data.primaryInfo.widgetSpan === 9) {
            return "col-xs-12 col-sm-6 col-md-6 col-lg-4";
        }
        return "col-xs-12 col-sm-6 col-md-4 col-lg-3";
    }

    c.triggerDelegatePopover = function(e) {
        e.preventDefault();
        c.showAllDelegatePopover = !c.showAllDelegatePopover;
    };

    c.getViewProfileText = function(name) {
        return $scope.data.CONST.i18n.VIEW_PROFILE.replace('{}', name);
    }

    c.canDelegate = function() {
        return !$scope.data.isCompleted &&
            !$scope.data.future &&
            $scope.data.isGranularDelegationActive &&
            $scope.data.active_duty_available &&
            !$scope.data.currentDelegates.noTableEntry &&
            !($scope.data.currentDelegates.delegate && $scope.data.currentDelegates.delegate.name) &&
            ($scope.data.currentDelegates.searchResCount > 0 || $scope.data.canDelegateRecord);
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
        spUtil.recordWatch($scope, 'sys_granular_delegate_m2m', recordWatchQueryStr,
            function() {
                c.updateSingleRecordDelegatesData();
                $scope.$emit('updateDelegateRecord');
            });
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
        c.server.update();
    }

    function updateSingleRecordDelegatesData(name, data) {
        // remove stale data
        delete c.data.transport;
        c.server.update();
    }

    function showDelegateCount(count) {
        return $scope.data.CONST.i18n.DELEGATE_COUNT.replace('{}', count);
    }

    // returns CSS-ready prop for avatar image
    function getAvatar(avatarId) {
        if (avatarId)
            return {
                "background-image": "url(" + avatarId + ".iix?t=small)"
            };
    }
};
