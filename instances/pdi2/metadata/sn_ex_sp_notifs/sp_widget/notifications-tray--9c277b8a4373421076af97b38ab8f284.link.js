function link(scope, element, attrs, controller) {
    let page = angular.element('.page');
    let notificationPanel = element.find('.notifications-panel').get(0);
    let contentContainer = element.find('.notification-content-container').get(0);
    let notificationCards = [];

    let indexCards = function() {
        notificationCards = element.find('.notification-container');
    };

    let loadNotifications = function() {
        controller.server.get({
            action: 'loadMoreNotifications',
            firstLoadTime: controller.data.firstLoadTime,
            offset: controller.data.offset,
            userNotifications: scope.userNotifications,
            stopLoading: scope.stopLoading,
            viewUnreadNotifications: scope.viewUnreadNotifications,
            filterQuery: scope.notificationFilter,
            actions: controller.data.actions
        }).then(function(resp) {
            scope.userNotifications = resp.data.userNotifications;
            controller.data.offset = resp.data.offset;
            scope.stopLoading = resp.data.stopLoading;
            indexCards();
        }).catch(function(error) {
            console.error("Error\n", error);
        }).finally(function() {
            scope.isLoadingMore = false;
        });
    };

    let handleScroll = function() {
        if (scope.stopLoading)
            return;
        scope.isLoadingMore = true;
        if (contentContainer.scrollTop + contentContainer.clientHeight >= contentContainer.scrollHeight - 60) {
            loadNotifications();
        }
    };

    let closeTray = function() {
        scope.$emit('CLOSE_NOTIFICATION_TRAY');
        scope.$destroy();
    };

    let getFocusableElementWithinCards = function(currentFocus, direction) {
        const focusableElements = Array.from(contentContainer.querySelectorAll('.notification-container, .button-action, .undo-btn'));
        const currentIndex = focusableElements.indexOf(currentFocus);
        let targetIndex = 0;
        if (direction === 'next') targetIndex = currentIndex + 1;
        if (direction === 'prev') targetIndex = currentIndex - 1;
        return {
            'element': focusableElements[targetIndex],
            'index': targetIndex,
            'prevIndex': currentIndex
        };
    };

    let currentCardIndex = 0;
    let selectedCard = null;
    let classes = ['action-item'];

    

    let handleCardNavigation = function(event) {
        const currentFocus = document.activeElement;
        const isFocusOnNonTrayElements = classes.some(cls => currentFocus.classList.contains(cls));
        if (!isFocusOnNonTrayElements) {
            indexCards();
            switch (event.key) {
                case 'ArrowUp':
                    event.preventDefault();
                    if (currentCardIndex > 0) {
                        currentCardIndex--;
                        selectedCard = notificationCards[currentCardIndex];
                        selectedCard.focus();
                        selectedCard.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest'
                        });
                    }
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    if (currentCardIndex < notificationCards.length - 1) {
                        currentCardIndex++;
                        selectedCard = notificationCards[currentCardIndex];
                        selectedCard.focus();
                        selectedCard.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest'
                        });
                    } else if (currentCardIndex == notificationCards.length - 1) {
                        scrollToBottom();
                    }
                    break;
                case 'Enter':
                case ' ':
                    if (!event.target.classList.contains('dropdown-toggle') && !event.target.classList.contains('undo-btn')) {
                        event.preventDefault();
                        if (selectedCard) {
                            closeTray();
                        }
                    }
                    break;
                case 'Escape':
                    event.preventDefault();
                    closeTray();
                    setTimeout(function() {
                        $(".btn-bell").focus();
                    });
                    break;
                case 'Tab':
                    event.preventDefault();
                    const currentFocus = document.activeElement;
                    let target;
                    if (!event.shiftKey) {
                        target = getFocusableElementWithinCards(currentFocus, 'next');
                        if (target.element && (!target.element.classList.contains('button-action') && !target.element.classList.contains('undo-btn'))) {
                            if (currentCardIndex < notificationCards.length - 1) {
                                currentCardIndex++;
                            }
                        }
                        if (currentCardIndex == notificationCards.length - 1) {
                            scrollToBottom();
                        }
                    } else if (event.shiftKey) {
                        target = getFocusableElementWithinCards(currentFocus, 'prev');
                        let currentIndex = target.prevIndex;
                        if (currentIndex === 0) {
                            let notificationBadge = document.querySelector('.new-notification-indicator');
                            let filter = document.querySelector('.notification-filters > .filter-notifications-dropdown > .btn-filter-by');
                            if (notificationBadge && (document.activeElement !== notificationBadge)) {
                                notificationBadge.focus();
                            } else {
                                if (filter) {
                                    filter.focus();
                                } else {
                                    document.querySelector('.selection-remove').focus();
                                }
                            }
                            return;
                        }
                        if (target.element && (target.element.classList.contains('button-action') || target.element.classList.contains('undo-btn'))) {
                            if (currentCardIndex > 0) {
                                currentCardIndex--;
                            }
                        }
                    }
                    if (target.element) {
                        target.element.focus();
                    } else {
                        closeTray();
                        setTimeout(function() {
                            $(".btn-bell").focus();
                        });
                    }
                    break;
                default:
                    break;
            }
        }
    };

    let handlePanelNavigation = function(event) {
        let currentFocus = document.activeElement;
        const isFocusOnNonTrayElements = currentFocus.classList.contains('button-action');
        if (!isFocusOnNonTrayElements) {
            switch (event.key) {
                case 'Escape':
                    event.preventDefault();
                    break;
                case 'Tab':
                    if (event.shiftKey) { // Shift + Tab
                        currentFocus = document.activeElement;
                        if (currentFocus.classList.contains('btn-utility-menu')) {
                            closeTray();
                        }
                        handleDropdownItemFocusOut(currentFocus, true);
                    } else { // Tab
                        currentFocus = document.activeElement;
                        if (!scope.userNotifications.length && currentFocus.classList.contains('btn-filter-by')) {
                            event.preventDefault();
                            closeTray();
                            setTimeout(function() {
                                $(".btn-bell").focus();
                            });
                        }
                        handleDropdownItemFocusOut(currentFocus, false);
                    }
                    break;
                default:
                    break;
            }
        }
    };
    const handleDropdownItemFocusOut = (currentFocus, isPrev) => {
        if (currentFocus.classList.contains('action-item')) {
            let openDropdownEle = element.find('.action-dropdown.open a.action-item');
            let length = openDropdownEle?.length;
            if (length && length > 0) {
                if (isPrev && currentFocus == openDropdownEle.get(0)) {
                    element.find('.action-dropdown.open').removeClass('open');
                }
                if (!isPrev && currentFocus == openDropdownEle.get(length - 1)) {
                    element.find('.action-dropdown.open').removeClass('open');
                }
            }
        }
    };

    const handleDropdownHeaderFocus = (event) => {
        const dropdown = $(event.currentTarget);
        const firstChild = dropdown.find('.action-dropdown.open .dropdown-menu li:first-child');
        const target = firstChild.hasClass('dropdown-header') ?
            dropdown.find('.action-dropdown.open .dropdown-menu li:not(:first-child) a').get(0) :
            dropdown.find('.dropdown-menu li:first-child a');

        setTimeout(() => {
            target.focus();
        }, 10);
    };
    $(document).on('shown.bs.dropdown', handleDropdownHeaderFocus);

    let outsideClick = function(event) {
        const selectors = [
            '.notifications-bell-container',
            '.notifications-panel',
            '.dropdown-menu-filter',
            '.new-notification-indicator',
            '.selected-filter'
        ];

        const isOutsideClick = selectors.every(selector => !event.target.closest(selector));

        if (isOutsideClick) {
            closeTray();
        }
    };

    let escapeClose = function(event) {
        let currentFocus = document.activeElement;
        if (event.key === 'Escape') {
            const focusClasses = ['action-item', 'global-filter-item', 'filter-item'];
            const hasFocusClass = focusClasses.some(cls => currentFocus.classList.contains(cls));
            if (!hasFocusClass) {
                closeTray();
                setTimeout(function() {
                    $(".btn-bell").focus();
                });
            }
        } else if (event.key === 'Tab') {
            setTimeout(function() {
                currentFocus = document.activeElement;
                if (currentFocus.parentElement.classList.contains('gt-menu-item')) {
                    closeTray();
                }

            });
        }

    };

    function scrollToBottom() {
        contentContainer.scrollTo({
            top: contentContainer.scrollHeight,
            behavior: 'smooth',
        });
    }

    contentContainer.addEventListener('scroll', _.throttle(handleScroll, 2000));
    contentContainer.addEventListener('keydown', handleCardNavigation);
    notificationPanel.addEventListener('keydown', handlePanelNavigation);
    window.addEventListener('resize', controller.handleResize);

    document.addEventListener('click', outsideClick, true);
    page.on('keydown', escapeClose);

    controller.handleSwitchKeydown = function(event) {
        if (event.key === " " || event.key === "Enter") {
            event.preventDefault(); // Prevent scrolling
            controller.toggleUnreadNotifications();
        }
    };

    scope.$on('$destroy', function() {
        if (contentContainer) {
            contentContainer.removeEventListener('scroll', handleScroll);
            contentContainer.removeEventListener('keydown', handleCardNavigation);
            contentContainer.removeEventListener('shown.bs.dropdown', handleDropdownHeaderFocus);
        }
        if (notificationPanel) {
            notificationPanel.removeEventListener('keydown', handlePanelNavigation);
        }
        window.removeEventListener('resize', controller.handleResize);
        page.off('keydown', escapeClose);
        document.removeEventListener('click', outsideClick, true);
    });
}
