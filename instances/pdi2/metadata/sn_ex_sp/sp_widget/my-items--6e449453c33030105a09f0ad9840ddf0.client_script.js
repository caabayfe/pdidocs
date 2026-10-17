api.controller = function($scope, $timeout, $location, $window) {
    var VIEW_DETAILS_CARD_TAB_INDEX = -9;
    var c = this;
    $scope.isLoading = false;


    c.redirect = function($event, url, target) {
        $event.stopPropagation();
        if (url) {
            target = target ? target : "_self";
            if (target === "_self") {
                $location.search(url.substr(1));
            } else {
                $window.open(url, target);
            }
        }
    };

    $scope.$on('isActionWidgetVisible', function(event, evntData) {
        event.stopPropagation();
        c.listViewData.every(function(listViewItem) {
            if (listViewItem.actionsContext === evntData.context) {
                listViewItem.isActionWidgetVisible = evntData.visibility;
                return false;
            }
            return true;
        });
    });

    $scope.$on('sn_ex_sp_action.result', function(event, actionOutput) {
        c.asyncGet();
    });

    c.checkForData = function() {
        if (!(c.primaryActivity) && !(c.secondaryActivity && c.secondaryActivity.length))
            return true;
        return false;
    };

    c.asyncGet = function() {
        c.data.action = "loadData";
        $scope.isLoading = true;
        c.server.update().then(function(response) {
            fetchMyItemsData();
            if (c.data.card_behaviour == 'single') {
                resetCarousel();
            } else {
                adaptCardGrid();
            }
            handleTextOnlyZoom();
        }).finally(function() {
            $scope.isLoading = false;
        });
    };

    var fetchMyItemsData = function() {
        if (!c.data.hideWidget) {
            c.activitySummaries = [];
            c.primaryActivity = c.data.activityDetails.primaryCountData.length ? c.data.activityDetails.primaryCountData[0] : null;
            c.secondaryActivity = c.data.activityDetails.summaryCountData;
            c.listViewData = c.data.activityDetails.listViewData;
            c.showViewAll = c.data.activityDetails.showViewAll;
            if (c.primaryActivity && c.primaryActivity.itemCount == 0) {
                c.activitySummaries.push(c.primaryActivity);
            }
            c.activitySummaries = c.activitySummaries.concat(c.secondaryActivity);
        }
    };

    var load_config = c.data.load_config;
    if (load_config === "async" && !c.data.asyncLoad) {
        $timeout(c.asyncGet);
    } else {
        fetchMyItemsData();
        if (c.data.card_behaviour == 'single') {
            resetCarousel();
        } else {
            adaptCardGrid();
        }
        handleTextOnlyZoom();
    }


    //Carousel methods

    c.getCardsContainer = function() {
        return $(".cards-flex-container");
    };

    c.getCardsContainerWidth = function() {
        return $(".cards-flex-container").width();
    };

    c.getCardHolder = function() {
        return $(".activity-card-holder-carousel");
    };

    //Returns card width + margin
    c.getCardHolderWidth = function() {
        return c.getCardHolder().outerWidth(true);
    };

    //Computing the no of dots to be shown below the carousel
    c.computeIndicatorDots = function() {
        var value = Math.ceil(c.data.noOfCards / c.getCardsInView());
        c.indicatorDots = value === 1 ? 0 : value;
    };


    /* @param: swipeRotation - the no of rotations/swipes you need to move the flex container
     * @param: swipeRotationDirection - the direction you wish to swipe - 'right' or 'left'
     *
     * @return: the scroll value for the movement of the card
     */

    c.getScrollLength = function(swipeRotation, swipeRotationDirection) {
        var scrollValue = 0;
        for (var i = 0; i < swipeRotation; i++) {
            var cardRightMargin = (c.getCardHolder().outerWidth(true) - c.getCardHolder().outerWidth(false));
            var cardsVisible = c.getCardsInView(); //no of cards visible in the flexbox container

            if (c.activeIndicatorIndex == (c.indicatorDots - 1)) {
                //Figuring out the cut out card width
                var cardsScrolledAtLast = c.data.noOfCards - cardsVisible * (c.indicatorDots - 1);
                var cutOffSectionWidth = c.getCardsContainerWidth() - (c.getCardsInView() * c.getCardHolderWidth());
                scrollValue += (cardsScrolledAtLast * c.getCardHolderWidth()) - cutOffSectionWidth - cardRightMargin;
            } else {
                scrollValue += c.getCardsInView() * c.getCardHolderWidth();
            }

            switch (swipeRotationDirection) {
                case "right":

                    if (c.activeIndicatorIndex < c.indicatorDots - 1)
                        c.activeIndicatorIndex++;
                    break;
                case "left":
                    if (c.activeIndicatorIndex > 0)
                        c.activeIndicatorIndex--;
                    break;
            }
        }
        return scrollValue;
    };

    //no of cards visible in the flex container
    c.getCardsInView = function() {
        var value = parseInt(Math.floor((c.getCardsContainerWidth()) / c.getCardHolderWidth()));
        return value ? value : 1;
    };

    //Move cards right
    c.swipeRight = function(swipeRotation, $event) {
        if ($event && $event.type == "keypress")
            return;
        var swipeRotationDirection = 'right';
        var scrollVal = c.getScrollLength(swipeRotation, swipeRotationDirection);
        var leftPos = c.getCardsContainer().scrollLeft();

        c.getCardsContainer().animate({
            scrollLeft: leftPos + scrollVal
        }, 100);
        // focus on the first indicator dot if we've reached the end of the carousel
        if ($event && c.activeIndicatorIndex === (c.indicatorDots - 1)) {
            $(".scrolling-panel-footer .activity-carousel-indicator:not(.hidden)")[0].focus();
        }
        $("div.slide-control").blur();
    };

    //Move cards left
    c.swipeLeft = function(swipeRotation, $event) {
        if ($event && $event.type == "keypress")
            return;
        var swipeRotationDirection = 'left';
        var scrollVal = c.getScrollLength(swipeRotation, swipeRotationDirection);
        var leftPos = c.getCardsContainer().scrollLeft();
        c.getCardsContainer().animate({
            scrollLeft: leftPos - scrollVal
        }, 100);
        // focus on the first card if we've reached the beginning of the carousel
        if ($event && c.activeIndicatorIndex === 0) {
          if ($('.activity-card').first().attr('tabindex') < 0) {
            var viewDetailsButton = $('.activity-card-holder').find('button');
	    if (viewDetailsButton.length > 0)
		viewDetailsButton.first().focus();
	    else 
	        $('.activity-card').first().focus();
         } else
             $('.activity-card').first().focus();
        }
        $("div.slide-control").blur();
    };

    //Function to swipe to a particular indicator
    c.indicatorNavigation = function(index, event) {
        if (event && event.type == 'keypress') {
            event.preventDefault();
        }
        var swipeRotation; //The no of swipes aka rotations that are needed for swipe
        if (index == c.activeIndicatorIndex)
            return;
        else if (index > c.activeIndicatorIndex) {
            swipeRotation = index - c.activeIndicatorIndex;
            c.swipeRight(swipeRotation);
        } else {
            swipeRotation = c.activeIndicatorIndex - index;
            c.swipeLeft(swipeRotation);
        }
    };

    //Toggle tabindex of tabbable items inside non-tabbable activity cards.
    function toggleTabIndex(index, setTabbable) {
        var CUSTOM_TAB_INDEX = '-7';
        if (setTabbable) {
            $('.activity-card').eq(index).siblings().find('[tabindex=' + CUSTOM_TAB_INDEX + ']').attr('aria-hidden', 'false');
            $('.activity-card').eq(index).siblings().find('[tabindex=' + CUSTOM_TAB_INDEX + ']').attr('tabindex', '0');
        } else {
            $('.activity-card').eq(index).siblings().find('a , button').attr('aria-hidden', 'true');
            $('.activity-card').eq(index).siblings().find('a , button').attr('tabindex', CUSTOM_TAB_INDEX);
        }
    }

    //Manually setting the tabIndex of the cards for A11y
    c.setCardTabIndex = function(index) {
        var isViewDetailsCard = !c.listViewData[index].isActionWidgetVisible && c.data.showViewDetails == 'true';

        if (c.data.card_behaviour == 'wrap') {
            return isViewDetailsCard ? VIEW_DETAILS_CARD_TAB_INDEX : 0;
        }
        //If indicatorDots don't exist
        if (c.indicatorDots == null)
            c.computeIndicatorDots();

        if (c.indicatorDots == 0) {
	    toggleTabIndex(index, true);
            return isViewDetailsCard ? VIEW_DETAILS_CARD_TAB_INDEX : 0;
        }

        var lastCardIndex = c.data.noOfCards - 1;
        var cardsVisible = c.getCardsInView();

        // When the active indicator dot is in the end 
        if (c.activeIndicatorIndex == (c.indicatorDots - 1)) {
            if ((lastCardIndex - cardsVisible) < index &&
                index <= (lastCardIndex)) {
                toggleTabIndex(index, true);
                return isViewDetailsCard ? VIEW_DETAILS_CARD_TAB_INDEX : 0;
            }
        }

        if (c.activeIndicatorIndex * cardsVisible <= index &&
            index < ((c.activeIndicatorIndex + 1) * cardsVisible)) {
            toggleTabIndex(index, true);
            return isViewDetailsCard ? VIEW_DETAILS_CARD_TAB_INDEX : 0;
        }

        toggleTabIndex(index, false);
        return -1;
    };
	
    c.setCardAriaHidden = function(index) {
	var tabIndex = c.setCardTabIndex(index);
	if (tabIndex == VIEW_DETAILS_CARD_TAB_INDEX) {
	   return false;
	}

	return tabIndex < 0 ? true : false;
    };

    function resetCarousel() {
        $timeout(function() {
            c.activeIndicatorIndex = 0;
            c.indicatorNavigation(0);
            c.setCarouselCardWidth();
            c.computeIndicatorDots();
        }, 100);
    }

    var appWindow = angular.element($window);
    appWindow.bind('resize', _.debounce(function() {
        if (c.data.card_behaviour === 'single' && !$scope.isLoading) {
            c.getCardsContainer().animate({
                scrollLeft: 0
            }, 100);
            resetCarousel();
        } else {
            adaptCardGrid();
        }
    }, 500));

    function handleTextOnlyZoom() {
        var fontSize = getComputedStyle(document.documentElement).fontSize;
        setInterval(function() {
            var currentFontSize = getComputedStyle(document.documentElement).fontSize;
            if (fontSize !== currentFontSize) {
                fontSize = currentFontSize;
                if (c.data.card_behaviour === 'single' && !$scope.isLoading) {
                    c.getCardsContainer().animate({
                        scrollLeft: 0
                    }, 100);
                    resetCarousel();
                } else {
                    adaptCardGrid();
                }
            }
        }, 500);
    }

    c.getIndicatorClass = function() {
        var width = getWidgetWidth();
        return (width > 500 ? 'activity-carousel-indicator-wrapper' : 'activity-carousel-indicator-wrapper-mobile');
    };

    c.setCarouselCardWidth = function() {
        var CAROUSEL_BASE_CARD = 200;
        var CAROUSEL_OFFSET = 25;
        var remToPixel = 10;
        // HTML font size on different devices which is used for conversion
        var deviceRemToPixel = $('html').css('font-size');
        deviceRemToPixel = parseFloat(deviceRemToPixel, 10);

        var containerWidth = c.getCardsContainerWidth();
        var cardRightMargin = c.getCardHolder().outerWidth(true) - c.getCardHolder().outerWidth(false),
            cardWidth = (CAROUSEL_BASE_CARD / remToPixel) * deviceRemToPixel,
            minCardWidth = cardWidth + cardRightMargin,
            cardWidthOffset = (CAROUSEL_OFFSET / remToPixel) * deviceRemToPixel;

        var availableContainerWidth = containerWidth - cardWidthOffset;
        var noOfCards = parseInt(Math.floor(availableContainerWidth / minCardWidth));

        noOfCards = c.data.noOfCards <= noOfCards ? c.data.noOfCards : noOfCards;
        var extraWidth = (c.data.noOfCards <= noOfCards ? containerWidth : availableContainerWidth) - (noOfCards * minCardWidth);
        if (noOfCards > 0)
            cardWidth = minCardWidth + (extraWidth / noOfCards);

        c.getCardHolder().width(Math.floor(cardWidth - cardRightMargin));
        $scope.$broadcast("sn_ex_sp.reEvaluateActionsWidth");
    };

    function getWidgetWidth() {
        return $('.my-items-container').width();
    }

    function adaptCardGrid() {
        $timeout(function() {
            var width = getWidgetWidth();
            var gridLayout = $('.my-items-container').find('.cards-grid-container');
            if (width <= 550) {
                gridLayout.addClass('grid-single-column');
                gridLayout.removeClass('grid-multi-column');
            } else {
                gridLayout.addClass('grid-multi-column');
                gridLayout.removeClass('grid-single-column');
            }
            $scope.$broadcast("sn_ex_sp.reEvaluateActionsWidth");
        }, 500);

    }

    c.getDotClass = function(index) {
        var start = getStart(c.activeIndicatorIndex + 1, c.indicatorDots);
        var end = getEnd(c.activeIndicatorIndex + 1, c.indicatorDots);
        var isActive = index === c.activeIndicatorIndex;
        var isSmall = (index === start - 1 && start > 1) || (index === end - 1 && end < c.indicatorDots);
        var isHidden = index < start - 1 || index > end - 1;
        return (isActive ? 'active ' : '') + (isSmall ? 'small ' : '') + (isHidden ? 'hidden' : '');
    };

    function getStart(currentPage, numberOfPages) {
        var firstDisplayablePage = currentPage - 2;
        var lastDisplayablePage = numberOfPages - 4;
        return Math.max(1, Math.min(firstDisplayablePage, lastDisplayablePage));
    }

    function getEnd(currentPage, numberOfPages) {
        var pagesToShow = 4;
        return Math.min(getStart(currentPage, numberOfPages) + pagesToShow, numberOfPages);
    }
};
