function getShapeTemplate($, go, dispatch, shapeTemplateUtilities, resolveThemeVariable) {
    var nowColorBackgroundPrimary = resolveThemeVariable("--now-color_background--primary") || "#FFFFFF";
    var nowColorBackgroundSecondary = resolveThemeVariable("--now-color_background--secondary") || "#F5F6F7";
    var nowColorBackgroundSecondaryActionable = resolveThemeVariable("--now-color_background--secondary-actionable") || "#32343A";
    var nowColorBorderPrimary = resolveThemeVariable("--now-color_border--primary") || "#717E84";
    var nowColorBorderSecondary = resolveThemeVariable("--now-color_border--secondary") || "#A9B2B7";
    var nowColorTextPrimary = resolveThemeVariable("--now-color_text--primary") || "#10171B";
    var nowColorTextTertiary = resolveThemeVariable("--now-color_text--tertiary") || "#36444B";
    var nowOpacityLeast = resolveThemeVariable("--now-opacity--least") || 0.1;
    var nowOpacityLess = resolveThemeVariable("--now-opacity--less") || 0.25;
    var nowOpacityLeastBase16 = Math.floor(nowOpacityLeast * 255).toString(16).padStart(2, '0');
    var nowOpacityLessBase16 = Math.floor(nowOpacityLess * 255).toString(16).padStart(2, '0');
    var nowColorBGSecActLeast = nowColorBackgroundSecondaryActionable + nowOpacityLeastBase16;
    var nowColorBGSecActLess = nowColorBackgroundSecondaryActionable + nowOpacityLessBase16;

    return (
        $(go.Panel, "Spot",
            // Matches attributes between button and shape underneath so
            // that when the button is set to have less opacity,
            // the button will not be see through
            $("Shape", new go.Binding("figure", "addBtnText", function(addBtnText) {
                    return addBtnText !== '' ? "RoundedRectangle" : "Circle";
                }),
                new go.Binding("width", "addBtnText", function(addBtnText) {
                    return addBtnText !== '' ? 98 : 15;
                }),
                new go.Binding("height", "addBtnText", function(addBtnText) {
                    return addBtnText !== '' ? 24 : 15;
                }), {
                    fill: "white",
                    stroke: "white"
                }),
            $("Button",
                new go.Binding("isEnabled", '', function(linkData, linkObj) {
                    if (linkData.addBtnText) {
                        linkObj._buttonStrokeOver = nowColorBorderPrimary;
                        linkObj._buttonStrokePressed = nowColorBorderPrimary;
                        linkObj._buttonFillOver = nowColorBGSecActLeast;
                        linkObj._buttonFillNormal = nowColorBackgroundSecondary;
                    } else {
                        linkObj._buttonStrokeOver = nowColorBorderSecondary;
                        linkObj._buttonStrokePressed = nowColorBorderSecondary;
                        linkObj._buttonFillOver = nowColorBGSecActLess;
                        linkObj._buttonFillNormal = nowColorBackgroundPrimary;
                    }
                    return true;
                }),
                new go.Binding("ButtonBorder.figure", "addBtnText", function(addBtnText) {
                    return addBtnText !== '' ? "RoundedRectangle" : "Circle";
                }),
                new go.Binding("ButtonBorder.width", "addBtnText", function(addBtnText) {
                    return addBtnText !== '' ? 98 : 15;
                }),
                new go.Binding("ButtonBorder.height", "addBtnText", function(addBtnText) {
                    return addBtnText !== '' ? 24 : 15;
                }),
                new go.Binding("ButtonBorder.fill", "addBtnText", function(addBtnText) {
                    return addBtnText !== '' ? nowColorBackgroundSecondary : nowColorBackgroundPrimary;
                }),
                new go.Binding("ButtonBorder.stroke", "addBtnText", function(addBtnText) {
                    return addBtnText !== '' ? nowColorBorderPrimary : nowColorBorderSecondary;
                }), {
                    // set properties on the border Shape of the "Button"
                    "ButtonBorder.strokeWidth": 1,
                    // parameter1 is similar (but not exact) to the border radius
                    "ButtonBorder.parameter1": 6,
                    // set properties on the "Button" itself used by its event handlers
                    "_buttonFillPressed": nowColorBGSecActLess,
                    "name": "linkAddButton",
                    "cursor": "pointer",
                    click: function(event, btn) {
                        var link = btn.part.findObject('linkMain');
                        dispatch("FLOW_DIAGRAM#ADD_NODE_CLICKED", {
                            event: event,
                            buttonPosition: btn.getDocumentPoint(go.Spot.Center),
                            link: link
                        });
                    }
                },
                $(go.Panel, "Horizontal",
                    $(go.Picture,
                        new go.Binding("visible", '', function(linkData, linkObj) {
                            if (!linkData.addBtnText) {
                                return false;
                            } else {
                                linkObj.source = 'images/circle-plus-md-black.svg';
                                return true;
                            }
                        }), {
                            height: 11,
                            width: 11,
                            margin: new go.Margin(0, 4, 0, 0)
                        }),
                    $(go.TextBlock,
                        new go.Binding("stroke", '', function(linkData, linkObj) {
                            if (linkData.addBtnText) {
                                linkObj.text = linkData.addBtnText;
                                linkObj.margin = new go.Margin(2, 0, 0, 0);
                                return nowColorTextTertiary;
                            } else {
                                linkObj.text = '+';
                                return nowColorTextPrimary;
                            }
                        }), {
                            verticalAlignment: go.Spot.Center,
                            name: "addBtnPlus"
                        }
                    )
                )
            )
        )
    );
}
