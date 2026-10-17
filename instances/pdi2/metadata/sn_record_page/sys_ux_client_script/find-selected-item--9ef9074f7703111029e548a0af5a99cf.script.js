function script({
    api,
    event
}) {
    const {
        treeJSON: newTreeJSON,
        parentId
    } = event.payload;
    const {
        targetPath: path
    } = api.data.tree_picker.treePicker.treePickerConfig;
    const nodes = newTreeJSON.filter(n => n.id == path);
    const parentItemPath = api.state.expandedItems.find(
        item => item[item.length - 1] === parentId
    );
    if (nodes.length > 0 && parentItemPath) {
        const currentItemExpanded = [...parentItemPath];
        const selectedItemsArray = nodes.reduce((target, node) => {
            target.push([...currentItemExpanded, node.id]);
            return target;
        }, []);
        api.setState('selectedItems',
            selectedItemsArray
        );
    }
}
