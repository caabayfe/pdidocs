api.controller = function($scope) {
    var CONST = {
        'BORDER_COLOR': 'border-color',
        'TOPIC_SELECTOR': '.popular-topic-body-container',
        'FN_RESIZE': 'resizePopularTopicWidget',
        'CONTAINER': '.container',
        'SMALL': 'small',
        'NO_ICON': 'no-icon',
        'POPULAR_TOPIC_BODY': '.popular-topic-body',
        'IE_PREFIX': 'Trident/',
        'IE': 'ie',
        'MARGIN': 'mr-0',
        'H5_SELECTOR': '.popular-topic-caption .popular-topic-title',
        'FONT_SIZE': 'font-size',
        'FIXED_COUNT': 4,
        'LIMIT': 12
    };
    var c = this;
    $scope.isLoading = false;
    var data = c.data;
    $scope.isFixed = false;
    var isIE = window.navigator.userAgent.indexOf(CONST.IE_PREFIX) !== -1;

    /**
     * Return the theme class
     * @return  {string} themeClass - Theme class
     *
     */
    $scope.getClass = function() {
        var isHex = data && data.isHex || false;
        return !isHex ? getThemeClass(data.borderColor) : "";
    };

    /**
     * Return the style object
     * @return  {object} style - Style object
     *
     */
    $scope.getStyle = function() {
        var style = {};
        style[CONST.BORDER_COLOR] = data && data.hexcode;
        var isHex = data && data.isHex || false;
        return isHex ? style : {};
    };

    var registered = false;
    var resizeEvents = $._data(window, "events").resize;
    if (resizeEvents) {
        resizeEvents.forEach(function(callback) {
            var handler = callback.handler;
            var name = handler.name;
            if (name === CONST.FN_RESIZE) {
                registered = true;
            }
        });
    }

    if (!registered) {
        $(window).resize(resizePopularTopicWidget);
    }

    $scope.$evalAsync(resizePopularTopicWidget);
    $scope.$evalAsync(topicTooltip);

    /**
     * Return theme class name based on option
     * @return  {string} theme-class - theme class name
     *
     */
    function getThemeClass(background) {
        var THEME = {
            'border-primary': 'primary-color',
            'border-secondary': 'secondary-color',
            'border-tertiary': 'tertiary-color'
        };
        var result = 'tertiary-color';
        if (background in THEME)
            result = THEME[background];

        return result;
    }

    /**
     * Resize the topic column based on the width
     */
    function resizePopularTopicWidget() {
        var topicCont = $(CONST.TOPIC_SELECTOR);
        if (isIE) {
            resizeWidgetIE(topicCont);
        }
        topicTooltip();
    }

    /**
     * IE responsive support
     */
    function resizeWidgetIE(topicCont) {
        var MIN_TOPIC_WIDTH = 150;
        var MAX_TOPIC_WIDTH = 250;
        var PADDING = 16;
        var MIN_BREAK_POINT = 330;
        var MOBILE_WIDTH = 400;
        $(CONST.TOPIC_SELECTOR).addClass(CONST.IE);
        topicCont.each(function(i, container) {
            var availablePanelWidth = getPanelWidth(container);
            var isSmall = $(container).hasClass(CONST.SMALL);
            var noIcon = $(container).hasClass(CONST.NO_ICON);
            var limit = CONST.LIMIT;
            var numberOfTopic = Math.min(Math.round(availablePanelWidth / MIN_TOPIC_WIDTH), limit);
            numberOfTopic = calcTopicCount(numberOfTopic, MIN_TOPIC_WIDTH, availablePanelWidth, PADDING, true);
            isSmall = true;
            if (availablePanelWidth <= MOBILE_WIDTH) {
                numberOfTopic = 2;
                if ((isSmall && !noIcon) || (availablePanelWidth <= MIN_BREAK_POINT)) {
                    numberOfTopic = 1;
                }
            }
            var topicWidth = Math.floor((availablePanelWidth - ((numberOfTopic) * PADDING) - 1) / numberOfTopic);
            topicWidth = (numberOfTopic === 1 && isSmall && !noIcon) ? availablePanelWidth : Math.min(topicWidth, MAX_TOPIC_WIDTH);
            var topicList = $(CONST.POPULAR_TOPIC_BODY, container);
            topicList.each(function(j, topic) {
                $(topic).css('width', topicWidth);
                if (isSmall && !noIcon) {
                    $(topic).css('max-width', 'inherit');
                }
            });
        });
    }

    /**
     * Calculating topic count to be shown
     */
    function calcTopicCount(topicCount, minTopicWidth, maxWidth, padWidth, isIE) {
        var calcWidth = calculateWidth(minTopicWidth, padWidth, topicCount, isIE);
        while ((topicCount > 0) && (calcWidth > maxWidth)) {
            topicCount--;
            calcWidth = calculateWidth(minTopicWidth, padWidth, topicCount, isIE);
        }
        return topicCount;
    }

    /**
     * Calacuate width based on available space
     */
    function calculateWidth(minTopicWidth, padWidth, topicCount, isIE) {
        var calcWidth = 0;
        var gridGapCount = topicCount - 1;
        if (isIE) {
            gridGapCount = topicCount;
        }
        calcWidth = (minTopicWidth * topicCount) + (gridGapCount * padWidth);
        return calcWidth;
    }

    /**
     * Get panel space of widget
     */
    function getPanelWidth(topicPanel) {
        var panelWidth = $(topicPanel).width();
        var parentWidth = $(topicPanel).parents(CONST.CONTAINER).width() || panelWidth;
        return Math.min(parentWidth, panelWidth);
    }

    /**
     * Checking ellipsis applied to topic names
     */
    function checkEllipsis(tooltip) {
        if (isIE) {
            return tooltip.scrollWidth > $(tooltip).parent().width();
        }
        var fontSize = parseFloat($(tooltip).css(CONST.FONT_SIZE));
        return (($(tooltip).height() + fontSize / 2) < tooltip.scrollHeight);
    }

    /**
     * Applying tooltip to ellipsis elements
     */
    function topicTooltip() {
        var topics = $(CONST.H5_SELECTOR);
        topics.tooltip('enable');
        topics.each(function(i, tooltip) {
            if (!checkEllipsis(tooltip)) {
                $(tooltip).tooltip('disable');
            }
        });
    }

    c.asyncGet = function() {
        $scope.isLoading = true;
        c.data.action = "loadData";
        c.server.update().then(function(response) {
            fetchPopularTopicsData();
        });
    }
    var fetchPopularTopicsData = function() {
        $scope.isLoading = false;
        $scope.isFixed = (data.popularTopics && (data.popularTopics.length < CONST.FIXED_COUNT)) || false;
        setTimeout(resizePopularTopicWidget);
        setTimeout(topicTooltip);
    };

    var load_config = c.data.load_config;
    if (load_config === "async" && !data.asyncLoad)
        setTimeout(c.asyncGet);
    else
        fetchPopularTopicsData();
}
