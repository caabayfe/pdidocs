function getValue(go, dispatch, $) {
    return $(go.Adornment, "Auto", {
            locationSpot: new go.Spot(0.5, 0, 15, 0),
        },
        new go.Binding("visible", "_isPaletteNode", function(_isPaletteNode) {
            return !_isPaletteNode;
        }).ofModel(),
        $(go.Shape, "Circle", {
            fill: "#e7a679",
            opacity: 0.5,
            stroke: "#e7a679",
            width: 7,
            height: 7
        }),
        $(go.Placeholder)
    );
}
