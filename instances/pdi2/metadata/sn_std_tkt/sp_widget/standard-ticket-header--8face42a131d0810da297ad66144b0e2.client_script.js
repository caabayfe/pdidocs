function($scope, spUtil, spScUtil, $window, $sce, $timeout, spAriaUtil) {
    function isRefreshNeededForChanges(changes) {
        var isNeeded = changes.length > 0 && !(
            changes.length == 1 && (
                changes[0] == 'comments' || changes[0] == 'work_notes' || changes[0] == 'task_percent_complete'
            )
        );
        return isNeeded;
    }
    var c = this;
	c.showPopover = false;
	c.renderWidget = false;
	
	if (c.data.is_new_order) {
		$timeout(function() {
			spAriaUtil.sendLiveMessage(c.data.requestSubmitMsg);
		}, 500);

	}
	c.showMore = c.showControls = false;
	fieldsCount = 0; // actual fields that will be rendered
	angular.forEach(c.data.fields, function(field) {
		if (field.type !== 'workflow' && (field.type !== 'decimal' || field.value != 0))
				fieldsCount++;
	});
	if (fieldsCount > 3)
		c.showMore = c.showControls = true;
	c.data.currentActionWidget = $scope.data.actionWidget;
	spUtil.recordWatch($scope, $scope.data.table, "sys_id=" + $scope.data.sys_id, function(name) {
		if (isRefreshNeededForChanges(name.data.changes)) {
			c.data.currentActionWidget = null;
			$scope.server.get().then(function(response) {
				if (!_.isEqual(c.data, response.data))
					_.assign(c.data, response.data);
				c.data.currentActionWidget = response.data.actionWidget;
				c.renderWidget = false;
				c.showPopover = false;
				c.data.popoverWidget = response.data.popoverWidget;
				if (c.data.isFocusRequired)
					c.data.currentActionWidget.isFocusRequired = c.data.isFocusRequired;
			});
		} else {
			c.server.get().then(function(response) {
						c.data.headerFields = response.data.headerFields;
					});
		}
	});
	$scope.$on('focusOnActions', function(evt, data) {
		 c.data.isFocusRequired = data.isFocusRequired;
		});

	$scope.hideMessage = function($scope) {
		c.hide = true;
	}
	
	$scope.summarizeTicket = function($scope) {
		if (!c.renderWidget)
			c.renderWidget = true;
		
		c.showPopover = true;

		$timeout(function() {
				var firstFocusable = angular.element('.popover-box').find('[tabindex="0"]').first();
				if (firstFocusable.length > 0) {
					firstFocusable[0].focus();
				}
		});
	}
	
	$scope.$on("close_standard_ticket_summary_modal", function(e,d) {
		c.showPopover = false;
	});
    $scope.openProfile = function(profileId) {
        if (!$scope.data.isExternalUser) {
            $window.open('?id=user_profile&sys_id=' + profileId, '_blank');
        }
    };
    if ($scope.data.description)
        $scope.description = $scope.data.description.type == 'html' ? $sce.trustAsHtml($scope.data.description.display_value) : $scope.data.description.display_value;

    $timeout(function() {
        var parentDivs = document.querySelectorAll('.sc-interactive-avatar');
        parentDivs.forEach(function(parentDiv) {
            // Find the nested div with class 'avatar' inside each parent
            var avatarDiv = parentDiv.querySelector('.avatar');
            if (avatarDiv) {
                // Attach keydown event listener to the parent
                parentDiv.addEventListener('keydown', function(e) {
                    if (e.ctrlKey && e.key.toLowerCase() === 'm') {
                        var rect = avatarDiv.getBoundingClientRect();

                        // Create and dispatch a right-click (contextmenu) event
                        var contextEvent = new MouseEvent('contextmenu', {
                            bubbles: true,
                            cancelable: true,
                            view: window,
                            clientX: rect.left + 10,
                            clientY: rect.top + 10
                        });

                        avatarDiv.dispatchEvent(contextEvent);
                    }
                });
            }
        });
    });
	
		spScUtil.getPreference('std-tkt-header-show-info-fields', function(value) {
				if (value != undefined)
					c.showInfoFields = (value == 'true') ;
				else 
					c.showInfoFields = c.data.showInfoFields;	
		});

		$scope.toggleInfoFields = function(mode) {
			if (mode == 'show') {
				spScUtil.setPreference('std-tkt-header-show-info-fields', false);
				c.showInfoFields = false;
			} else {
				spScUtil.setPreference('std-tkt-header-show-info-fields', true);
				c.showInfoFields = true;
			}
		}
}
