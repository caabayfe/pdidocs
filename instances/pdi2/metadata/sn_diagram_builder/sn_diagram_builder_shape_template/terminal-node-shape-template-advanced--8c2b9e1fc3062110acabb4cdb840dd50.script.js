function getShapeTemplate($, go, dispatch, shapeTemplateUtilities, resolveThemeVariable) {
    var buildChildShapeTemplate = shapeTemplateUtilities.buildChildShapeTemplate;
    var children = shapeTemplateUtilities.children;
    var circleShapeProps = {
        'stroke': resolveThemeVariable('--now-color_border--tertiary'),
        'strokeWidth': 1,
    };
	
    var hoverShapeProps = {
        'shape': 'Circle',
        'shapeProps': {
            'stroke': resolveThemeVariable('--now-color--primary-1'),
            'strokeWidth': 1,
            'width': 50,
            'height': 50,
            'fill': null,
        },
    };
    var nodeHoverAdornment = buildChildShapeTemplate(children[2], hoverShapeProps);
    return $(go.Node, 'Auto', {
            shadowColor: resolveThemeVariable('--now-datavis_color--teal-4'),
            shadowBlur: 20,
            selectionAdorned: false,
            shadowOffset: go.Point.parse("0 0"),
            mouseEnter: function(e, obj) {
                var node = obj.part;
                nodeHoverAdornment.adornedObject = node;
                node.addAdornment('mouseEnter', nodeHoverAdornment);
            },
            mouseLeave: function(e, obj) {
                var node = obj.part;
                node.removeAdornment('mouseEnter');
            }
        },
        new go.Binding("isShadowed", "isSelected", function(v) {
            return v;
        }).ofObject(),
        buildChildShapeTemplate(children[0], circleShapeProps),
        buildChildShapeTemplate(children[1])
    );
}
