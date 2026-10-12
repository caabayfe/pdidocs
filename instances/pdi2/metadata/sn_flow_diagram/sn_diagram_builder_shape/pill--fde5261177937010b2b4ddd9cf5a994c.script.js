function getGeometry($, go) {
    return function(shape, w, h) {
        // this figure takes one parameter, the size of the corner
        var p1 = 5; // default corner size
        if (shape !== null) {
            var param1 = shape.parameter1;
            if (!isNaN(param1) && param1 >= 0) p1 = param1; // can't be negative or NaN
        }
        p1 = Math.min(p1, w / 2);
        p1 = Math.min(p1, h / 2); // limit by whole height or by half height?
        var geo = new go.Geometry();
        // a single figure consisting of only quarter-circle arcs
        geo.add(new go.PathFigure(0, p1)
            .add(new go.PathSegment(go.PathSegment.Arc, 180, 90, p1, p1, p1, p1))
            .add(new go.PathSegment(go.PathSegment.Arc, 270, 90, w - p1, p1, p1, p1))
			.add(new go.PathSegment(go.PathSegment.Arc, 0, 90, w - p1, h - p1, p1, p1))
            .add(new go.PathSegment(go.PathSegment.Arc, 90, 90, p1, h - p1, p1, p1).close()));
        // don't intersect with two top corners when used in an "Auto" Panel
        geo.spot1 = new go.Spot(0, 0, 0.3 * p1, 0.3 * p1);
        geo.spot2 = new go.Spot(1, 1, -0.3 * p1, 0);
        return geo;
    };
}
