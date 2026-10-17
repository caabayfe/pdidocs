function transform(input) {
    var result = {};
    var parentId;
    var nextAction = input.next_action;

    var gr = new GlideRecord("sys_execution_tracker");
    gr.addQuery("name", "Running Staged Alters");
    if (nextAction) {
        // For date fields, use GlideDateTime for proper comparison
        var gdt = new GlideDateTime();
        gdt.setValue(nextAction);
        gr.addQuery("completion_time", ">=", gdt.getValue());

        // Log the formatted date for debugging
        gs.info('Using date comparison: ' + gdt.getDisplayValue(), 'UpgradeMgmt Data Broker');
    }
    gr.query();

    while (gr.next()) {
        parentId = gr.getValue("sys_id");
        result.progress2 = gr.getValue("percent_complete");
        result.name = gr.getValue("name");
        result.state = gr.getValue("state");
        result.state_display = gr.getDisplayValue("state");
		result.detail_message = gr.getDisplayValue("detail_message");
		result.message = gr.getDisplayValue("message");
    }

    function getChildren(parentId, depth) {
        if (parentId == null) return [];
        var gr = new GlideRecord('sys_execution_tracker');
        gr.addQuery('parent', parentId);
        gr.orderBy("order");
        gr.query();
        var children = [];

        while (gr.next()) {
            var record = {
                sys_id: gr.getValue('sys_id'),
                name: gr.getValue('name'),
                state: gr.getValue('state'),
                order: gr.getValue('order'),
                percentComplete: gr.getValue('percent_complete'),
                depth: depth,
                children: getChildren(gr.getValue('sys_id'), depth + 1)
            };
            children.push(record);
        }
        return children;
    }

    function getDeepestLeafNodes(tree) {
        var leaves = [];

        function dfs(node) {
            if (!node.children || node.children.length === 0) {
                leaves.push(node);
                return;
            }

            for (var i = 0; i < node.children.length; i++) {
                dfs(node.children[i]);
            }
        }

        for (var i = 0; i < tree.length; i++) {
            dfs(tree[i]);
        }

        leaves.sort(function(a, b) {
            if (a.state !== b.state) {
                return a.state === "1" ? -1 : 1;
            }
            return parseInt(a.order) - parseInt(b.order);
        });

        return leaves;
    }

    var data = getChildren(parentId, 0);
    if (data.length > 0) {
        var level0 = data[0];
        result.progress1 = level0.percentComplete;
        var detail = getDeepestLeafNodes(data);
        result.detail = detail;
    }
    return result;
}
