function getValue(go, dispatch, $) {
    return $(go.Adornment, "Auto", {
            locationSpot: new go.Spot(0.5, 0, 15, 0),
        },
        new go.Binding("visible", "_isPaletteNode", function(_isPaletteNode) {
            return !_isPaletteNode;
        }).ofModel(),
        $(go.Shape, "Circle", {
            fill: "#6e9eff",
            opacity: 0.5,
            stroke: "#6e9eff",
            width: 7,
            height: 7
        }),
        $(go.Placeholder)
    );
}
