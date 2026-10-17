function getBinding(go, source, target, dispatch) {
    return new go.Binding(target, "", function(data) {

        if (data.data && data.data.conditionDisplay) {
            var leftOffset = 0;
            if (data.instanceType === "FlowLogicInstanceType") {
                leftOffset = 0;
            }
            return new go.Margin(8, 0, 0, leftOffset);
        }

        return new go.Margin(0, 0, 0, 0);
    });
}
