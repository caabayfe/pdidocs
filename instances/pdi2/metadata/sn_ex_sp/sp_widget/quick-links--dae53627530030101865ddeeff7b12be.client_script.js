api.controller = function($scope, $timeout, $window, snAnalytics, $sce) {
    /* widget controller */

    var c = this;
    $scope.isLoading = false;

    $scope.card_size = c.data.card_size;
    $scope.card_type = c.data.card_type;

    $scope.handleCardFocus = function(event) {
        var $target = $(event.target);
        var $titleEl = $target.find('.text-ellipsis[data-toggle="tooltip"]').first();
        if ($titleEl.length)
            $titleEl.tooltip("show");
    };

    $scope.handleCardBlur = function(event) {
        var $target = $(event.target);
        var $titleEl = $target.find('.text-ellipsis[data-toggle="tooltip"]').first();
        if ($titleEl.length)
            $titleEl.tooltip("hide");
    };

    $scope.clicked = function(item) {
        if (item.type == 'guided_help') {
            c.server.get({
                "action": "openGuidedhelp",
                "guidedHelpId": item.guided_help
            }).then(function(resp) {
                $timeout(function() {
                    $window.open(resp.data.guidedHelpResponse.url, '_self');
                }, raiseAppseeEvent(resp.data.guidedHelpResponse));
            });
        }
    };

    $scope.getCustomColor = function(styleClassFor) {
        var cssCustomClass = "";

        var supportedColors = {
            "Primary": "primary-color",
            "Dark": "dark-color",
            "Light": "light-color",
            "Accent": "accent-color",
            "Hexcode": ""
        };

        var darkColors = ['Primary', 'Dark', 'Accent'];

        switch (styleClassFor) {
            case 'background':
                cssCustomClass = (c.data.background_color) ? supportedColors[c.data.background_color] : '';
                break;
            case 'icon_overlay':
                cssCustomClass = supportedColors[c.data.icon_background_color];
                break;
            case 'text':
                if (c.data.text_color === 'false') {
                    cssCustomClass = 'text-color-black';
                    if (c.data.text_alignment === 'Default') {
                        if (darkColors.includes(c.data.background_color)) {
                            cssCustomClass = 'text-color-white';
                        }
                    } else {
                        if (c.data.show_background === 'false' && c.data.show_text_overlay === 'false') {
                            if (darkColors.includes(c.data.background_color)) {
                                cssCustomClass = 'text-color-white';
                            }
                        }
                    }
                }
                break;
        }
        return cssCustomClass;
    };

    $scope.getStyle = function(item, styleRequiredFor) {
        var styleObj = {};
        switch (styleRequiredFor) {
            case 'background':
                if (c.data.show_background === 'true' && c.data.card_type === 'Thumbnail' && c.data.text_alignment === 'Center' && item.bg_image && item.bg_image.length != 0) {
                    styleObj['background-image'] = 'url(' + item.bg_image + ')';
                }
                if (c.data.background_color === 'Hexcode') {
                    styleObj['background-color'] = c.data.background_hexcode;
                }
                if (item.type == 'guided_help') {
                    styleObj['cursor'] = 'pointer';
                }
                break;
            case 'icon_overlay':
                if (c.data.icon_background_color === 'true') {
                    styleObj['background-color'] = c.data.icon_background_hexcode;
                }
                break;
            case 'text_overlay':
                if (c.data.show_text_overlay === 'true') {
                    styleObj['background-color'] = hexToRGB(c.data.text_overlay_hexcode, '0.7');
                }
                break;
            case 'text':
                if (c.data.text_color === 'true') {
                    styleObj['color'] = c.data.text_color_hexcode;
                }
                break;
        }
        return styleObj;
    };

    $scope.getEvaluatedIconContainer = function(item) {
        switch (c.data.card_size) {
            case 'card-small':
                if (c.data.show_text_overlay === 'false') {
                    return 'icon-container--no-image-color';
                } else {
                    return 'icon-container--background-small';
                }
                break;
            case 'card-medium':
                if (c.data.show_text_overlay === 'false') {
                    if ((c.data.show_icon === 'true' && item.icon && item.icon.length == 0) || c.data.show_icon === 'false') {
                        return 'icon-container--no-image-color';
                    } else {
                        return 'icon-container--background-medium';
                    }
                }
                break;
        }
    }

    $scope.getEvaluatedContentContainer = function(item) {
        switch (c.data.card_size) {
            case 'card-small':
                return 'content-container--no-image-color';
            case 'card-medium':
                if (c.data.show_text_overlay === 'false') {
                    if (c.data.show_icon === 'true' && item.icon && item.icon.length != 0) {
                        return 'content-container--content-start';
                    } else {
                        return 'content-container--no-image-color';
                    }
                }
                break;
        }
    };

    $scope.getTextEllipsisClassForIE = function(item) {
        var cssClassName = "text-ellipsis-";
        if (c.data.card_size === 'card-medium') {
            cssClassName = cssClassName + "medium";
        } else {
            cssClassName = cssClassName + "small";
        }
        if (c.data.show_icon === 'true' && item.icon && item.icon.length != 0) {
            cssClassName = cssClassName + "-icon";
        } else {
            cssClassName = cssClassName + "-no-icon";
        }
        return cssClassName;
    };

    $(window).resize(handleToolTip);
    $scope.$evalAsync(handleToolTip);

    function handleToolTip() {
        var isIE = window.navigator.userAgent.indexOf('Trident/') !== -1;
        $timeout(function() {
            $(".card-thumbnail-align-center, .card-thumbnail-align-left, .card-simple").each(function(index) {
                var hideToolTip = false;
                var span = $(this).find(".card-title");
                if (isIE) {
                    if (span && span[0] && span.width() >= span[0].scrollWidth) {
                        hideToolTip = true;
                    }
                } else {
                    if (span && span[0] && span.height() >= span[0].scrollHeight) {
                        hideToolTip = true;
                    }
                }
                if (hideToolTip) {
                    $(this).tooltip('disable');
                } else {
                    $(this).tooltip('enable');
                }
            });
        }, 100);
    }

    function hexToRGB(hex, alpha) {
        var r = parseInt(hex.slice(1, 3), 16),
            g = parseInt(hex.slice(3, 5), 16),
            b = parseInt(hex.slice(5, 7), 16);
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    }

    function raiseAppseeEvent(data) {
        if (!data.isNew) {
            return;
        }
        var payload = {};
        payload.name = "Guided Self-service Started";
        payload.data = {};
        payload.data["Guided Self-service"] = data.processName;
        payload.data["User Id"] = data.userId;
        payload.data["Source"] = data.source;
        snAnalytics.addEvent(payload);
    }

	c.getWidgetTitle = function() {
		var headingHtml = '<' + c.data.headingLevel + ' class="panel-title" id="'  + c.data.instanceId + '-widget-title">' + c.data.quickLinkHeader + '</' + c.data.headingLevel + '>';
        
		return $sce.trustAsHtml(headingHtml);
	};

    c.asyncGet = function() {
        $scope.isLoading = true;
        c.data.action = "loadData";
        c.server.update().then(function(response) {
            $scope.isLoading = false;
            setTimeout(handleToolTip);
        });
    };


    var load_config = c.data.load_config;
    if (load_config === "async")
        setTimeout(c.asyncGet);
    else {
        $scope.isLoading = false;
        setTimeout(handleToolTip);
    }
};
