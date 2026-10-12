function($scope, $window, $timeout, $location, spAriaUtil, cabrillo, i18n) {
    /* widget controller */
    var c = this;
    i18n.getMessages(['Close', 'Back to Catalog'], function(msgs) {
        $scope.closeButtonLabel = c.options.legacy_catalog == 'true' ? msgs['Back to Catalog'] : msgs['Close'];
    });
    $scope.animateTick = '';
    $scope.toggle = function($event, item) {
        item.expand = !item.expand;
    }

    var iframe = $window.frameElement;
	if (c.options.legacy_catalog + "" == "true" && iframe) {
			iframe.dataParentTable = null;
			iframe.dataParentSysId = null;
	}

    $scope.isNative = cabrillo.isNative() && c.data.isMEE;
    var wrapperClassName = $scope.isNative ? "wrapper-xs " : "wrapper-md ";
    if (c.data.is_new_order) {
        $timeout(function() {
            spAriaUtil.sendLiveMessage(c.data.msg.orderSubmitMsg, "status");
        }, 1000);

        // Set Title in Workspace
        if ($scope.options.isServiceWorkspace && !$scope.isNative)
            $window.postMessage({
                msg: 'CATALOG_ITEM_SET_TITLE',
                title: c.data.msg.pageTitle
            }, $location.origin);
    }

    if ($scope.isNative) {
        cabrillo.viewLayout.setTitle(c.data.msg.pageTitle);
        cabrillo.viewLayout.hideBackButton();
    }
    $scope.actions = {
        isOpen: false
    };
    $scope.field = {
        ed: {
            reference: 'sys_user',
            qualifier: "active=true^EQ"
        },
        value: '',
        isMandatory: function() {
            return false;
        },
        isReadonly: function() {
            return false;
        },
        display_value_list: [],
        g_form: {
            $private: {
                events: {
                    on: function() {}
                }
            },
            setValue: function(name, value, displayValues) {
                $scope.field.value = value;
                $scope.field.display_value_list = displayValues;
                $scope.field.displayValue = displayValues.join(',');
            }
        }
    }

    $scope.reOrder = function() {
        if (!$scope.field.value)
            return;
        var numOfClones = $scope.field.display_value_list.length;
        window.GlideWebAnalytics.trackEvent("Service Catalog", "Catalog Post Submission", "Request Cloned", numOfClones);
        $scope.server.get({
            userList: $scope.field.value,
            action: 'clone_request'
        }).then(function(response) {
            var progressModalCtrl;
            var unregister = $scope.$on('$sp.service_catalog.close_cloning', function() {
                progressModalCtrl.close();
                $window.location.reload();
            });
            var progressModal = angular.copy(response.data.progressModal);
            progressModal.options.afterOpen = function(ctrl) {
                progressModalCtrl = ctrl;
            };
            progressModal.options.afterClose = function() {
                unregister();
                c.progressModal = null;
                progressModalCtrl = null;
                $window.location.reload();
            };
            c.progressModal = progressModal;
        });
    }

    $scope.displayRequestItemTable = function() {
        return ((c.options.display_description === 'true') ||
            (c.options.display_delivery_date === 'true') ||
            (c.options.display_stage === 'true') ||
            (c.options.display_price === 'true') ||
            (c.options.display_quantity === 'true') ||
            (c.options.display_number === 'true')) && !c.options.isServiceWorkspace;
    }

    $scope.getSVGClass = function() {
        var classForWorkspace = wrapperClassName + "text-center";
        var svgClass = wrapperClassName + "b-b text-center visible-xs visible-sm";
        return c.options.isServiceWorkspace ? classForWorkspace : svgClass;
    }

    $scope.getOrderInfoClass = function() {
        var classForWorkspace = wrapperClassName + "text-center";
        var orderInfoClass = wrapperClassName + "b-b text-sm-center";
        return c.options.isServiceWorkspace ? classForWorkspace : orderInfoClass;
    }

    $scope.viewDetails = function() {
			if (c.options.legacy_catalog === 'true') {
        $location.path('now/nav/ui/classic/params/target/' +
            c.data.currentRecord.table +
            '.do?sys_id=' + c.data.currentRecord.sys_id);
			}
        window.postMessage({
            msg: 'TARGET_RECORD_SELECTED',
            target_number: c.data.currentRecord.number,
            target_table: c.data.currentRecord.table,
            target_sys_id: c.data.currentRecord.sys_id
        }, location.origin);
    }

    $timeout(function() {
        if ($scope.isNative)
            cabrillo.viewLayout.hideSpinner();
    });

    $scope.closeTab = function() {
        if (c.options.legacy_catalog === 'true') {
            $location.path('catalog').search({ id: 'legacy_sc_category'});
            return;
        }
        if ($scope.isNative) {
            cabrillo.flowControl.flowEnded();
            return;
        }
        window.postMessage({
            msg: 'CATALOG_ITEM_CLOSED'
        }, location.origin);
    }
}
