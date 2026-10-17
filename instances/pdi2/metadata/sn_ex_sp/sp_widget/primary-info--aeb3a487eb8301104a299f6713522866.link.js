function link($scope, element, attrs, c) {
    document.addEventListener('click', function(event) {
        event.stopPropagation();
        if (!c.showAllDelegatePopover || /show-delegate-popover/.test(event.target.className))
            return;

        var delegatePopover = elem[0].querySelector('.delegate-popover');
        if (delegatePopover)
            $scope.$apply(function() {
                c.showAllDelegatePopover = delegatePopover.contains(event.target);
            });
    });

    // hide popover on esc keypress
    document.onkeyup = function(e) {
        if (c.showAllDelegatePopover && e.keyCode === 27)
            // need to force $digest to remove delay
            $scope.$apply(function() {
                c.showAllDelegatePopover = false;
            });
    };
}
