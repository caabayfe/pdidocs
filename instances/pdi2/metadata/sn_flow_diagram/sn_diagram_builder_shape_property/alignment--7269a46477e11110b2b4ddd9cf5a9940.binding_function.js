function getBinding(go, source, target, dispatch) {
    return new go.Binding(target, "", function(data) {
        if (data.onAddAnnotation || data.comment) {
            return new go.Spot(0.5, 0);
        } else {
            return new go.Spot.Center;
        }
    });
}
