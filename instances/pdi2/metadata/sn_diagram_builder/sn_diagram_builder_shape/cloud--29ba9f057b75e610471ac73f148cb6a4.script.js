function getGeometry($, go) {
    return (shape, w, h) => new go.Geometry()
        .add(new go.PathFigure(0.08034461 * w, 0.1944299 * h, true)
            .add(new go.PathSegment(go.SegmentType.Bezier, 0.2008615 * w, 0.05349299 * h, -0.09239631 * w, 0.07836421 * h, 0.1406031 * w, -0.0542823 * h))
            .add(new go.PathSegment(go.SegmentType.Bezier, 0.4338609 * w, 0.074219 * h, 0.2450511 * w, -0.00697547 * h, 0.3776197 * w, -0.01112067 * h))
            .add(new go.PathSegment(go.SegmentType.Bezier, 0.6558228 * w, 0.07004196 * h, 0.4539471 * w, 0, 0.6066018 * w, -0.02526587 * h))
            .add(new go.PathSegment(go.SegmentType.Bezier, 0.8921095 * w, 0.08370865 * h, 0.6914277 * w, -0.01904177 * h, 0.8921095 * w, -0.01220843 * h))
            .add(new go.PathSegment(go.SegmentType.Bezier, 0.9147671 * w, 0.3194596 * h, 1.036446 * w, 0.04105738 * h, 1.020377 * w, 0.3022052 * h))
            .add(new go.PathSegment(go.SegmentType.Bezier, 0.9082935 * w, 0.562044 * h, 1.04448 * w, 0.360238 * h, 0.992256 * w, 0.5219009 * h))
            .add(new go.PathSegment(go.SegmentType.Bezier, 0.9212406 * w, 0.8217117 * h, 1.032337 * w, 0.5771781 * h, 1.018411 * w, 0.8120651 * h))
            .add(new go.PathSegment(go.SegmentType.Bezier, 0.7592566 * w, 0.9156953 * h, 1.028411 * w, 0.9571472 * h, 0.8556702 * w, 1.052487 * h))
            .add(new go.PathSegment(go.SegmentType.Bezier, 0.5101666 * w, 0.9310455 * h, 0.7431877 * w, 1.009325 * h, 0.5624123 * w, 1.021761 * h))
            .add(new go.PathSegment(go.SegmentType.Bezier, 0.2609328 * w, 0.9344623 * h, 0.4820677 * w, 1.031761 * h, 0.3030112 * w, 1.002796 * h))
            .add(new go.PathSegment(go.SegmentType.Bezier, 0.08034461 * w, 0.870098 * h, 0.2329994 * w, 1.01518 * h, 0.03213784 * w, 1.01518 * h))
            .add(new go.PathSegment(go.SegmentType.Bezier, 0.06829292 * w, 0.6545475 * h, -0.02812061 * w, 0.9032597 * h, -0.01205169 * w, 0.6835638 * h))
            .add(new go.PathSegment(go.SegmentType.Bezier, 0.06427569 * w, 0.4265613 * h, -0.01812061 * w, 0.6089503 * h, -0.00606892 * w, 0.4555777 * h))
            .add(new go.PathSegment(go.SegmentType.Bezier, 0.08034461 * w, 0.1944299 * h, -0.01606892 * w, 0.3892545 * h, -0.01205169 * w, 0.1944299 * h)))
        .setSpots(0.1, 0.1, 0.9, 0.9);
}
