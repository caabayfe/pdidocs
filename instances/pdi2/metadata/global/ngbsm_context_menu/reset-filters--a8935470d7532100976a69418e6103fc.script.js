// Reset, recalculate and reapply filters
bsmFilters.resetFilters();
bsmFilters.enumerateFilters(bsmGraph.current());
bsmFilters.applyFilters(bsmGraph.current());

// Redraw the graph to refect updated filtering
// 1000 is the duration in milliseconds to animate the rendering
bsmRenderer.drawAll(1000);
bsmFilters.firePostResetEvent();
