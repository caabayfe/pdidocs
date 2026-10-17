function attachMate($scope, nowAttachmentHandler, $rootScope, spUtil, spModal, spAriaUtil, $document) {
    $scope.data.loadingAttachments = true;
    $scope.errorMessages = [];
    $scope.attachmentHandler = new nowAttachmentHandler(setAttachments, appendError);
    $scope.data.action = "";
    var isReadonlyMode = $scope.data.read_only;
    spUtil.recordWatch($scope, "sys_attachment", "table_sys_id=" + $scope.data.sys_id, function(response, data) {
        $scope.attachmentHandler.getAttachmentList();
        if (response.data) {
            var options = {};
            options.operation = response.data.operation;
            options.filename = response.data.display_value;
            options.sys_id = $scope.data.sys_id;
            options.table = $scope.data.table;
            options.state = (response.data.record && response.data.record.state) ? response.data.record.state.value : "";
            //broadcast only if operation is update...we don't need insert and other record updates for now
            if (options.operation === "update" && options.state === "not_available")
			$rootScope.$broadcast("attachment.updated",options);
        }
    });

    $scope.$evalAsync(function() {
        $scope.attachmentHandler.setParams($scope.data.table, $scope.data.sys_id, 1024 * 1024 * $scope.data.maxAttachmentSize);
        $scope.attachmentHandler.getAttachmentList();
    });

    $scope.hasAttachments = function() {
		return $scope.attachments && $scope.attachments.length != 0;
    };

    $scope.canWrite = function() {
        return $scope.data.canWrite;
    };

    $scope.dropFiles = function(files) {
        if (!$scope.data.canDragAndDrop) {
            spUtil.addInfoMessage(data.noDragDropMsg);
            return;
        }
        $scope.attachmentHandler.onFileSelect(files);
    }
    $scope.confirmDeleteAttachment = function(attachment) {
		var appendTo = $scope.data.appendToId ? $document.find('#'+$scope.data.appendToId) : null;
		spModal.confirm("${Delete Attachment?}",  appendTo).then(function() {
            $scope.attachmentHandler.deleteAttachment(attachment);
        });
    };

    $scope.$on('added_attachment', function(evt) {
        $scope.data.action = "added";
        spUtil.update($scope);
    });

    $scope.$on('sn.attachment.scanned', function(evt) {
        $scope.attachmentHandler.getAttachmentList("list");
    });

    $scope.$on('sp.record.can_write', function(evt, answer) {
        $scope.data.canWrite = answer;
    });

    function appendError(error) {
        $scope.errorMessages.push(error);
        spUtil.addErrorMessage(error.msg + error.fileName);
        spAriaUtil.sendLiveMessage(error.msg);
    }

    function setAttachments(attachments, action) {
        if ($scope.submitting == true)
            return;

        if (isReadonlyMode) {
            attachments.forEach(function(attachment) {
                attachment.canDelete = false;
                attachment.canWrite = false;
            });
        }

        $scope.attachments = attachments;
        $scope.data.loadingAttachments = false;
        if (!action)
            return;

        if (action === "added") {
            spAriaUtil.sendLiveMessage($scope.data.attachmentSuccessMsg);
        }

        $scope.data.action = action;
        spUtil.update($scope);
    }
}
