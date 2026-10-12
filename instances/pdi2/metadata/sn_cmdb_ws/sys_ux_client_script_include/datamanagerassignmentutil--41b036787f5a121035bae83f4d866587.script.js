function dataManagerAssignmentUtil(proxyArg, params) {
    const { api, event, helpers, imports } = params; 
    const getChildren = async (assignmentType, schema, table, path, treeExpandedItems, searchString) => {
        let children = [];
        if (!treeExpandedItems.some((a) => a.join('.') == path.join('.')) || !schema.hasOwnProperty(table)) {
            children.push([{variant: "placeholder"}]);
            return children;
        } else if (schema.hasOwnProperty(table) && Object.keys(schema[table]).length == 0) {
           children.push({label: await helpers.translate("No reference fields available")});
           return children;
        }

        for (const [key, value] of Object.entries(schema[table])) {
            let actions = [];
            let newPath = [...path];
            newPath.push(value.value);
            let grandChildren = await getChildren(assignmentType, schema, value.reference, newPath, treeExpandedItems, searchString);
            if (!searchString || value.label.toLowerCase().includes(searchString.toLowerCase()) || grandChildren.some((a) => a && a.label && a.label.toLowerCase().includes(searchString.toLowerCase()))) {
                let obj = {
                    id: value.value,
                    label: value.label,
                    children: grandChildren,
                    fullPath: newPath
                };
                if ((assignmentType == 'user_group_field' && value.reference == 'sys_user_group')
                    || (assignmentType == 'user_field' && value.reference == 'sys_user')) {
                    obj.actionable = true;
                }
                children.push(obj);
            }
        }
        return children;
    };

    return { getChildren };
 }
