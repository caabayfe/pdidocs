function link(scope, element, attrs, controller) {
    controller.keyboardAction = function(event) {
        if (event.keyCode === 13 || event.keyCode === 32) {
            event.preventDefault();
            event.stopPropagation();
            event.target.click();
        }
    };
}
