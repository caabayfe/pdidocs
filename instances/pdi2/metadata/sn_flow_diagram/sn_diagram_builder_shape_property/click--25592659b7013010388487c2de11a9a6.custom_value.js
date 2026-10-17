function getValue(go, dispatch, $) {
	return function(e, obj, prev) {
		var shape = obj.part.findObject('parentToggle');
		// In the future, we'd modify this parentNode to be
		// the subtree that we are interested in toggling
		var parentNode = obj.part.findObject('flowLogicParentNode');
		
		if (shape) {
			// flip will start undefined
			if (!shape.flip) {
				shape.flip = go.GraphObject.FlipVertical;
				parentNode.collapseTree();
			}
			else {
				// Tree is collapsed
				if (shape.flip.Qa === 'FlipVertical') {
					shape.flip = go.GraphObject.None;
					parentNode.expandTree();
				}			
				else {
					shape.flip = go.GraphObject.FlipVertical;
					parentNode.collapseTree();
				}
			}				
		}
	};
}
