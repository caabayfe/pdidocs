function() {

    //Scroll the section to given length (domElementTop - section.scrollTop)
    function scrollTo(section, domElementTop, duration) {
        var start = section.scrollTop;
        var change = domElementTop - start;
        var currentTime = 0;
        var increment = 20;
        var animateScroll = function() {
            currentTime += increment;
            var val = easeInOutQuad(currentTime, start, change, duration);
            section.scrollTop = val;
            if (currentTime < duration) {
                setTimeout(animateScroll, increment);
            }
        };
        animateScroll();
    }

    function easeInOutQuad(currentTime, start, change, duration) {
        currentTime /= duration / 2;
        if (currentTime < 1) return change / 2 * currentTime * currentTime + start;
        currentTime--;
        return -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
    };

    return {
        restrict: 'A',
        replace: true,
        link: function(scope, element) {
            var domEelement = element.get(0);
            var panelElement = domEelement.querySelector(".panel-collapse");
            scope.collapsing = false;
            scope.$watch(function() {
                return panelElement.classList.contains("collapsing");
            }, function(status) {
                if (scope.collapsing && !status) {
                //Only scroll the panel which is opened now.
                    if (domEelement.classList.contains("panel-open")) {
                        var sectionElement = document.querySelector("section.page")
                        scrollTo(sectionElement, domEelement.offsetTop - 60, 200);
                    }
                }
                scope.collapsing = status;
            });
        }
    };
}
