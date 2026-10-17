api.controller = function($window, $scope) {
    var c = this;

    c.favArray = [];
    for (var i = 0; i < c.data.favoriteCountForWidget; i++) {
        c.favArray.push(i);
    }

    // Computing the no of dots to be shown below the carousel
    c.computeIndicatorDots = function() {
        var value = Math.ceil(c.data.noOfCards / c.getCardsInView());
        $scope.$applyAsync(function() {
          c.indicatorDots = value === 1 ? 0 : value;
        });
    };

    // no of cards visible in the flex container
    c.getCardsInView = function() {
        var value = parseInt(Math.floor(c.getCardsContainerWidth() / c.getCardHolderWidth()));
        return value ? value : 1;
    };

    c.getCardsContainer = function() {
        return $(".favorite-section");
    };

    c.getCardsContainerWidth = function() {
        return $(".favorite-section").width();
    };

    // Returns card width + margin
    c.getCardHolderWidth = function() {
        return c.getCardHolder().outerWidth(true);
    };

    c.getCardHolder = function() {
        return $(".favorite-body-content");
    };

    /* @param: swipeRotation - the no of rotations/swipes you need to move the flex container
     * @param: swipeRotationDirection - the direction you wish to swipe - 'right' or 'left'
     * @return: the scroll value for the movement of the card
     */
    c.getScrollLength = function(swipeRotation, swipeRotationDirection) {
        var scrollValue = 0;
        for (var i = 0; i < swipeRotation; i++) {
            var cardRightMargin = (c.getCardHolder().outerWidth(true) - c.getCardHolder().outerWidth(false));
            var cardsVisible = c.getCardsInView(); // no of cards visible in the flexbox container

            if (c.activeIndicatorIndex == (c.indicatorDots - 1)) {
                // Figuring out the cut out card width
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

    // Move cards right
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
            $(".favorite-footer .favorite-carousel-indicator:not(.hidden)")[0].focus();
        }
        $("div.slide-control").blur();
        c.setCardTabIndices();
    };

    // Move cards left
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
            $(".favorite-section .card-item")[0].focus();
        }
        $("div.slide-control").blur();
        c.setCardTabIndices();
    };

    // Function to swipe to a particular indicator
    c.indicatorNavigation = function(index, $event) {
        if ($event && $event.type == "keypress")
            $event.preventDefault();
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

    // Toggle tabindex of tabbable items inside non-tabbable favorite cards.
    function toggleTabIndex(elem, setTabbable) {
        var card = elem.find('.card-item');
        var favoriteBtn = elem.find('.favorite-button');
        if (setTabbable) {
            card.attr('tabindex', '0');
            favoriteBtn.attr('tabindex', '0');
            card.attr('aria-hidden', 'false');
            favoriteBtn.attr('aria-hidden', 'false');
        } else {
            card.attr('tabindex', '-1');
            favoriteBtn.attr('tabindex', '-1');
            card.attr('aria-hidden', 'true');
            favoriteBtn.attr('aria-hidden', 'true');
        }
    }

    c.setCardTabIndices = function() {
        var favoriteCards = $('.card-item-container');

        //If indicatorDots don't exist
        if (c.indicatorDots == null)
            c.computeIndicatorDots();

        if (c.indicatorDots == 0) {
            favoriteCards.each(function() {
                toggleTabIndex($(this), true);
            });
            return 0;
        }

        var lastCardIndex = c.data.noOfCards - 1;
        var cardsVisible = c.getCardsInView();

        favoriteCards.each(function(index) {
            var favoriteCard = $(this);
            // When the active indicator dot is in the end 
            if (c.activeIndicatorIndex == (c.indicatorDots - 1)) {
                if ((lastCardIndex - cardsVisible) < index &&
                    index <= (lastCardIndex)) {
                    toggleTabIndex(favoriteCard, true);
                    return;
                }
            }

            if (c.activeIndicatorIndex * cardsVisible <= index &&
                index < ((c.activeIndicatorIndex + 1) * cardsVisible)) {
                toggleTabIndex(favoriteCard, true);
                return;
            }
            toggleTabIndex(favoriteCard, false);
        });
    };

    c.getFooterClass = function() {
        if (c.data.isCarouselView) {
            var width = getWidgetWidth();
            return (width > 500 ? 'scrolling-panel-footer' : 'scrolling-panel-footer-mobile');
        }
        return '';
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

        c.getCardHolder().width(cardWidth - cardRightMargin);
    };

    function getWidgetWidth() {
        return $('.your-favorites-container').width();
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

    c.computeCarousel = function() {
        setTimeout(function() {
            c.activeIndicatorIndex = 0;
            c.setCarouselCardWidth();
            c.computeIndicatorDots();
            c.setCardTabIndices();
        });
    };

    function resetCarousel() {
        c.getCardsContainer().animate({
            scrollLeft: 0
        }, 100);
        c.computeCarousel();
    }

    var appWindow = angular.element($window);
    appWindow.bind('resize', _.debounce(function() {
        if (c.data.isCarouselView && c.data.noOfCards > 0) {
            resetCarousel();
        }
    }, 500));


    function handleTextOnlyZoom() {
        var fontSize = getComputedStyle(document.documentElement).fontSize;
        setInterval(function() {
            var currentFontSize = getComputedStyle(document.documentElement).fontSize;
            if (fontSize !== currentFontSize) {
                fontSize = currentFontSize;
                resetCarousel();
            }
        }, 500);
    }

    c.asyncUpdate = function() {
        c.server.update().then(function() {
            if (c.data.isCarouselView && c.data.noOfCards > 0) {
                c.computeCarousel();
                handleTextOnlyZoom();
            }
        });
    };
    var load_config = c.data.load_config;
    if (load_config === "Async"  && !c.data.asyncLoad) {
        setTimeout(c.asyncUpdate);
    } else {
        if (c.data.isCarouselView && c.data.noOfCards > 0) {
            c.computeCarousel();
            handleTextOnlyZoom();
        }
    }
};
