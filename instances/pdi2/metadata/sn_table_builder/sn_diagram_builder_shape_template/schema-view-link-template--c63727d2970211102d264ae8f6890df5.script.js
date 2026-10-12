function getShapeTemplate($, go, dispatch) {
    /* CONSTANTS */
    // Widths and Lengths
    var CORNER = 10;
    var FROM_END_SEGMENT_LENGTH = 50;
    var TO_END_SEGMENT_LENGTH = 50;
    var SHORT_LENGTH = 1;
    var STROKE_WIDTH = 2;
    var HOVER_STROKE_WIDTH = 12;
    var ARROWHEAD_STROKE_WIDTH = 1;
    var ARROWHEAD_SCALE = 2;

    // Segment Fractions
    var ONE_TO_MANY_SEGMENT_FRACTION = 0;
    var ONE_TO_ONE_SEGMENT_FRACTION = 0.25;

    // Colors
    var NEUTRAL_7 = "#849196";
    var GREEN_COLOR = "#4EA800";
    var HOVER_COLOR = "#CCE3B9";

    //Actions
    var SCHEMA_VIEW_EDGE_CLICKED = "SCHEMA_VIEW#EDGE_CLICKED";

    /* EVENT HANDLERS */
    // a mouse-over highlights the link by changing the first main path shape's stroke:
    function handleMouseEnter(e, obj) {
        obj.elt(0).stroke = HOVER_COLOR;
    }

    function handleMouseLeave(e, obj) {
        obj.elt(0).stroke = "transparent";
    }

    // a mouse-click highlights the link and it's source and destination nodes
    function handleMouseClick(e, obj) {
        var diagram = obj.diagram;
        diagram.clearHighlighteds();
        obj.toNode.isHighlighted = true;
        obj.fromNode.isHighlighted = true;
        dispatch(SCHEMA_VIEW_EDGE_CLICKED, {
            edgeDataObj: obj.part.data
        });
    }

    return $(
        go.Link, {
            routing: go.Link.AvoidsNodes,
            corner: CORNER,
            fromEndSegmentLength: FROM_END_SEGMENT_LENGTH,
            toEndSegmentLength: TO_END_SEGMENT_LENGTH,
            toShortLength: SHORT_LENGTH,
            fromShortLength: SHORT_LENGTH,
            selectionAdorned: true,
            cursor: "pointer",
            mouseEnter: handleMouseEnter,
            mouseLeave: handleMouseLeave,
            click: handleMouseClick
        }, {
            selectionAdornmentTemplate: $(
                go.Adornment,
                $(go.Shape, {
                    isPanelMain: true,
                    stroke: GREEN_COLOR,
                    strokeWidth: STROKE_WIDTH,
                    cursor: "pointer",
                })
            ), // end Adornment
        },
        $(go.Shape, {
            isPanelMain: true,
            stroke: "transparent",
            strokeWidth: HOVER_STROKE_WIDTH,
        }), // thick undrawn path
        $(
            go.Shape, // Link line shape
            new go.Binding("stroke", "isHighlighted", function(h) {
                return h ? GREEN_COLOR : NEUTRAL_7;
            }).ofObject(), {
                name: "LINK_LINE",
                isPanelMain: true,
                strokeWidth: STROKE_WIDTH,
                stroke: null,
                fill: NEUTRAL_7,
            }
        ),
        $(
            go.Shape, {
                stroke: NEUTRAL_7,
                strokeWidth: ARROWHEAD_STROKE_WIDTH,
                scale: ARROWHEAD_SCALE,
            },
            new go.Binding("toArrow", "", function(data) {
                return data.type === "glide_list" ? "LineFork" : "Line";
            }),
            new go.Binding("segmentFraction", "", function(data) {
                return data.type === "glide_list" ?
                    ONE_TO_MANY_SEGMENT_FRACTION :
                    ONE_TO_ONE_SEGMENT_FRACTION;
            }),
            new go.Binding("stroke", "", function(h) {
                return (h.isHighlighted || h.isSelected) ? GREEN_COLOR : NEUTRAL_7;
            }).ofObject()
        ), // Link toArrow
        $(go.Shape, {
                strokeWidth: ARROWHEAD_STROKE_WIDTH,
                scale: ARROWHEAD_SCALE,
                segmentFraction: ONE_TO_ONE_SEGMENT_FRACTION,
                fromArrow: "Line",
            },
            new go.Binding("stroke", "", function(h) {
                return (h.isHighlighted || h.isSelected) ? GREEN_COLOR : NEUTRAL_7;
            }).ofObject()
        ) // Link fromArrow
    );
}
