function getShapeTemplate($, go, dispatch) {
    return $(
        go.Group,
        "Auto", {
            layerName: "Background",
            movable: false,
            copyable: false,
            locationObjectName: "PLACEHOLDER",
            layout: null,
            avoidable: false,
            selectable: false,
        },
        $(
            go.Panel,
            "Auto",
            $(go.Shape, {
                    name: "PLACEHOLDER",
                    fill: "transparent",
                    stroke: null,
                    strokeWidth: 0,
                },
                new go.Binding("fill", "highlight", function(v) {
                    return v ? "#e5eef0" : "transparent";
                })
            )
        )
    );
}
