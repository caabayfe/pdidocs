api.controller = function($scope) {
    /* widget controller */
    var c = this;
    c.closeRequest = null;
    c.aisHelpful = null;
    c.additionalComment = null;

    $scope.resetAISResult = function() {
        c.closeRequest = null;
        $("input:checkbox[name=chkAISResult]:checked").each(function() {
            $(this).checked = !$(this).checked;
        });
        c.additionalComment = null;
    };

    $scope.submitFeedback = function() {
        var aisResultHelpfulList = [];
        $("input:checkbox[name=chkAISResult]:checked").each(function() {
            aisResultHelpfulList.push($(this).val());
        });


        $scope.data.action = 'submitFeedback';
        $scope.data.feedbackRequest = {
            aisHelpful: c.aisHelpful,
            closeRequest: c.closeRequest,
            recordId: c.data.recordId,
            aisResultsList: aisResultHelpfulList,
            additionalComment: c.additionalComment,
            recordTable: c.data.recordTable
        };

        $scope.server.update().then(function(data) {
            $scope.$emit("$sp.iar_feedback_submitted");
        });
    };

    $scope.submitFeedbackAndCloseRequest = function() {
        var aisResultHelpfulList = [];
        $("input:checkbox[name=chkAISResult]:checked").each(function() {
            aisResultHelpfulList.push($(this).val());
        });
        $scope.data.action = 'submitFeedback';
        $scope.data.feedbackRequest = {
            aisHelpful: c.data.aisFeedBack.HELPFUL,
            closeRequest: c.data.closeRequestChoices.CLOSE_REQUEST,
            recordId: c.data.recordId,
            aisResultsList: aisResultHelpfulList,
            recordTable: c.data.recordTable
        };

        $scope.server.update().then(function(data) {
            $scope.$emit("$sp.iar_feedback_submitted");
        });
    };

    $scope.isNull = function(object) {
        return object == null;
    };
	
	if (c.data.action ==  "iar_close_request")
		$scope.submitFeedbackAndCloseRequest();
};
