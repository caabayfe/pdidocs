angular.module("sn.change_management.cab.approval")
	.controller('confirmApproval', ['$scope', '$uibModalInstance', '$uibModalStack', '$log', 'approval', function($scope, $uibModalInstance, $uibModalStack, $log, approval){
		var editor = {
			config: {
				menubar:false,
				theme:'silver',
				plugins:[
					'advlist','lists','link','charmap','anchor',
					'searchreplace','visualblocks','code',
					'insertdatetime'
				],
				height: 150,
				toolbar:'styles | bold italic | bullist numlist | alignleft aligncenter alignright alignjustify | link',
				toolbar_items_size:'small',
				resize: false,
				statusbar:false,
				debounce:false,
				auto_focus: "approve-reject-comments",
				cache_suffix: 'sysparm_substitute=false',
				"setup": function (instance) {
					instance.on("postRender", function(event) {
						// Route to the toolbar container for our configuration.
						var toolbar = event.target.editorContainer.children[0].children[0];
						// Keeps 'Esc' to move back to editor without closing modal.
						toolbar.onkeydown = function(event) {
							if (event.keyCode == 27)
								event.preventDefault();
						};
					});
				},
			},
			workingCopy: ""
		};
		$scope.editor = editor;

		$scope.approvalGroups = [];

		approval.get($scope.item.task.value).then(function(approval){
			$scope.approvalGroups = approval.groups;
			if ($scope.approvalGroups.length > 0)
				$scope.selectedApprovalGroup = $scope.approvalGroups[0].sys_id;
		});

		$scope.commentRequired = function() {
			return editor.workingCopy.length === 0;
		};
		// Flush the focus cache on change
		$scope.$watch($scope.commentRequired, function(newValue, oldValue) {
			$uibModalStack.clearFocusListCache();
		});

		$scope.ok = function() {
			//Only add [code] when we have a comment
			var editorComment = $scope.editor.workingCopy;
			if (editorComment.length !== 0)
				editorComment = "[code]" + editorComment + "[/code]";

			$scope.approvalDataObj = {comment: editorComment, approvalGroupSysID: $scope.selectedApprovalGroup};
			$uibModalInstance.close($scope.approvalDataObj);
		};

		$scope.cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};
	}]);
