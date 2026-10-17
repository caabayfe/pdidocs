function transform(input) {
    var childData = input.graphqlData.GlideUxActionLayout_Query.getActionLayout.actionLayoutItems;
    var actions = [];

    childData.forEach(function(child, index) {
        if (!child.type) {
            var action = {
                "id": index,
                "overflow": child.shouldBeInOverflow,
                "type": "Button",
                "children": [],
                "icon": child.icon,
                "disabled": false
            };

            var children = {};
            children.id = child.sysId ? child.sysId : child.assignmentId;
            children.label = child.label;
            children.hint = child.sysId ? child.hint : child.tooltip;
            children.icon = child.icon;
            children.uxActionType = child.sysId ? 'UIAction' : 'DeclarativeAction';
            child.id = children.assignmentId;
            child.uxActionType = children.uxActionType;
            children.action = child;
            action.children.push(children);
            actions.push(action);
        } else {
			var grp = {};
			grp.id = index;
			grp.label = "";
			grp.overflow = child.shouldBeInOverflow,
			grp.color = child.color;
			grp.icon = child.icon;
			grp.disabled = false;
			grp.type = child.type;
			grp.children = [];
			child.actions.forEach(function(action, index) {
				var act = {};
				act.id = action.sysId ? action.sysId : action.assignmentId;
				act.label = action.label;
				act.hint = action.sysId ? action.hint : action.tooltip;
				act.uxActionType = action.sysId ? 'UIAction' : 'DeclarativeAction';
				act.action = action;
				grp.children.push(act);
			});
			actions.push(grp);
		}
    });

    return actions;
}
