function ($scope, spUIActionsExecuter, spUtil, spModal, i18n, $q) {
    var c = this;

    var ESIGNATURE = {
        "approved": "cbfe291147220100ba13a5554ee4904d",
        "rejected": "580f711147220100ba13a5554ee4904b"
    };
    var cleanupJournalEntries = true;

    $scope.$on('commentEntered', function(event, comment) {
        if ($scope.comment !== comment)
        $scope.comment = comment;		
    });

    spUtil.recordWatch($scope, "sysapproval_approver", "state=requested^sys_id="+ c.data.sys_id, function(){
	if (cleanupJournalEntries) {
	   c.data.op = "";
           c.data.isPosting = false;
	   c.data.journalEntry = "";
           c.data.journalEntryField = "";
	}  
	cleanupJournalEntries = true;    
        c.server.update();
    });    
    c.approvalInProgress = false;
    c.action = function(state) {
        if (c.data.esignature.e_sig_required) 
            handleESignature(state);       
        else 
            processStandardApproval(state);
    };

    function handleESignature(state) {
        if (state === 'rejected' && c.data.mandatory_comment === "true") {
            $scope.comment = '';
            openRejectionModal(state);
        } else {
            executeESignatureAction(state)
                .then(checkStateWithCredentials)
                .then(handleApprovalState);
        }
    }

    function openRejectionModal(state) {
        spModal.open({
            title: c.data.reject_record_message,
            widget: 'reject_comment_text_area',
            dismissOnEnter: true,
            buttons: [
                {label: i18n.getMessage('Cancel'), cancel:true},
                {label: i18n.getMessage('Reject'), primary:true}
            ],
            onSubmit: function() {
                return postComment(state)
            }
        }).then(function() {
        }, function() {
            c.approvalInProgress = false;
        });
    }

    function executeESignatureAction(state) {
        var requestParams = {
            username: c.data.esignature.username,
            userSysId: c.data.esignature.userSysId
        };
        return spUIActionsExecuter.executeFormAction(
            ESIGNATURE[state], 
            "sysapproval_approver", 
            c.data.sys_id, 
            [], 
            "", 
            requestParams
        );
    }

    function checkStateWithCredentials(response) {
        return c.server.get({
            action: "checkStatewithCredentials"
        });
    }


    function handleServerUpdate(state, successMessage, resolve) {
        // Ensure resolve is a function, default to no-op if not provided
        if (typeof resolve !== 'function') {
            resolve = function() {};
        }
        c.server.update().then(function() {
            c.approvalInProgress = false;
            $scope.data.isPosting = false;
            $scope.isSubmitting = false;
            $scope.comment = '';
            
            if (!c.data.updateID) {
                spUtil.addErrorMessage(c.data.actionPreventedMsg);
                resolve({ status: 'error' });
            } else {
                c.data.state = state;
                if (successMessage) 
                    spUtil.addInfoMessage(successMessage);

                resolve({ status: 'success' });
            }
        });
    }

    function handleApprovalState(response) {
        if (response.data.state === "approved")
            spUtil.addInfoMessage(c.data.approvedStatusMsg);
    }

    function processStandardApproval(state) {
        c.approvalInProgress = true;
        c.data.op = state;

        if (state === 'rejected') {
            $scope.comment = '';
        
            if (c.data.mandatory_comment === "true") {
                openRejectionModal(state);
                return;
            }
            successMessage = c.data.rejectedStatusMsg;
        }
        else
            successMessage = c.data.approvedStatusMsg;

        handleServerUpdate(state, successMessage);
    }

    $scope.isSubmitting = false;
    function postComment(state) {
        return $q(function(resolve, reject) {

            if ($scope.isSubmitting)
                return resolve({ status: 'success' });

            if (!$scope.comment) {
                $rootScope.$broadcast('commentRequired');
                return; // Early exit if comment is not provided
            }

            $scope.isSubmitting = true;
            $scope.data.journalEntry = $scope.comment;
            $scope.data.journalEntryField = $scope.data.primaryJournalField.name;
            $scope.data.isPosting = true;

            if (!c.data.esignature.e_sig_required) {
                return handleServerUpdate(state, c.data.rejectedStatusMsg, resolve);
            }

            // Handle e-signature requirement
            var requestParams = {
                username: c.data.esignature.username,
                userSysId: c.data.esignature.userSysId
            };
            c.data.op = state;
	    cleanupJournalEntries = false;
            $rootScope.$broadcast('closeSpModal');

            spUIActionsExecuter.executeFormAction(ESIGNATURE[state], "sysapproval_approver", c.data.sys_id, [], "", requestParams)
                .then(checkStateWithCredentials)
                .then(function() {
                    $scope.isSubmitting = false;
                    $scope.data.isPosting = false;
                    $scope.comment = '';
                    c.data.state = state;
                    spUtil.addInfoMessage(c.data.rejectedStatusMsg);
                    resolve({ status: 'success' });
                });
        });
    }
}
