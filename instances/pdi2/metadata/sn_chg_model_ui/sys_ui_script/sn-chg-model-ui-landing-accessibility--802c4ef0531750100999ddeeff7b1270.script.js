angular.module("sn.app_itsm.now.accessibility", [])
.constant("COMMON", {
    "KEYS": {
        "TABKEY"          : 9,
        "ENTER"           : 13,
        "ESCAPE"          : 27,
        "RIGHT_ARROW"     : 39,
        "LEFT_ARROW"      : 37
    }
})
.directive("focusMe", function($timeout) {
    return {
        scope: {
            trigger: "@focusMe"
        },
        link: function(scope, element) {
            scope.$watch("trigger", function(value) {
                if (value === "true")
                    $timeout(function() {
                        element[0].focus();
                    });
            });
        }
    };
})
.directive("addUibTabAccessibility", function(COMMON) {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            element.on('keydown', function(ev) {
                if (ev.which !== COMMON.KEYS.RIGHT_ARROW && ev.which !== COMMON.KEYS.LEFT_ARROW)
                    return;
                var currentSelected = angular.element(ev.currentTarget).children('li[role=tab][aria-selected=true]');
                if (currentSelected && currentSelected.length !== 1)
                    return;
                var currentFocusId = currentSelected[0].id;
                var tabs = angular.element(ev.currentTarget).children('li[role=tab]')
                var nextIndex = 0;
                for (var i = 0; i < tabs.length; i++) {
                    if (tabs[i].getAttribute('id') === currentFocusId) {
                        nextIndex = (COMMON.KEYS.RIGHT_ARROW === ev.which) ? i++ : i--;
                        nextIndex = i === -1 ? tabs.length - 1 : i % tabs.length;
                        break;
                    }
                }
                scope.chgModelLandingCtrl.filterBy(tabs[nextIndex].getAttribute('id'));
            });
        }
    };
});
