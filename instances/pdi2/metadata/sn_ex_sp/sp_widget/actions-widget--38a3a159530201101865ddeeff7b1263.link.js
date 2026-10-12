function link(scope, element, attrs, controller) {

    // window resize should recalculate if elements are shrunk;
    var resizeWindow = function() {
        evaluateShrink(element, attrs);
    };
    var appWindow = angular.element(window);
    appWindow.bind('resize', _.debounce(resizeWindow, 150));

    // To show tooltip for ellipsis without page reload on enabling text-spacing for WCAG testing
    scope.$watch(
        function() {
            return element.css("line-height");
        },
        function(newVal, oldVal) {
            if (newVal !== oldVal) {
                evaluateShrink(element, attrs);
            }
        });

    scope.$on('action.toggle.dropdown', function(e) {
        var actionList = $(elem).find('#actionList');
        actionListFix(actionList);
    });


    function evaluateShrink(elem, attrs) {
        if (elem && elem.length > 0) {
            var actionList = $(elem).find('#actionList');
            actionListFix(actionList);
            primaryButtonFix($(elem).find('.button-container'), elem.parent());
        }
    }

    function primaryButtonFix(elem, parent) {
        var primaryAction = element.find('.primary-action');
        primaryAction.css('width', '');

        if (!parent || parent.width() < 1) {
            primaryAction.css('width', '');
            toggleTooltip(primaryAction);
            return;
        }

        var ellipses = elem.parent().find('.dropdown');
        var ellipsesWidth = ellipses.outerWidth();
        if (ellipsesWidth > 0) {
            ellipsesWidth += 8;
        }
        var width = elem.outerWidth();
        var parentWidth = parent.width();
        var primaryActionCount = primaryAction.length;
        var newWidth = (parentWidth - ellipsesWidth - 8 * (primaryActionCount - 1)) / primaryActionCount;
        if (newWidth < width) {
            primaryAction.outerWidth(newWidth);
        }
        toggleTooltip(primaryAction);
        return;
    }

    function actionListFix(elem) {
        if (elem && elem.length && !isElementInViewport(elem)) {
            var rect = elem[0].getBoundingClientRect();
            if (rect.left <= 0) {

                elem.attr('custom-width', elem[0].clientWidth + rect.left);
                elem.width(function(index, currentWidth) {
                    return currentWidth + rect.left;
                });
            }
        } else {
            if (elem.attr('custom-width')) {
                elem.removeAttr('custom-width');
                elem.css('width', '');
            }
        }
        toggleTooltip(elem.find('a'));
    }

    function isElementInViewport(el) {

        if (typeof jQuery === "function" && el instanceof jQuery) {
            el = el[0];
        }

        var rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
            rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
        );
    }

    function toggleTooltip(element) {
        if (element) {
            element.map(function(index, elem) {
                var current = isEllipsisActive(elem);
                var children = $(elem).children().map(function(ind, ele) {
                    return isEllipsisActive(ele);
                }).get().reduce(function(acc, val) {
                    return acc || val;
                }, false);
                if (current || children) {
                    $(elem).tooltip('enable');
                } else {
                    $(elem).tooltip('disable');
                }
            });
        }
    }

    function isEllipsisActive(element) {
        return element.clientWidth < element.scrollWidth;
    }

    setTimeout(function() {
        $('[data-toggle-tooltip="tooltip"]').tooltip();
        evaluateShrink(element, attrs);
    });

    scope.$on("sn_ex_sp.reEvaluateActionsWidth", function() {
        evaluateShrink(element, attrs);
    });
}
