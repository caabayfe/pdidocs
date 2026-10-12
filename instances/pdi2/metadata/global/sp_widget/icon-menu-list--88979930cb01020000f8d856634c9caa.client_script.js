function($scope) {

    $scope.handleKeyPress = function(event, index) {
        var keyPressed = event.key;
        var preventDefaultKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

        if (preventDefaultKeys.indexOf(keyPressed) === -1)
            return;

        event.stopPropagation();
        event.preventDefault(); // so that it cannot cause page scroll.

        var currentSelectedCategory = $(event.currentTarget);
        var allCategories = currentSelectedCategory.closest('div.list-group').find('a.list-group-item');

        if (index < 0 || index === allCategories.length)
            return;

        var keyActions = {
            'ArrowUp': function() {
                return index - 1 > -1 ? allCategories[index - 1] : null;
            },
            'ArrowDown': function() {
                return index + 1 < allCategories.length ? allCategories[index + 1] : null;
            }
        }

        var newFocusedCategory = keyActions[keyPressed] && keyActions[keyPressed]();
        if (newFocusedCategory) {
            currentSelectedCategory.attr('tabindex', '-1');

            newFocusedCategory.setAttribute('tabindex', '0');
            newFocusedCategory.focus();
        }
    }
}
