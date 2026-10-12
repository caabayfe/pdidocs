function getBinding(go, source, target, dispatch) {
    return new go.Binding(target, "", function(graphObject) {
		var PLACEHOLDER_DEFINITION = "4fa4aa3bfbb031100a4a3d6176af26d2";
		var isSelected = graphObject.isSelected || graphObject.isHighlighted || graphObject.data.isSelected;
		if(graphObject.data && graphObject.data.instanceType === "FlowLogicInstanceType") {
			if(graphObject.data.definition_sys_id === PLACEHOLDER_DEFINITION) {
        return 306;
      }
			return isSelected ? 282 : 285;
		} else {
			return isSelected ? 302 : 306;
		} 
    }).ofObject();
}
