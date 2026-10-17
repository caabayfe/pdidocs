function attachMate($scope, nowAttachmentHandler, $rootScope, spUtil, spModal) {
	$scope.errorMessages = [];
	$scope.attachmentHandler = new nowAttachmentHandler(getAttachments, function(error) {
		$scope.errorMessages.push(error);
		spUtil.addErrorMessage(error.msg + error.fileName);
	});

	spUtil.recordWatch($scope, $scope.data.table, $scope.data.filter, getAttachments);
	
	$scope.confirmDeleteAttachment = function(attachment) {
		spModal.confirm("${Delete Attachment?}").then(function() {
			$scope.attachmentHandler.deleteAttachment(attachment);
		});
	};

	function getAttachments() {
		$scope.server.update().then(function() {
			$scope.attachments = $scope.data.attachments;
			$scope.anyAttachments = $scope.attachments && $scope.attachments.length != 0;
		});		
	}
	
	getAttachments();
}
