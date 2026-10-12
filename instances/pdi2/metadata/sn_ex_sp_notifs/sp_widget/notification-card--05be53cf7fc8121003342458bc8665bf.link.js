function link(scope, element, attrs, controller) {

    setTimeout(function() {
        let notification_container = element.find('.notification-container');
        if (notification_container) {
            notification_container.on('keydown', function(e) {
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    let button_action = element.find('.button-action');
                    let button_undo = element.find('.undo-btn');
                    if (button_action && button_action.is(":focus")) {
                        button_action.blur();
                        notification_container.focus();
                    } else if (button_undo && button_undo.is(":focus")) {
                        button_undo.blur();
                        notification_container.focus();
                    } else {
                        notification_container.blur();
                        if (button_action.length > 0)
                            button_action.focus();
                        else
                            button_undo.focus();
                    }
                }
            });
        }
    });

    controller.handleUndofocus = function(actionName) {
        setTimeout(function() {
            if (actionName == "CLEAR_NOTIFICATION") {
                element.find('.undo-btn').focus();
            } else if (actionName == "UNDO") {
                element.find('.notification-container').focus();
            }
        });
    }


    function handleDropdownPlacement(event) {
        const dropdownMenu = event.currentTarget.nextSibling.nextElementSibling;
        const dropdown = event.currentTarget.parentElement;
        const dropdownButton = event.currentTarget;
        const buttonRect = dropdownButton.getBoundingClientRect();
        const containerRect = angular.element('.notifications-panel').get(0).getBoundingClientRect();
        const cardContainerRect = angular.element('.notification-card-container').get(0).getBoundingClientRect();
        const viewportHeight = Math.min(containerRect.height, window.innerHeight); // tray height
        const menuHeight = dropdownMenu.offsetHeight;
        var spaceAvailableAtBottom = buttonRect.bottom - containerRect.top + menuHeight < viewportHeight;
        var spaceAvailableAtTop = buttonRect.top - menuHeight > cardContainerRect.top;
        if (!spaceAvailableAtBottom && spaceAvailableAtTop) {
            dropdown.classList.add('dropup');
            dropdown.classList.remove('dropdown');
        } else {
            dropdown.classList.add('dropdown');
            dropdown.classList.remove('dropup');
        }
    }

    controller.handleClick = function(event) {
        controller.timeout(() => {
            handleDropdownPlacement(event);
        });
    };

    controller.handleDropdownKeyPress = function($event) {
        if ($event.key === 'Enter' || $event.key === ' ') {
            controller.handleClick($event);
        }
    }

    controller.handleKeydown = function($event, action, data) {
        if ($event.key === 'Enter' || $event.key === ' ') {
            const element = document.activeElement;
            const targetButton = element.closest('.action-dropdown').querySelector('.button-action');
            $event.preventDefault();
            $event.stopPropagation();
            controller.handleAction($event, action, data);
            targetButton.focus();
        }
    };
}
