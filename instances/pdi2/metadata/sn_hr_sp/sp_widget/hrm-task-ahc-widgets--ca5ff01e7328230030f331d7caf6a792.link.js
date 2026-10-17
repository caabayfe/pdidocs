function link(scope, element, attrs, controller) {

    function popoverFocusTrap() {

        var focusElements = document.querySelectorAll('[id^="task_popup_menuitem_"]');
        for (var eleCount = 0; eleCount < focusElements.length; eleCount++) {

            focusElements[eleCount].addEventListener('keydown', function(e) {
                var focusableEls = this.querySelectorAll('a[href]:not([ng-disabled]), button:not([ng-disabled]), textarea:not([ng-disabled]),input[type="button"]:not([ng-disabled=true]), input[type="text"]:not([ng-disabled]), input[type="radio"]:not([ng-disabled]), input[type="checkbox"]:not([ng-disabled]), select:not([ng-disabled])');
                var firstFocusableEl = focusableEls[0];
                var lastFocusableEl = focusableEls[focusableEls.length - 1];
                var KEYCODE_TAB = 9;
                var isTabPressed = (e.key === 'Tab' || e.keyCode === KEYCODE_TAB);

                if (!isTabPressed) {
                    return;
                }

                if (e.shiftKey) /* shift + tab */ {
                    if (document.activeElement === firstFocusableEl) {
                        lastFocusableEl.focus();
                        e.preventDefault();
                    }
                } else /* tab */ {
                    if (document.activeElement === lastFocusableEl) {
                        firstFocusableEl.focus();
                        e.preventDefault();
                    }
                }
            });
        }
    }

    function focusToFirstElemnt() {
        var elements = document.querySelectorAll('[id^="mobile_task_dropdown_menu_item"]');
        for (var eleCount = 0; eleCount < elements.length; eleCount++) {
            elements[eleCount].addEventListener('keydown', function(event) {
                if ((event.which == 13 || event.which == 32)) {
                    this.click();
                    if (this.id.endsWith('activity')) {
                        setTimeout(function() {
                            document.getElementById('task_popup_item_activity').focus();
                        }, 350);
                    } else {
                        setTimeout(function() {
                            document.getElementById('task_popup_item_attachment').focus();
                        }, 350);
                    }

                }

            });
        }

        var chatElement = document.getElementById("mobile_chat");
		if (chatElement)
			chatElement.addEventListener('keydown', function(event) {
				if ((event.which == 13 || event.which == 32)) {
					this.click();
					setTimeout(function() {
						document.getElementById('task_popup_item_chat').focus();
					}, 350);

				}
			});
    }
    setTimeout(function() {
        popoverFocusTrap();
        focusToFirstElemnt();
    }, 10);
}
