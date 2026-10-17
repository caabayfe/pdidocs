function getPDLayout($, go) {
    class AlignedLayeredDigraphVertex extends go.LayeredDigraphVertex {
        constructor(net) {
            super(net);
        }

        commit() {
            var node = this.node;
            if (node !== null) {
                node.move(this.bounds.position);
            }
        }
    }

    class AlignedLayeredDigraphNetwork extends go.LayeredDigraphNetwork {
        constructor(lay) {
            super(lay);
        }

        createVertex() {
            return new AlignedLayeredDigraphVertex(this);
        }
    }

    class AlignedLayeredDigraphLayout extends go.LayeredDigraphLayout {
        constructor() {
            super();
        }

        createNetwork() {
            return new AlignedLayeredDigraphNetwork(this);
        }
        assignLayers() {
            super.assignLayers();

            // for every vertex, record the maximum vertex width or height for the vertex's layer
            var maxsizes = [];
            for (var it = this.network.vertexes.iterator; it.next();) {
                var v = it.value;
                var lay = v.layer;
                var max = maxsizes[lay];
                if (max === undefined) max = 0;
                var sz = v.width;
                if (sz > max) maxsizes[lay] = sz;
            }
            // now make sure every vertex has the maximum width or height according to which layer it is in,
            // and aligned on the left (if horizontal) or the top (if vertical)
            for (it = this.network.vertexes.iterator; it.next();) {
                var v = it.value;
                var node = v.node;
                if (node === null) continue;
                var lay = v.layer;
                var max = maxsizes[lay];
                v.focus = new go.Point(max / 2, v.focus.y);
                v.width = max;
            }
            // from now on, the LayeredDigraphLayout will think that the Node is bigger than it really is
            // (other than the ones that are the widest or tallest in their respective layer).
        }

        commitLinks() {
            super.commitLinks();
            this.network.edges.each((e) => {
                var l = e.link;
                if (!l) return;
                if (l.data && l.data.isGoBackTargetEdge) return;

                l.updateRoute();
                var pts = l.points.copy();
                if (pts.count >= 6) {
                    var p2 = pts.elt(pts.length - 4);
                    var p3 = pts.elt(pts.length - 3);

                    var nodeX = l.toNode.position.x;
                    var x = nodeX - 25;
                    pts.setElt(pts.length - 4, new go.Point(x, p2.y));
                    pts.setElt(pts.length - 3, new go.Point(x, p3.y));
                    l.points = pts;
                }
            });
        }
    }

    // https://forum.nwoods.com/t/align-groups-with-different-widths-in-layereddigraphlayout/16066
    // GoJS forum suggested to use the custom AlignedLayeredDigraphLayout
    // https://gojs.net/extras/AlignedLayeredDigraphLayout.html
    return $(AlignedLayeredDigraphLayout, {
        layerSpacing: 50,
        layeringOption: go.LayeredDigraphLayout.LayerLongestPathSource,
        alignOption: go.LayeredDigraphLayout.AlignAll,
    });
}
