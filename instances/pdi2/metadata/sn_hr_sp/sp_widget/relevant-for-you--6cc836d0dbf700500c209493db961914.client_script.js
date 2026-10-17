function($scope, $window, $timeout, $interval) {
    /* widget controller */
    var c = this;
    var stop;
    var defaultFontSize = '16px';
    var focusableElementPresent = false;
    //list of all possible focusable elements inside card in reverse tab order.
    var focusableElmtSelectors = ['.favorite-button'];

    c.sectionWidth = 252;
    c.trackCount = 0;
    c.rightVisible = false;
    c.leftVisible = false;
    c.tracker = 0;

    c.getDashboardParentNode = function() {
        return $('.instance-' + c.data.instanceId);
    }

    c.getContentsSectionNode = function() {
        return $('.' + c.data.instanceId + '-contents-section');
    }

    c.getSwipeNode = function(pos) {
        return $('.' + c.data.instanceId + '-' + pos + '-swipe');
    }

    c.getScrollLength = function() {
        return parseInt((c.sectionProportion() * $('.' + c.data.instanceId + '-body-content').innerWidth()));
    }

    c.getSectionWidth = function() {
        return c.getDashboardParentNode().outerWidth();
    }

    c.sectionProportion = function() {
        var value = parseInt(Math.floor(c.getSectionWidth() / c.sectionWidth));
        return value ? value : 1;
    }

    c.getRightSwipeMargin = function() {
        return (parseInt(c.getSectionWidth() - 25)) + 'px';
    }

    c.moveLeft = function() {
        var scrollVal = c.getScrollLength();
        var leftPos = c.getContentsSectionNode().scrollLeft();
        c.getContentsSectionNode().animate({
            scrollLeft: leftPos - scrollVal
        }, 100);

        c.swipeLeft();
    }

    c.moveRight = function() {
        var scrollVal = c.getScrollLength();
        var leftPos = c.getContentsSectionNode().scrollLeft();
        c.getContentsSectionNode().animate({
            scrollLeft: leftPos + scrollVal
        }, 100);

        c.swipeRight();

    }

    c.swipeInitialize = function() {
        c.trackCount = 0;
        c.rightVisible = false;
        c.leftVisible = false;
        var currentWidth = c.getSectionWidth();

        if (c.trackCount == 0 && c.rightVisible == false) {
            var totalCards = c.data.widgetsData.length;
            if (totalCards > c.sectionProportion()) {
                c.rightVisible = true;
            }
        }

        if (c.getSwipeNode('right').length > 0) {
            document.querySelector('#' + c.data.instanceId + '-right-swipe').style.marginLeft = (parseInt(currentWidth) - 20) + 'px';
        }

    }

    c.swipeRight = function() {
        var totalCards = c.data.widgetsData.length;
        var trace = c.trackCount + c.sectionProportion();
        if ((totalCards - trace) >= c.sectionProportion()) {
            c.trackCount = trace;
        } else {
            c.trackCount = totalCards - 1;
        }
    }

    c.showRightArrow = function() {
        var totalCards = c.data.widgetsData.length;
        var cardsDisplayed = c.sectionProportion();
        var p = c.getSectionWidth();

        if (cardsDisplayed >= totalCards) return false;

        else if (c.trackCount == 0) return true;

        else if ((cardsDisplayed == 1) && (c.trackCount >= (totalCards - cardsDisplayed))) return false;

        else if ((cardsDisplayed > 1) && c.trackCount >= (totalCards - cardsDisplayed)) return false;

        else if (cardsDisplayed == totalCards) return false;

        else return true;
    }

    c.showLeftArrow = function() {
        var totalCards = c.data.widgetsData.length;
        var cardsDisplayed = c.sectionProportion();

        if (c.trackCount == 0) return false;

        else if (cardsDisplayed == totalCards) return false;

        else if (c.trackCount >= (c.data.widgetsData.length - 1)) return true;

        else return true;

    }

    c.swipeLeft = function() {
        var totalCards = c.data.widgetsData.length;
        var trace = c.trackCount - c.sectionProportion();

        if (trace >= c.sectionProportion())
            c.trackCount -= c.sectionProportion();
        else {
            c.trackCount = 0;
        }
    }

    c.focusableElmtInsideCard = function() {
        var widgetSection = document.querySelector('.contents-section');
        for (var i = 0; i <= focusableElmtSelectors.length - 1; i++) {
            if (widgetSection && widgetSection.querySelector(focusableElmtSelectors[i])) {
                focusableElementPresent = true;
                break;
            }
        }
    }

    var appWindow = angular.element($window);
    appWindow.bind('resize', resetSwipe);


    function resetSwipe() {
        $scope.$apply();
    }

    function loadData() {
        c.data.action = "loadData";
		// widget options passed from client script to server script
		c.data.widgetOptions = $scope.options;
        c.server.update().then(function() {
            fetchRFYData();
        });
    }

    c.navigate = function(object) {
        var url = "?id=kb_article&sys_id=" + object.sys_id

        if (object.itemType == 'Request')
            url = object.href;

        $window.open(url, '_self');
    }

    c.createPolling = function() {
        stop = $interval(function() {
            var currentFontSize = $("#body-content").css('font-size');
            if (defaultFontSize !== currentFontSize) {
                defaultFontSize = currentFontSize;
                c.sectionWidth = $('.' + c.data.instanceId + '-body-content').innerWidth();
                c.showRightArrow();
            }
        }, 1000);
    };

    c.setFocus = function(focusableElement) {
        setTimeout(function() {
            focusableElement.focus({
                preventScroll: true
            });
        }, 0);
    }

    $scope.$on('$destroy', function() {
        // Make sure that the interval is destroyed too
        if (angular.isDefined(stop)) {
            $interval.cancel(stop);
            stop = undefined;
        }
    });

    c.setEventListeners = function() {
        if (c.options.card_behaviour === 'single' && c.data.listType === 'card-list') {
            var containerSelector = 'div.instance-' + c.data.instanceId;
            var cardSelector = '.flex-item-card';
            var contentCardSelector = ".content-card";
            var container = document.querySelector(containerSelector);
            if (container) {
                //convert to an array so that we can use array functions.
                c.cardElements = Array.from(container.querySelectorAll(cardSelector));
                c.cardElements.forEach(function(node, index) {
                    node.addEventListener('keydown', function(e) {
                        if (e && e.currentTarget && e.currentTarget.offsetParent) {
                            var currentIndex = c.cardElements.indexOf(e.currentTarget.closest(".flex-item-card"));
                            if (currentIndex === 0) {
                                c.trackCount = 0;
                            }
                            var containerRect = e.currentTarget.offsetParent.getBoundingClientRect();
                            var focusableElement;

                            // check if tab is clicked with out shift and the tabbed element is not last element
                            if (e.which == 9 && !e.shiftKey && currentIndex < c.cardElements.length - 1) {
                                //check if any of the cards have focusable elements inside them.
                                if (!focusableElementPresent) {
                                    focusableElement = c.cardElements[currentIndex + 1];
                                    //get coordinates of the container and card element to determine if we have to move them.
                                    var focusedRect = focusableElement.getBoundingClientRect();
                                    var parentPositionFromLeft = containerRect.left + containerRect.width;
                                    var currentPositionFromLeft = focusedRect.left + focusedRect.width;
                                    if (parentPositionFromLeft < currentPositionFromLeft) {
                                        c.moveRight();
                                    }
                                } else {
                                    var lastFocusableElement;
                                    for (var i = 0; i <= focusableElmtSelectors.length - 1; i++) {
                                        lastFocusableElement = e.currentTarget.querySelector(focusableElmtSelectors[i]);
                                        if (lastFocusableElement) {
                                            break;
                                        }
                                    }
                                    if (!lastFocusableElement || e.target == lastFocusableElement) {
                                        focusableElement = c.cardElements[currentIndex + 1];
                                        //get coordinates of the container and card element to determine if we have to move them.
                                        var focusedRect = focusableElement.getBoundingClientRect();
                                        var parentPositionFromLeft = containerRect.left + containerRect.width;
                                        var currentPositionFromLeft = focusedRect.left + focusedRect.width;
                                        if (parentPositionFromLeft < currentPositionFromLeft) {
                                            c.moveRight();
                                        }
                                    }
                                }
                            }

                            // check if tab is clicked with shift and the tabbed element is not first element
                            else if (e.which === 9 && e.shiftKey && currentIndex > 0) {
                                //check if any of the cards have focusable elements inside them.
                                if (!focusableElementPresent) {
                                    focusableElement = c.cardElements[currentIndex - 1];
                                    var newFocuredRect = focusableElement.getBoundingClientRect();
                                    if (newFocuredRect.left < containerRect.left) {
                                        c.moveLeft();
                                    }
                                } else {
                                    //check if event is triggered by card itself.
                                    if ($(e.target).hasClass("content-card")) {
                                        var leftCardLastFocusableElement;
                                        var leftCard = c.cardElements[currentIndex - 1];
                                        for (var k = 0; k <= focusableElmtSelectors.length - 1; k++) {
                                            leftCardLastFocusableElement = leftCard.querySelector(focusableElmtSelectors[k]);
                                            if (leftCardLastFocusableElement) {
                                                break;
                                            }
                                        }
                                        //Check if left card does not have focusable element
                                        if (!leftCardLastFocusableElement) {
                                            focusableElement = c.cardElements[currentIndex - 1];
                                            var newFocuredRect = focusableElement.getBoundingClientRect();
                                            if (newFocuredRect.left < containerRect.left) {
                                                c.moveLeft();
                                            }
                                        } else {
                                            focusableElement = c.cardElements[currentIndex - 1];
                                            var newFocuredRect = focusableElement.getBoundingClientRect();
                                            if (newFocuredRect.left < containerRect.left) {
                                                c.moveLeft();
                                            }
                                        }
                                    } else {
                                        var firstFocusableElement;
                                        for (var j = focusableElmtSelectors.length - 1; j >= 0; j--) {
                                            firstFocusableElement = e.currentTarget.querySelector(focusableElmtSelectors[j]);
                                            if (firstFocusableElement) {
                                                break;
                                            }
                                        }
                                        //check if event is triggered by first focusable element inside card.
                                        if (firstFocusableElement && firstFocusableElement == e.target) {
                                            focusableElement = c.cardElements[currentIndex];
                                        }
                                    }
                                }
                            }
                            $scope.$apply();
                        }
                    });
                })
            }

        }

    }

    var fetchRFYData = function() {
        $timeout(function() {
            $scope.isLoading = false;
            c.focusableElmtInsideCard();
            c.setEventListeners();
            c.createPolling();
        }, 50);
    };

    var load_config = c.data.load_config;
    if (load_config === "async" && !c.data.asyncLoad)
        $scope.$applyAsync(loadData);
    else
        fetchRFYData();
}
