function getShapeTemplate($, go, dispatch) {
    var NODE_WIDTH = 340;
    var NODE_2_WIDTH = 200;
    var OPEN_LINK_BUFFER = 30;
    var ENTRY_HEIGHT = 40;
    var SECTION_HEADER_HEIGHT = 24;
    var FIELD_NAME_WIDTH = 120;
    var FIELD_TYPE_WIDTH = 140;
    var HEADER_HEIGHT = 32;
    var MAX_TABLE_ENTRIES_SHOWN = 10;
    var CHEVRON_ANGLE_RIGHT = 270;
    var CHEVRON_ANGLE_DOWN = 0;
    var CHEVRON_MARGIN_COLLAPSED = new go.Margin(0, 6, 0, 6);
    var CHEVRON_MARGIN_EXPANDED = new go.Margin(0, 6, 0, 4);
    var CHEVRON_GEOMETRY_STRING =
        "M6 7.29287L9.64645 3.64642L10.3536 4.35353L6 8.70708L1.64645 4.35353L2.35355 3.64642L6 7.29287Z";
    var DEFAULT_OUTLINE_COLOR = "#D1D6D6";
    var ELLIPSIS_COLOR = "#E9EAEB";
    var DEFAULT_STROKE_WIDTH = 0.5;
    var ELLIPSIS_IMAGE_PATH = "/images/@devsnc/sn-table-builder/ellipsis-v.svg";
    var DRAG_IMAGE_PATH_DARK = "/images/@devsnc/sn-table-builder/dragIcon-dark.svg";
    var DRAG_IMAGE_PATH_LIGHT = "/images/@devsnc/sn-table-builder/dragIcon-light.svg";
    var OPEN_LINK_IMAGE_PATH_DARK = "/images/@devsnc/sn-table-builder/open-link-right-dark.svg";
    var OPEN_LINK_IMAGE_PATH_LIGHT = "/images/@devsnc/sn-table-builder/open-link-right-light.svg";
    var TOOL_TIP_RECT_COLOR = "#0F1213";
    var SCROLLBAR_COLOR = "#BFC5C6";
    var TEXT_COLOR = "#161B1C";
    var SECTION_HEADER_COLOR = "#2C3537";
    var FIELD_COUNT_TEXT_COLOR = "#425051";
    var NEUTRAL_COLOR_0 = "#FFFFFF";
    var NEUTRAL_COLOR_1 = "#F6F7F7";
    var NEUTRAL_COLOR_2 = "#E4E6E7";
    var APP_TABLE_HEADER_COLOR = "#99ABF4";
    var APP_TABLE_HEADER_COLOR_SELECTED = "#3951B0";
    var SYS_TABLE_HEADER_COLOR = "#EFDEFA";
    var SYS_TABLE_HEADER_COLOR_SELECTED = "#6C4685";
    // ACTIONS
    var SCHEMA_VIEW__ELLIPSIS_CLICKED = "SCHEMA_VIEW#ELLIPSIS_CLICKED";
    var SCHEMA_VIEW__OPEN_LINK_CLICKED = "SCHEMA_VIEW#OPEN_LINK_CLICKED";
    var SCHEMA_VIEW_NODE_CLICKED = "SCHEMA_VIEW#NODE_CLICKED";
    var initialScrollPoint;
    var initialScrollButtonPoint;

    function openLinkClicked(e, obj) {
        dispatch(SCHEMA_VIEW__OPEN_LINK_CLICKED, {
            nodeDataObj: obj.part.data
        });
    }

    function expanderButtonClicked(e, btn) {
        e.handled = true;
        btn.diagram.model.commit(function(m) {
            var data = btn.part.data;
            m.set(data, "isExpanded", !data.isExpanded);
        }, "expander button clicked in node");
    }

    function ellipsisClicked(e, obj) {
        var ellipse = obj.findObject("ELLIPSIS");
        var docPoint = ellipse.getDocumentPoint(go.Spot.Center);
        var viewPoint = obj.diagram.transformDocToView(docPoint);
        dispatch(SCHEMA_VIEW__ELLIPSIS_CLICKED, {
            buttonPosition: {
                x: viewPoint.x + 10, // Offset to display popover to the right of ellipsis
                y: viewPoint.y + 35, // Offset to display popover at same height as ellipsis
            },
            nodeDataObj: obj.part.data,
        });
    }

    function countVisibleRows(tableEntries, includeSectionHeader) {
        return tableEntries.filter(function(x) {
            return ((includeSectionHeader || !x.isSectionHeader) && (x.showExtended || !x.isExtended));
        }).length;
    }
    // triggered when scroll bar button is pressed down on
    function recordInitialScrollPoint(e, obj) {
        initialScrollButtonPoint = obj.actualBounds.y;
        initialScrollPoint = obj.panel.getLocalPoint(e.documentPoint);
    }
    // triggered when scroll bar button is dragged
    function handleScroll(e, obj) {
        var scrollbar = obj.panel; // the panel containing the scroll bar button aka the scrollbar
        var local = scrollbar.getLocalPoint(e.documentPoint); // the mouse location within the scrollbar
        var delta = local.y - initialScrollPoint.y;
        var table = scrollbar.panel.findObject("TABLE"); // table containig the entries to scroll through
        var scrollbarButton = scrollbar.findObject("SCROLLBARBUTTON");
        if (table && scrollbarButton) {
            var tableHeight = table.actualBounds.height;
            var scrollbarButtonHeight = scrollbarButton.actualBounds.height;
            // move scroll bar button
            var scrollLocation = Math.min(
                1,
                Math.max(
                    0,
                    (initialScrollButtonPoint + delta) /
                    (tableHeight - scrollbarButtonHeight)
                )
            );
            scrollbarButton.alignment = new go.Spot(0.5, scrollLocation, 0, 0);
            // get index to scroll to in table
            var idx = Math.round(
                Math.max(0, scrollLocation) * (table.itemArray.length - MAX_TABLE_ENTRIES_SHOWN)
            );
            if (table.topIndex !== idx) {
                table.topIndex = Math.max(idx, 0);
            }
        }
    }
    // highlight all Links coming out of/going into a given Node
    function nodeClicked(e, obj) {
        var diagram = obj.diagram;
        diagram.clearHighlighteds();
        obj.isHighlighted = true;
        obj.findLinksOutOf().each(function(l) {
            l.isHighlighted = true;
        });
        obj.findLinksInto().each(function(l) {
            l.isHighlighted = true;
        });
        dispatch(SCHEMA_VIEW_NODE_CLICKED, {
            nodeDataObj: obj.part.data
        });
    }

    function mouseEnteredNode(e, obj) {
        var bar = obj.part.findObject("SCROLLBAR");
        var table = obj.part.findObject("TABLE");
        var shouldShowScrollbar = table.itemArray.length > MAX_TABLE_ENTRIES_SHOWN;
        bar.visible = shouldShowScrollbar;
        // set node strokeWidth to 2
        var borderRectangle = obj.findObject("BORDER_RECTANGLE");
        borderRectangle.strokeWidth = 2;
    }

    function mouseLeftNode(e, obj) {
        var bar = obj.part.findObject("SCROLLBAR");
        bar.visible = false;
        // set node strokeWidth back to 1 unless it is selected
        var borderRectangle = obj.findObject("BORDER_RECTANGLE");
        if (!obj.isHighlighted && !obj.isSelected) {
            borderRectangle.strokeWidth = 1;
        }
    }

    function resizeNode(v) {
        // increment through tableEntries until we find an entry that is not a section header
        var index = v.data.tableEntries.findIndex(function(elem) {
            return !elem.isSectionHeader;
        });
        var showFieldType = ((index !== -1 && v.data.tableEntries[index].showFieldType) || false);
        return (showFieldType ? NODE_WIDTH : NODE_2_WIDTH);
    }

    function createToolTip(originalText) {
        return $(
            go.Adornment,
            "Spot",
            new go.Binding("visible", "", function(adorn) {
                var textblockInfo = adorn.adornedObject.metrics;
                return (
                    textblockInfo.arrText[0] && textblockInfo.arrText[0].endsWith("...")
                );
            }).ofObject(),
            $(
                go.Panel,
                "Auto",
                $(go.Shape, {
                    figure: "RoundedRectangle",
                    parameter1: 4, // border-radius
                    fill: TOOL_TIP_RECT_COLOR,
                    stroke: TOOL_TIP_RECT_COLOR,
                }),
                $(go.TextBlock, new go.Binding("text", originalText), {
                    font: "12px Open Sans, sans-serif",
                    stroke: NEUTRAL_COLOR_0,
                    maxSize: new go.Size(NODE_WIDTH, NaN),
                    margin: new go.Margin(4, 8, 4, 8),
                })
            )
        );
    }
    return $(
        go.Node,
        "Auto",
        new go.Binding("visible", "isVisible", function(v) {
            return v;
        }),
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        new go.Binding("isLayoutPositioned", "usesOverrideLoc", function(v) {
            return !v;
        }), {
            name: "NODE",
            isShadowed: true,
            shadowOffset: new go.Point(2, 2),
            selectionAdorned: false,
            cursor: "pointer",
            click: nodeClicked,
            //mouseEnter: mouseEnteredNode,
            //mouseLeave: mouseLeftNode,
        },
        $(
            go.Shape,
            "Rectangle", {
                name: "BORDER_RECTANGLE",
                fill: DEFAULT_OUTLINE_COLOR,
                shadowVisible: true,
                strokeWidth: 1,
            },
            new go.Binding("width", "", resizeNode).ofObject(""),
            new go.Binding("stroke", "", function(v) {
                if (v.isSelected || v.isHighlighted) {
                    return v.data.isAppTable ?
                        APP_TABLE_HEADER_COLOR_SELECTED :
                        SYS_TABLE_HEADER_COLOR_SELECTED;
                } else {
                    return v.data.isAppTable ?
                        APP_TABLE_HEADER_COLOR :
                        SYS_TABLE_HEADER_COLOR;
                }
            }).ofObject("")
        ),
        $(
            go.Panel,
            "Table",
            $(
                go.Panel,
                "Auto", {
                    row: 0,
                },
                $(
                    go.Shape,
                    "Rectangle", {
                        stroke: "transparent",
                        height: HEADER_HEIGHT,
                        portId: "",
                        toSpot: go.Spot.TopSide,
                    },
                    new go.Binding("width", "", resizeNode).ofObject(""),
                    new go.Binding("fill", "", function(v) {
                        if (v.isSelected || v.isHighlighted) {
                            return v.data.isAppTable ?
                                APP_TABLE_HEADER_COLOR_SELECTED :
                                SYS_TABLE_HEADER_COLOR_SELECTED;
                        } else {
                            return v.data.isAppTable ?
                                APP_TABLE_HEADER_COLOR :
                                SYS_TABLE_HEADER_COLOR;
                        }
                    }).ofObject("")
                ),
                $(go.Picture, {
                        margin: new go.Margin(10, 0, 11, 7),
                        alignment: go.Spot.Left,
                        desiredSize: new go.Size(5, 11),
                        visible: false
                    },
                    new go.Binding("source", "", function(v) {
                        if (v.isSelected || v.isHighlighted) {
                            return DRAG_IMAGE_PATH_LIGHT;
                        } else {
                            return DRAG_IMAGE_PATH_DARK;
                        }
                    }).ofObject("")
                ),
                $(
                    go.TextBlock, {
                        alignment: go.Spot.Left,
                        margin: new go.Margin(6, 0, 6, 5),
                        textAlign: "Left",
                        font: "600 16px Open Sans, sans-serif",
                        overflow: go.TextBlock.OverflowEllipsis,
                        shadowVisible: false,
                        wrap: go.TextBlock.None,
                        toolTip: createToolTip("label"),
                    },
                    new go.Binding("width", "", function(v) {
                        return resizeNode(v) - OPEN_LINK_BUFFER;
                    }).ofObject(""),
                    new go.Binding("stroke", "", function(v) {
                        if (v.isHighlighted || v.isSelected) {
                            return NEUTRAL_COLOR_0;
                        } else {
                            return TEXT_COLOR;
                        }
                    }).ofObject(""),
                    new go.Binding("text", "label")
                ),
                $(go.Panel, "Auto", {
                        margin: new go.Margin(4, 4, 4, 0),
                        alignment: go.Spot.Right,
                        mouseEnter: function(e, obj) {
                            var circle = obj.panel.findObject("OPEN_LINK_CIRCLE");
                            circle.fill = "#FFFFFF";
                            circle.opacity = 0.1;
                        },
                        mouseLeave: function(e, obj) {
                            var circle = obj.panel.findObject("OPEN_LINK_CIRCLE");
                            circle.fill = "transparent";
                        },
                        isActionable: true,
                        actionDown: function(e, obj) {
                            var circle = obj.panel.findObject("OPEN_LINK_CIRCLE");
                            circle.fill = "#2C3537";
                            circle.opacity = 0.25;
                        },
                        actionUp: function(e, obj) {
                            var circle = obj.panel.findObject("OPEN_LINK_CIRCLE");
                            circle.fill = "transparent";
                        },
                        click: openLinkClicked,
                    },
                    $(go.Shape, "Circle", {
                        name: "OPEN_LINK_CIRCLE",
                        desiredSize: new go.Size(24, 24),
                        fill: "transparent",
                        stroke: "transparent"
                    }),
                    $(go.Picture, {
                            name: "OPEN_LINK",
                            desiredSize: new go.Size(10, 10),
                        },
                        new go.Binding("source", "", function(v) {
                            if (v.isSelected || v.isHighlighted) {
                                return OPEN_LINK_IMAGE_PATH_LIGHT;
                            } else {
                                return OPEN_LINK_IMAGE_PATH_DARK;
                            }
                        }).ofObject("")
                    ),
                    new go.Binding("visible", "", function(v) {
                        return !v.data.isBaseTable;
                    }).ofObject(""))
            ),
            $(
                go.Panel,
                "Auto", {
                    row: 1,
                },
                $(go.Shape, "Rectangle", {
                        height: HEADER_HEIGHT,
                        fill: NEUTRAL_COLOR_0,
                        stroke: "transparent",
                    },
                    new go.Binding("width", "", resizeNode).ofObject("")),
                $(
                    "Button", {
                        alignment: go.Spot.Left,
                        click: expanderButtonClicked,
                        "ButtonBorder.fill": "transparent",
                        "ButtonBorder.stroke": "transparent",
                        _buttonFillOver: "transparent",
                        _buttonStrokeOver: "transparent",
                        _buttonFillPressed: "transparent",
                        _buttonStrokePressed: "transparent",
                    },
                    new go.Binding("margin", "", function(v) {
                        return v.data.isExpanded ? CHEVRON_MARGIN_EXPANDED : CHEVRON_MARGIN_COLLAPSED;
                    }).ofObject(""),
                    $(go.Shape, {
                            name: "CHEVRON",
                            stroke: FIELD_COUNT_TEXT_COLOR,
                            geometryString: CHEVRON_GEOMETRY_STRING,
                        },
                        new go.Binding("angle", "", function(v) {
                            return v.data.isExpanded ? CHEVRON_ANGLE_DOWN : CHEVRON_ANGLE_RIGHT;
                        }).ofObject(""))
                ),
                $(
                    go.TextBlock, {
                        alignment: go.Spot.Left,
                        margin: new go.Margin(0, 0, 0, 20),
                        font: "400 16px Open Sans, sans-serif",
                        stroke: FIELD_COUNT_TEXT_COLOR
                    },
                    new go.Binding("text", "", function(v) {
                        var entries = countVisibleRows(v.data.tableEntries, false);
                        return v.data.collapseNodeText + " (" + entries + ")";
                    }).ofObject("")
                ),
                $(
                    go.Panel,
                    "Auto", {
                        name: "ELLIPSIS",
                        alignment: go.Spot.Right,
                        click: ellipsisClicked,
                        mouseEnter: function(e, obj) {
                            var circle = obj.panel.findObject("ELLIPSIS_CIRCLE");
                            circle.fill = ELLIPSIS_COLOR;
                        },
                        mouseLeave: function(e, obj) {
                            var circle = obj.panel.findObject("ELLIPSIS_CIRCLE");
                            circle.fill = "transparent";
                        }
                    },
                    $(go.Shape, "Circle", {
                        name: "ELLIPSIS_CIRCLE",
                        margin: new go.Margin(0, 4, 0, 0),
                        desiredSize: new go.Size(24, 24),
                        fill: "transparent",
                        stroke: "transparent",
                    }),
                    $(go.Picture, {
                        desiredSize: new go.Size(12, 12),
                        source: ELLIPSIS_IMAGE_PATH,
                    })
                )
            ),
            $(
                go.Panel,
                "Table", {
                    row: 2,
                }, {
                    name: "SCROLLING_TABLE",
                    stretch: go.GraphObject.Fill,
                    defaultColumnSeparatorStroke: DEFAULT_OUTLINE_COLOR,
                },
                new go.Binding("width", "", resizeNode).ofObject(""),
                new go.Binding("height", "tableEntries", function(v) {
                    var entriesAndHeaders = countVisibleRows(v, true);
                    var justEntries = countVisibleRows(v, false);
                    if (entriesAndHeaders <= MAX_TABLE_ENTRIES_SHOWN) {
                        var numHeaders = entriesAndHeaders - justEntries;
                        return (justEntries * ENTRY_HEIGHT) + (numHeaders * SECTION_HEADER_HEIGHT);
                    } else {
                        return MAX_TABLE_ENTRIES_SHOWN * ENTRY_HEIGHT + 10;
                    }
                }),
                new go.Binding("visible", "", function(v) {
                    return v.data.isExpanded;
                }).ofObject(""),
                $(
                    go.Panel,
                    "Table", {
                        name: "TABLE",
                        defaultRowSeparatorStroke: NEUTRAL_COLOR_2,
                        column: 0,
                        stretch: go.GraphObject.Fill,
                        _updateScrollBar: true,
                        itemTemplate: $(
                            go.Panel,
                            "TableRow",
                            new go.Binding("portId", "key"), {
                                fromSpot: go.Spot.LeftRightSides, // links only go from the right side to the left side
                                toSpot: go.Spot.LeftRightSides,
                                defaultStretch: go.GraphObject.Horizontal,
                            },
                            $(go.TextBlock,
                                // Section header styling
                                {
                                    height: SECTION_HEADER_HEIGHT,
                                    verticalAlignment: go.Spot.Center,
                                    margin: new go.Margin(0, 0, 0, 20),
                                    font: "400 12px Open Sans, sans-serif",
                                    stroke: SECTION_HEADER_COLOR,
                                    stretch: go.GraphObject.Horizontal,
                                    shadowVisible: false,
                                },
                                new go.Binding("visible", "", function(v) {
                                    return v.isSectionHeader;
                                }),
                                new go.Binding("text", "name")
                            ),
                            $(
                                go.Shape, {
                                    // place type icon here
                                    desiredSize: new go.Size(16, 16),
                                    stroke: "transparent",
                                    margin: new go.Margin(0, 6, 0, 20),
                                    alignment: go.Spot.Left,
                                    shadowVisible: false,
                                },
                                new go.Binding("geometryString", "icon_svg"),
                                new go.Binding("visible", "", function(v) {
                                    return (v.icon_svg && !v.isSectionHeader) ? true : false;
                                })
                            ),
                            $(
                                go.Picture, {
                                    desiredSize: new go.Size(16, 16),
                                    margin: new go.Margin(0, 6, 0, 20),
                                    alignment: go.Spot.Left,
                                    shadowVisible: false,
                                },
                                new go.Binding("source", "image_path"),
                                new go.Binding("visible", "", function(v) {
                                    return (v.image_path && !v.isSectionHeader) ? true : false;
                                })
                            ),
                            $(
                                go.TextBlock, {
                                    height: ENTRY_HEIGHT,
                                    width: FIELD_NAME_WIDTH,
                                    margin: new go.Margin(0, 0, 0, 40),
                                    verticalAlignment: go.Spot.Center,
                                    textAlign: "left",
                                    overflow: go.TextBlock.OverflowEllipsis,
                                    shadowVisible: false,
                                    wrap: go.TextBlock.None,
                                    toolTip: createToolTip("name"),
                                    alignment: go.Spot.Left,
                                    font: "400 16px Open Sans, sans-serif"
                                },
                                new go.Binding("text", "name"),
                                new go.Binding("visible", "", function(v) {
                                    return !v.isSectionHeader;
                                })
                            ),
                            $(
                                go.TextBlock, {
                                    height: ENTRY_HEIGHT,
                                    width: FIELD_TYPE_WIDTH,
                                    margin: new go.Margin(0, 16, 0, 180),
                                    verticalAlignment: go.Spot.Center,
                                    font: "400 16px Open Sans, sans-serif",
                                    textAlign: "right",
                                    overflow: go.TextBlock.OverflowEllipsis,
                                    wrap: go.TextBlock.None,
                                    toolTip: createToolTip("type"),
                                    shadowVisible: false,
                                },
                                new go.Binding("text", "type"),
                                new go.Binding("visible", "", function(v) {
                                    return (v.showFieldType && !v.isSectionHeader);
                                })
                            ),
                            new go.Binding("background", "", function(i) {
                                return i.isSectionHeader ? NEUTRAL_COLOR_1 : NEUTRAL_COLOR_0;
                            })
                        ),
                    },
                    new go.Binding("itemArray", "tableEntries", function(v) {
                        return v.filter(function(x) {
                            return (x.showExtended || !x.isExtended);
                        });
                    })
                ),
                $(
                    go.Panel,
                    "Auto", {
                        name: "SCROLLBAR",
                        column: 0,
                        stretch: go.GraphObject.Vertical,
                        alignment: go.Spot.Right,
                        visible: true,
                    },
                    $(go.Shape, {
                        fill: NEUTRAL_COLOR_1,
                        stroke: NEUTRAL_COLOR_2,
                        strokeWidth: DEFAULT_STROKE_WIDTH,
                        width: 15,
                    }),
                    $(
                        go.Shape,
                        "RoundedRectangle", {
                            name: "SCROLLBARBUTTON",
                            stretch: go.GraphObject.Horizontal,
                            width: 8,
                            margin: new go.Margin(2, 0, 2, 0),
                            fill: SCROLLBAR_COLOR,
                            stroke: "transparent",
                            alignment: go.Spot.Top,
                            alignmentFocus: go.Spot.Top,
                            // mouseEnter: function(e, scrollBarButton) {
                            //     scrollBarButton.stroke = SCROLLBAR_COLOR;
                            // },
                            // mouseLeave: function(e, scrollBarButton) {
                            //     scrollBarButton.stroke = "transparent";
                            // },
                            cursor: "pointer",
                            isActionable: true,
                            actionDown: recordInitialScrollPoint,
                            actionMove: handleScroll,
                        },
                        new go.Binding("height", "tableEntries", function(v) {
                            return (
                                (MAX_TABLE_ENTRIES_SHOWN / countVisibleRows(v, true)) *
                                (MAX_TABLE_ENTRIES_SHOWN * ENTRY_HEIGHT)
                            );
                        })
                    )))));
}
