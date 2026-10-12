api.controller = function($scope, $timeout) {
    /* widget controller */
    var c = this;

    $('.request-card-timestamp time').attr('tabindex', -1);

    $scope.getLabelBackground = function(status) {
        var lowerCased = status.toLowerCase();
        var titleCase = lowerCased.charAt(0).toUpperCase() + lowerCased.slice(1);
        return c.data.supportedColors[titleCase] || 'label-info-color';
    };

    c.navigateOnKeyEnter = function(event) {
        if (event.keyCode === 13) {
            $timeout(function() {
                event.preventDefault();
                event.stopPropagation();
                event.target.click();
            });
        }
    };

    $scope.handleAction = function(event) {
        event.preventDefault();
        event.stopPropagation();
        $scope.$emit(c.data.actionConfig.eventName, c.data.actionConfig.eventPayload);
    };
};
