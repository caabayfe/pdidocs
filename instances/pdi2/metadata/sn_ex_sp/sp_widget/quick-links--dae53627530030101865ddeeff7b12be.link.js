function link(scope, element, attrs, controller) {
    controller.keyboardAction = function(event,item) {
        if (event.keyCode == 13 || event.keyCode == 32) {
            event.preventDefault();
            event.stopPropagation();
            if (item.type == 'guided_help') {
                scope.clicked(item);
                return;
            }
            event.target.click();
        }
    };
}
