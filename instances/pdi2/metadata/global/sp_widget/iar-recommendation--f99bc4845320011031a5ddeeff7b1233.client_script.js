api.controller = function($scope) {
    /* widget controller */
    var c = this;
    $scope.showFeedback = c.data.showFeedback;
    $scope.showOptOut = c.data.showOptOutWidget;

    $scope.$on("$sp.iar_feedback_submitted", function($event, data) {
        $scope.showFeedback = false;
        $event.stopPropagation();
        $event.preventDefault();
        location.reload();
    });

    $scope.$on("$sp.iar_exited", function($event, data) {
        $scope.showOptOut = false;
        $event.stopPropagation();
        $event.preventDefault();
        location.reload();
    });
};
