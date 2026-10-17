function getShapeTemplate($, go, dispatch) {
	var BOUNDING_BOX_WIDTH = 42;
	var BOUNDING_BOX_HEIGHT = 16;

    function makePort(portId, name, spot, alignment, alignmentFocus, output, input) {
        return $(go.Shape, "Circle", {
            name: name,
            fill: null,
            stroke: null,
            desiredSize: new go.Size(0, 0),
            alignment: alignment,
            alignmentFocus: alignmentFocus,
            portId: portId,
            fromSpot: spot,
            toSpot: spot,
            fromLinkable: output,
            toLinkable: input,
            cursor: "pointer",
        });
    }

    return $(go.Node, 'Spot', {
            selectionAdorned: false
        },
        $(go.Panel, "Position",
            $(go.Shape, "Rectangle", {
                width: BOUNDING_BOX_WIDTH,
                height: BOUNDING_BOX_HEIGHT,
                fill: "transparent",
                stroke: null,
            })
        ),
        makePort(
            "c0bed67c535c20100b0cddeeff7b12fc",
            "PORT_LEFT",
            go.Spot.Left,
            new go.Spot(1, 0.5),
            new go.Spot(0.5, 1, 0, 0),
            false,
            true
        )
    )
}
