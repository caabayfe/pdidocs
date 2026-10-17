function getGeometry($, go) {
    return function(shape, w, h) {
        var p1 = Math.min(w, h) / 2;
        var geo = new go.Geometry();
        geo.add(
            new go.PathFigure(0, p1)
            .add(new go.PathSegment(go.PathSegment.Arc, 180, 90, p1, p1, p1, p1))
            .add(new go.PathSegment(go.PathSegment.Line, w - p1, 0))
            .add(new go.PathSegment(go.PathSegment.Arc, 270, 90, w - p1, p1, p1, p1))
            .add(new go.PathSegment(go.PathSegment.Arc, 0, 90, w - p1, h - p1, p1, p1))
            .add(new go.PathSegment(go.PathSegment.Line, p1, h))
            .add(
                new go.PathSegment(
                    go.PathSegment.Arc,
                    90,
                    90,
                    p1,
                    h - p1,
                    p1,
                    p1
                ).close()
            )
        );
        return geo;
    };
}
