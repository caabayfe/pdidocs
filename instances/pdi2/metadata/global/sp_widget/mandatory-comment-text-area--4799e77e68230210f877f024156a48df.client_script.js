function($scope, $timeout, i18n) {
    var c = this;
        
    $scope.comment = '';
    $scope.isCommentEmpty = false;
    

    $rootScope.$on('commentRequired', function() {
        $scope.isCommentEmpty = true;
        $scope.focusCommentField();
    });
		
    $scope.mandatoryComment = function() {
        if ($scope.comment && $scope.comment.trim() !== '')
            $scope.isCommentEmpty = false;
        else
            $scope.isCommentEmpty = true;

	    $rootScope.$broadcast('commentEntered', $scope.comment);
    };

    $scope.focusCommentField = function() {
        var commentField = document.getElementById('rejection-comment');
        if (commentField)
            commentField.focus();
    };

};
