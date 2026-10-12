function getGeometry($, go) {
    return function(shape, w, h) {
        var p1 = Math.min(w, h) / 2;
		//var p1 = 5;
        var geo = new go.Geometry();
          geo.add(new go.PathFigure(0, p1)
           .add(new go.PathSegment(go.PathSegment.Arc, 180, 90, p1, p1, p1, p1))
           .add(new go.PathSegment(go.PathSegment.Line, w - p1, 0))
           .add(new go.PathSegment(go.PathSegment.Arc, 270, 90, w - p1, p1, p1, p1))
           .add(new go.PathSegment(go.PathSegment.Line, w, h))
           .add(new go.PathSegment(go.PathSegment.Line, 0, h).close()));
  // don't intersect with two top corners when used in an "Auto" Panel
  geo.spot1 = new go.Spot(0, 0, 0.3 * p1, 0.3 * p1);
  geo.spot2 = new go.Spot(1, 1, -0.3 * p1, 0);
  return geo;
    };
}
