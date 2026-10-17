api.controller = function($rootScope, $timeout, cabrillo, $sce) {
    var c = this;
    var MESP_POP_UP_CLOSE_EVENT_NAME = 'mesp.popup.close';
    //Set title of tab
    document.title = c.data.windowTitle;
    c.showFavorite = true;
    c.widgetTitleHtml = getHeadingHtml();
    init();

    // Set Title in Mobile
    if (c.data.isMobileApp) {
        setMobileTitle();
        setBannerHeight();
        //Event from MESP pop up close.
        var mespClosePopupUnregister = $rootScope.$on(MESP_POP_UP_CLOSE_EVENT_NAME, function() {
            setMobileTitle();
        });
        $timeout(function() {
            /* Cant get around with out important as mesp has container style with important */
            $('.container').attr('style', 'padding: 0px !important');
        });
    }

    $rootScope.$on('favorite', function(e, favorite) {
        if (favorite.table == 'topic') {
            c.showFavorite = favorite.showFavorite;
        }
    });

    function setBannerHeight() {
        if (c.data.displayMode !== "banner")
            return;
        $timeout(function() {
            var topicHeaderBannerImage = $('.topic-container').find('.topic-header-banner__image')[0];
            var topicHeaderBannerGradient = $('.topic-container').find('.topic-header-banner__gradient')[0];
            var topicHeaderBannerText = $('.topic-container').find('.topic-header-banner__text')[0];

            if (topicHeaderBannerText.offsetHeight > topicHeaderBannerImage.offsetHeight) {
                topicHeaderBannerImage.style.height = topicHeaderBannerText.offsetHeight + 'px';
                topicHeaderBannerGradient.style.height = topicHeaderBannerText.offsetHeight + 'px';
            }
        }, 0);
    }

    function setMobileTitle() {
        // Timeout is to give a better user experience otherwise when this popup closes/opens as it has transistion effects
        $timeout(function() {
            cabrillo.viewLayout.setTitle(c.data.topic.name);
        });
    }


    function init() {
        $timeout(function() {
            $rootScope.$broadcast('sp.update.breadcrumbs', c.data.breadcrumbs);
        });
    }

    function getHeadingHtml() {
        var headingHtml = '<' + c.data.headingLevel + ' class="topic-header-title">' + c.data.topic.name + '</' + c.data.headingLevel + '>';
        return $sce.trustAsHtml(headingHtml);
    }

    c.getIconColorClass = function() {
        if (c.options.icon_background_color &&
            c.options.icon_background_color.length > 0 &&
            c.options.icon_background_color !== 'custom') {
            return c.options.icon_background_color;
        }
        return '';
    };

    c.getIconBackgroundColor = function() {
        if (c.options.icon_background_color && c.options.icon_background_color.length > 0 && c.options.icon_background_color === 'custom' && c.options.icon_background_hexcode && c.options.icon_background_hexcode.length > 0) {
            return {
                'background-color': c.options.icon_background_hexcode
            };
        }
        return '';
    };

    c.getBannerColorClass = function() {
        if (c.options.banner_background_color &&
            c.options.banner_background_color.length > 0 &&
            c.options.banner_background_color !== 'custom') {
            return c.options.banner_background_color;
        }
        return '';
    };

    c.getTopicHeaderWithBannerClass = function() {
        var topicHeaderClass = 'topic-header-banner';
        if (c.data.isMobileApp) {
            topicHeaderClass = topicHeaderClass.concat(' ', 'topic-header-banner-mobile');
        }
        topicHeaderClass = topicHeaderClass.concat(' ', c.options.banner_text_overlay_color);
        return topicHeaderClass;
    };

    c.getBannerStyle = function() {
        var bannerStyle = {};
        if (c.options.banner_image_position && c.options.banner_image_position.includes(' ')) {
            var backgroundPosition = c.options.banner_image_position.split(" ");
            bannerStyle['background-position-x'] = backgroundPosition[0];
            bannerStyle['background-position-y'] = backgroundPosition[1];
        }
        bannerStyle['background-size'] = c.options.banner_image_display;
        bannerStyle['background-image'] = 'url(' + c.data.topic.banner + ')';
        if (c.options.banner_background_color === 'custom' &&
            c.options.banner_background_hexcode &&
            c.options.banner_background_hexcode.length > 0) {
            bannerStyle['background-color'] = c.options.banner_background_hexcode;
        }
        return bannerStyle;
    };

    c.getTransparency = function() {
        return {
            'opacity': c.options.banner_text_overlay_transparency
        };
    };
};
