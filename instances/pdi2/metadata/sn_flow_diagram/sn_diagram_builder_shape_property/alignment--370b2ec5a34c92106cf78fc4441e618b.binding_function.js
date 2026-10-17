function getBinding(go, source, target, dispatch, resolveThemeVariable) {
    return new go.Binding(target, "", function(graphObject) {

        const direction = graphObject?.diagram?.model?.modelData?._direction;

        let xPosition = 0.9;
        if (direction === "rtl") {
            xPosition = 1 - xPosition;
        }
        return new go.Spot(xPosition, 0, 0, 17);
    }).ofObject();
}
