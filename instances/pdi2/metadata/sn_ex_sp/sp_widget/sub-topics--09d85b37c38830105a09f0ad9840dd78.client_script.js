api.controller = function($scope, $window, $sce) {
    /* widget controller */
    var c = this;
    c.data.viewAllMode = false;
    $scope.widgetTitleHtml = getHeadingHtml();
    var SMALL_DEVICE_WIDTH = 500;
    var SUBTOPICS_BOX_HEIGHT = 50 + 10; // height + padding
    var SUBTOPICS_CONTAINER_HEIGHT_PADDING = 4;
    var pixelToRem = 10;
    if(c.data.isMobileApp) {	
        pixelToRem = 16;
    }

    // HTML font size on different devices which is used for conversion
    var perDevicePixelToRem = $('html').css('font-size');
    perDevicePixelToRem = parseFloat(perDevicePixelToRem, 10);

    // If pixelToRem == perDevicePixelToRem value will remain same, else will convert based on device
    SUBTOPICS_BOX_HEIGHT = (SUBTOPICS_BOX_HEIGHT / pixelToRem) * perDevicePixelToRem;
    SUBTOPICS_CONTAINER_HEIGHT_PADDING = (SUBTOPICS_CONTAINER_HEIGHT_PADDING / pixelToRem) * perDevicePixelToRem;
    var MIN_HEIGHT_FOR_SMALL_DEVICE = 3 * SUBTOPICS_BOX_HEIGHT; // 3 rows of subtopics

    c.viewAll = function(event) {
        event.preventDefault(); // prevent default scroll behavior on space
        if (event.type == 'keypress' && (event.which != '13' && event.which != '32'))
            return;
        c.data.action = "viewAll";
        var subtopicsContainer = $(".subtopics-container");
        if (subtopicsContainer) {
            subtopicsContainer.height("auto");
        }
        c.data.viewAllMode = true;
        var subtopics = $('.subtopics');
        // Update focus only when space or enter key is pressed
        if (event.which == '13' || event.which == '32') {
          for(var i = 0;i < subtopics.length; i++) {
            if(subtopics[i].getAttribute('tabindex') === '-1') {
                    subtopics[i].focus();
                    break;
                }
            }
        }
        $('.subtopics').removeAttr("tabindex");
        if (c.data.subTopicsFetchedFromSession) {
            return;
        }
        c.server.update().then(function() {
            c.data.action = "";
        });
    };

    c.getSubtopicsContainerStyle = function() {
        var style = {
            "height": "auto"
        };
        var subtopicsContainer = $(".subtopics-container");
        if (subtopicsContainer) {
            if (c.data.viewAllMode) {
                return style;
            } else {
                var subtopicsBoxHeightCSS = 50 + 10; // height + padding
                var subtopicsListHeight = subtopicsContainer.prop("scrollHeight");
                if ($window.innerWidth <= SMALL_DEVICE_WIDTH && subtopicsListHeight > MIN_HEIGHT_FOR_SMALL_DEVICE + SUBTOPICS_CONTAINER_HEIGHT_PADDING) {
                    style.height = ( 2 * subtopicsBoxHeightCSS ) / pixelToRem + "rem"; 
                    return style;
                } else if ($window.innerWidth > SMALL_DEVICE_WIDTH) {
                    style.height = subtopicsBoxHeightCSS / pixelToRem + "rem";
                    return style;
                } else {
                    return style;
                }
            }
        }
    };

    c.isHidden = function(index) {
        var subtopicsContainer = $(".subtopics-container");
        var subtopicsContainerHeight = subtopicsContainer.height();
        var subtopic = $("#subtopic-" + index);
        if (subtopic && subtopic.position() && subtopic.position().top) {
            return subtopic.position().top > subtopicsContainerHeight;
        }
        return true;
    };

    c.viewAllActive = function() {
        var subtopicsContainer = $(".subtopics-container");
        if (subtopicsContainer) {
            var subtopicsListHeight = subtopicsContainer.prop("scrollHeight");
            if ($window.innerWidth <= SMALL_DEVICE_WIDTH) {
                return subtopicsListHeight > MIN_HEIGHT_FOR_SMALL_DEVICE + SUBTOPICS_CONTAINER_HEIGHT_PADDING;
            } else {
                return subtopicsListHeight > SUBTOPICS_BOX_HEIGHT + SUBTOPICS_CONTAINER_HEIGHT_PADDING;
            }
        }
        return false;
    };

    c.server.get({
        topicLimit: 15,
        action: "getInitSubTopics",
        topicId: c.data.topicId
    }).then(function(response) {
        if (response) {
            c.data.subTopics = response.data.subTopics;
            c.data.showMore = response.data.showMore;
            c.data.lastTopic = response.data.lastTopic;
            c.data.offset = response.data.offset;
            c.data.action = "";
            c.data.subTopicsFetchedFromSession = response.data.subTopicsFetchedFromSession;
        }
    });

    function getHeadingHtml() {
        var headingHtml = '<' + c.data.headingLevel + '>' + c.data.subTopicHeader + '</' + c.data.headingLevel + '>';
        return $sce.trustAsHtml(headingHtml);
    }
    
    var resizeWindow = function() {
        $scope.$apply();
    };
    var appWindow = angular.element($window);
    appWindow.bind('resize', _.debounce(resizeWindow, 300));

};
