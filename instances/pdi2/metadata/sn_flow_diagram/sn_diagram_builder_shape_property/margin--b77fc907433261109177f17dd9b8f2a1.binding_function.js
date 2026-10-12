function getBinding(go, source, target, dispatch) {
    return new go.Binding(target, "", function(data) {
        var defaultMargin = 9;
        var DECISION_BLOCK_DEFINITION = "ff97840fb7651110f92afd31ae11a952";
        var PLACEHOLDER_DEFINITION = "4fa4aa3bfbb031100a4a3d6176af26d2";

        if (data.instanceType === "FlowLogicInstanceType") {
            if (data.node_id === DECISION_BLOCK_DEFINITION) {
                return new go.Margin(50, 0, 0, 0);
            } else if (data.definition_sys_id === PLACEHOLDER_DEFINITION) {
                return new go.Margin(0, 0, 0, defaultMargin);
            } else {
                return new go.Margin(0, 0, 0, 20 + defaultMargin);
            }
        }
        return new go.Margin(0, 0, 0, defaultMargin);
    });
}
