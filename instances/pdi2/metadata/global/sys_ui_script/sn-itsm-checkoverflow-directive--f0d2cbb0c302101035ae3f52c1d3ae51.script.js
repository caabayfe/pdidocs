angular.module('sn.itsm.change.overflow', [])
    .directive('checkOverflow', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            link: function(scope, element) {
                var checked = false;

                function setOverflowFlag(event) {
                    scope.$applyAsync(function() {
                        if (checked) {
                            checked = false;
                            return;
                        }

                        var visibleWidth = element[0].clientWidth;
                        var contentWidth = element[0].scrollWidth;
                        scope.overflows = contentWidth > visibleWidth;

                        if (scope.overflows) {
                            $timeout(function() {
                                checked = true;
                                element.triggerHandler('mouseenter', event);
                            });
                        }
                    });
                }
                element.on('mouseenter', setOverflowFlag);
            }
        };
    }]);
