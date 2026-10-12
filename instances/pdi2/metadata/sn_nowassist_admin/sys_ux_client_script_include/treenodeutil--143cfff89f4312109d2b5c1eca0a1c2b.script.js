function include({ imports }) {
    class TreeNodeUtil {
        constructor(id, label, completed = false) {
            this.id = id;
            this.label = label;
            this.parent = null;
            this.children = [];
            this.step_completed = completed;
            this.index = null;
            this.disabled = true;
            this.statuses = [];
        }
        addChild(childNode) {
            childNode.parent = this;
            this.children.push(childNode);
        }
        setNodeData(index, disabled, statuses) {
            this.index = index;
            this.disabled = disabled;
            this.statuses = statuses;
        }
        getIndexPath() {
            let path = [];
            let node = this;
            while (node?.id != "1") {
                path.unshift(node?.id);
                node = node?.parent;
            }
            return path;
        }
        getNodeData() {
            var nodeData = {};
            if (this?.children.length > 0) {
                var disabled = this?.disabled;
                var childData = [];
                for (let child of this?.children) {
                    let childStep = child.getNodeData();
                    childData.push(childStep);
                    if (!childStep?.disabled) {
                        disabled = false;
                    }
                }
                nodeData = {
                    id: this?.id,
                    label: this?.label,
                    index: this?.index,
                    step_completed: this?.step_completed,
                    disabled: disabled,
                    statuses: this?.statuses,
                    children: childData
                }
                if (this?.index == null) {
                    delete nodeData?.index;
                }
                return nodeData;
            } else {
                nodeData = {
                    id: this?.id,
                    label: this?.label,
                    index: this?.index,
                    step_completed: this?.step_completed,
                    disabled: this?.disabled,
                    statuses: this?.statuses
                }
                if (this?.index == null) {
                    delete nodeData?.index;
                }
                return nodeData;
            }
        }
    }
    return ({ TreeNodeUtil });
}
