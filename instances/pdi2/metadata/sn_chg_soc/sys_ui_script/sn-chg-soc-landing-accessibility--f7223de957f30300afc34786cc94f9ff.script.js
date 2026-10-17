angular.module("sn.app_itsm.now.accessibility", [])
.constant("COMMON", {
        "KEYS" : {
            "TABKEY"          : 9,
            "ENTER"           : 13,
            "ESCAPE"          : 27
        }
    }
)
.directive("focusMe", function($timeout) {
    return {
        scope: { trigger: "@focusMe" },
        link: function(scope, element) {
            scope.$watch("trigger", function(value) {
                if (value === "true")
                    $timeout(function() { element[0].focus(); });
            });
        }
    };
})
.directive("snPopoverAccessibilityFocus", ["$parse", "COMMON", function ($parse, COMMON) {
    return {
        restrict: 'A',
        link: function ($scope, $element, $attr) {
            var id = $attr.snPopoverAccessibilityFocus;
            function handler(id, $scope, $element, evt) {
                if (evt.keyCode === COMMON.KEYS.TABKEY) {
                    var popover = angular.element($element);
                    var list = popover.find('button:visible, [tabindex]:visible, input:visible, select:visible').not('[tabindex="-1"], [disabled="disabled"]');
                    var focused = angular.element(document.activeElement);
                    var nav = focused.parents('[sn-popover-accessibility-focus]');
                    if (nav.length) {
                        evt.preventDefault();
                        var index;
                        var next;
                        if (typeof index == "undefined")
                            index = list.index(focused);
                        if (!evt.shiftKey)
                            index = (index == list.length - 1) ? 0 : index + 1;
                        else if (evt.shiftKey)
                            index = (index == 0) ? list.length - 1: index - 1;
                        next = list.get(index);
                        if (next)
                            next.focus();
                    }
                }
                if (evt.keyCode === COMMON.KEYS.ESCAPE) {
                    angular.element("#" + id + ".soc-card-component .user-avatar-wrapper .user-avatar").focus();
                }
            }
            $element.on('keydown', handler.bind(this, id, $scope, $element));
        }
    };
}]);
