function ($scope, $animate, $rootScope, spUIActionsExecuter, spUtil, spModal, i18n, $q, $sce) {
        var c = this;

        c.trustedHTML = function(html) {
            // Strip HTML tags and convert to plain text
            html = spUtil.sanitizeHtml(html);
            return $sce.trustAsHtml(html);
        };

        var ESIGNATURE = {
            "approved": "cbfe291147220100ba13a5554ee4904d",
            "rejected": "580f711147220100ba13a5554ee4904b"
        };
        
        c.showAll = false;
        c.expandedFields = {};
        
        // For main request fields
        c.toggleShowAll = function() {
            c.showAll = !c.showAll;
        };
        
        c.toggleField = function(fieldName) {
            c.expandedFields[fieldName] = !c.expandedFields[fieldName];
        };
        
        c.isFieldExpanded = function(fieldName) {
            return c.expandedFields[fieldName] || false;
        };
        
        c.handleTabKeydown = function(event, tabId) {
            if (event.keyCode === 32) { // Space key
                event.preventDefault();
                c.activeTab = tabId;
            }
        };

        c.getAllFields = function() {
            if (!$scope.data.displayFields || !$scope.data.task) {
                return [];
            }

            var filteredFields = ($scope.data.displayFields || []).filter(function(field) {
                var isDefaultField = ['sys_created_on', 'sys_updated_on', 'state'].includes(field);
                var hasField = !!$scope.data.task[field];
                var hasValue = hasField && !!$scope.data.task[field].value;

            return !isDefaultField && hasField && hasValue;
            });

            return filteredFields;
        };

        c.getInitialFieldCount = function() {
            var width = window.innerWidth;
            if (width <= 767) return 4;        // Mobile: 4 fields
            if (width <= 991) return 6;        // Tablet: 6 fields
            return 9;                          // Desktop: 9 fields
        };

        c.getVisibleFields = function() {
            var allFields = c.getAllFields();
            return c.showAll ? allFields : allFields.slice(0, c.getInitialFieldCount());
        };

        c.getRemainingCount = function() {
            var allFields = c.getAllFields();
            var initialCount = c.getInitialFieldCount();
            return allFields.length > initialCount ? allFields.length - initialCount : 0;
        };

        c.hasMoreFields = function() {
            return c.getRemainingCount() > 0;
        };
        
        c.shouldShowViewMore = function() {
            var hasExtraFields = c.hasMoreFields();
            var hasVariables = $scope.data.variables && $scope.data.variables.length > 0;
            return hasExtraFields || hasVariables;
        };
        
        c.shouldShowLimitedVariables = function() {
            if (c.showAll || !$scope.data.variables || $scope.data.variables.length === 0) {
                return false;
            }
            var allFieldsCount = c.getAllFields().length;
            return allFieldsCount <= 6;
        };

        // Watch for task changes
        $scope.$watch('data.task', function(newTask) {
            if (newTask) {
            $scope.task = newTask;
            }
        });
        
        // For request items
        c.itemsExpanded = false;
        
        c.getVisibleItems = function() {
            return $scope.data.items || [];
        };
        
        $scope.$watch("data.task", function() {
            $scope.task = $scope.data.task;
        });
        
        $scope.$on('commentEntered', function(event, comment) {
            if ($scope.comment !== comment)
            $scope.comment = comment;
        });
        
        if (c.data && c.data.approval_sys_id) {
            spUtil.recordWatch($scope, "sysapproval_approver", "state=requested^sys_id="+ c.data.approval_sys_id);
        }
        
        c.approvalInProgress = false;
        c.showMore = false;
        
        c.toggleShowMore = function() {
            c.showMore = !c.showMore;
        };
        
        c.action = function(state) {
            if (c.data.esignature && c.data.esignature.e_sig_required)
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
                return postComment(state);
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
            c.data.approval_sys_id,
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
        
        function postComment(state) {
            if (!$scope.comment || $scope.comment.trim() === '') {
            spUtil.addErrorMessage(i18n.getMessage('Comment is required'));
            return $q.reject();
            }
            c.approvalInProgress = true;
            $scope.data.isPosting = true;
            return c.server.update({
            op: state,
            isPosting: true,
            journalEntry: $scope.comment,
            journalEntryField: c.data.primaryJournalField.name
            }).then(function(response) {
            return $q(function(resolve, reject) {
                handleServerUpdate(state, c.data.rejectedStatusMsg, resolve);
            });
            });
        }
        }
