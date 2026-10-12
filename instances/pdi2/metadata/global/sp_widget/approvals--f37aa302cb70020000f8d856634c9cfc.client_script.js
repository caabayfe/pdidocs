function ($scope, spUtil, spUIActionsExecuter, $timeout, i18n, spModal, $q) {
	var c = this;

	$scope.$on('commentEntered', function(event, comment) {
    	if ($scope.comment !== comment)
        	$scope.comment = comment;
	});

	var ESIGNATURE = {
		TYPE: "form",
		APPROVE_SYS: "cbfe291147220100ba13a5554ee4904d",
		REJECT_SYS: "580f711147220100ba13a5554ee4904b"
	};

	if ($scope.options.portal == true || $scope.options.portal == 'true') {
		$scope.contentColClass = "col-xs-12";
		$scope.options.portal = true;
	} else {
		$scope.options.portal = false;
		$scope.contentColClass = "col-sm-8";
	}

	$scope.data.op = "";
	var filter = "state=requested";
	if ($scope.data.delegatedApprovals && $scope.data.delegatedApprovals.length > 0)
		filter += "^sys_idIN" + $scope.data.delegatedApprovals.toString();
	if ($scope.data.approvers && $scope.data.approvers.length > 0) {
		if ($scope.data.delegatedApprovals && $scope.data.delegatedApprovals.length > 0)
			filter += "^OR";
		else
			filter += "^";
		filter += "approverIN" + $scope.data.approvers.toString();
	}
	spUtil.recordWatch($scope, "sysapproval_approver", filter, function(data) {
		// don't double-roundtrip if update came from record just approved/rejected
		if (data.data.sys_id != $scope.data.target)
			spUtil.update($scope);
	});

	$scope.approvalsInProgressFor = [];
  
	function get(id) {
		return $q(function(resolve) {
			var target = $scope.data.target;
			var operation = $scope.data.op;
			var taskNumber = getTaskNumber(target);
			spUtil.update($scope).then(function(result) {
				updateInProgressApprovals(target);
				$timeout(function () {
					var approvalIds = result && result.ids;
					// Set focus on last element
					if (id == -1)
						id = approvalIds[approvalIds.length - 1];
					// set focus on first element
					else if (id == 0)
						id = approvalIds[0];
					var key = id == "no-approval" ? "no-approval" : ("approval_task_" + id);
					setFocus(key, operation, taskNumber);
					resolve();
				}, 500);
			});
		});	
	}
	
	function updateInProgressApprovals(id) {
		if (id)
			$scope.approvalsInProgressFor.splice($scope.approvalsInProgressFor.indexOf(id), 1);
	}

	function getTaskNumber(id) {
    		var currentApproval = $scope.data.approvals.find(function(item){
			return item.sys_id === id;
		});
		var taskNumber = currentApproval && currentApproval.task.number;
		return taskNumber;
	}

	function setFocus(id, operation, taskNumber) {
		var nextApprovalElement = document.getElementById(id);
		if (nextApprovalElement) {
			if (operation === 'approved' || operation === 'rejected') {
				var message = operation === 'approved' ?
					i18n.getMessage("{0} has been approved").withValues([taskNumber]) :
					i18n.getMessage("{0} has been rejected").withValues([taskNumber]);

				// Add visual notification
				if (operation === 'approved')
					spUtil.addInfoMessage(message);
				else
					spUtil.addErrorMessage(message);

				$( "<span/>", {
					"class": 'sr-only',
					"text": message
				}).prependTo(nextApprovalElement);
			}
			nextApprovalElement.focus();
			$(nextApprovalElement).one('blur', function() {
				$(nextApprovalElement).find('.sr-only').remove();
			});
		}
	}

	function getNextApproval(id) {
		var approvals = $scope.data.ids,
		currentIndex = approvals.indexOf(id),
		hasNext = $scope.data.pagination.hasNext,
		hasPrevious = $scope.data.pagination.hasPrevious;

		// Action on only approval and no approval left
		if (approvals.length == 1 && !hasNext && !hasPrevious)
			return "no-approval";
		// Action on only approval in last page
		if (approvals.length == 1 && !hasNext)
			return 0;
		// Action on last approval item in current page
		if (currentIndex == approvals.length - 1 && hasNext)
			return -1;
		// Action on last approval item in last page
		if (currentIndex == approvals.length - 1)
			return approvals[currentIndex - 1];

		if (currentIndex >= 0 && currentIndex < approvals.length - 1)
			return approvals[currentIndex + 1]
	}

	$scope.approve = function(id, esigRequired) {
		var requestParams = {
			username: $scope.data.esignature.username,
			userSysId: $scope.data.esignature.userSysId
		};

		if($scope.data.esignature.e_sig_required && esigRequired) {
			spUIActionsExecuter.executeFormAction(ESIGNATURE.APPROVE_SYS, "sysapproval_approver" , id, [] , "", requestParams).then(function(response) {
			});			
		} else {
			$scope.approvalsInProgressFor.push(id);
			$scope.data.op = "approved";
			$scope.data.target = id;
			get(getNextApproval(id));
		}
  	}

	$scope.reject = function(id, esigRequired) {
		var requestParams = {
			username: $scope.data.esignature.username,
			userSysId: $scope.data.esignature.userSysId
		};
		$scope.data.op = "rejected";
		$scope.data.target = id;
		$scope.comment = '';

		var openRejectionModal = function() {
			spModal.open({
				title: $scope.data.reject_record_message,
				widget: 'reject_comment_text_area',
				buttons: [
					{label: i18n.getMessage('Cancel'), cancel: true},
					{label: i18n.getMessage('Reject'), primary: true}
				],
				onSubmit: function() {
					return postComment(id, esigRequired, requestParams).then(function(result) {
						return { status: 'success' };
					});
				}
			}).then(function() {
			// Modal submit handler
			}, function() {
				// Reset button state if modal is canceled
				var index = $scope.approvalsInProgressFor.indexOf(id);
				if (index > -1) {
					$scope.approvalsInProgressFor.splice(index, 1);
				};
			});
		};

		if ($scope.data.esignature.e_sig_required && esigRequired) {
			if ($scope.data.mandatory_comment === "true")
				openRejectionModal();
			else {
				spUIActionsExecuter.executeFormAction(ESIGNATURE.REJECT_SYS, "sysapproval_approver" , id, [] , "", requestParams).then(function(response) {
					$scope.approvalsInProgressFor.push(id);
					get(getNextApproval(id));
				});
			}
		} else {
			if ($scope.data.mandatory_comment === "true") {
				$scope.approvalsInProgressFor.push(id);
				openRejectionModal();
			}
			else {
				$scope.approvalsInProgressFor.push(id);
				get(getNextApproval(id));
			}
		}
	}

	$scope.isSubmitting = false;
	function postComment(id, esigRequired, requestParams) {
		return $q(function(resolve, reject) {
			if ($scope.isSubmitting) 
				return resolve({ status: 'success' });

			if ($scope.comment) {
				$scope.data.journalEntry = $scope.comment;
				$scope.data.journalEntryField = $scope.data.primaryJournalField.name;
				$scope.data.isPosting = true;
				$scope.isSubmitting = true;
				var updatePromise;

				if ($scope.data.esignature.e_sig_required && esigRequired) {
					$rootScope.$broadcast('closeSpModal');
					updatePromise = spUIActionsExecuter.executeFormAction(
						ESIGNATURE.REJECT_SYS,
						"sysapproval_approver",
						id,
						[],
						"",
						requestParams
					).then(function() {
						return spUtil.update($scope);
					});
				} else
					updatePromise = get(getNextApproval(id));

				updatePromise.then(function(result) {
					$scope.data.isPosting = false;
					$scope.isSubmitting = false;
					$scope.comment = '';
					resolve(result);
				})
			} else
				$rootScope.$broadcast('commentRequired');
		});
	}
	// pagination
	$scope.previousPage = function() {
		if ($scope.data.pagination.currentPage > 1)
			$scope.data.pagination.currentPage = $scope.data.pagination.currentPage - 1;
		else
			$scope.data.pagination.currentPage = 0;
      
		$scope.data.op = "previous";
		$scope.data.target = null;

		get(0);
	}

	$scope.nextPage = function() {
		$scope.data.op = "next";
		$scope.data.target = null;
		$scope.data.pagination.currentPage = $scope.data.pagination.currentPage+1;
		get(0);
	}
	
	$scope.getItemDisplay = function(task) {
		if (task.number && task.short_description)
			return task.number + " - " + task.short_description;
		
		return task.number || task.short_description || "";
	}
}
