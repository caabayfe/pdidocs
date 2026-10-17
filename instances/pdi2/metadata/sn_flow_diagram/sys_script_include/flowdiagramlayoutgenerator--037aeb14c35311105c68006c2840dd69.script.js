var FlowDiagramLayoutGenerator = Class.create();
FlowDiagramLayoutGenerator.prototype = {
    initialize: function() {},

    type: 'FlowDiagramLayoutGenerator'
};

// a script include class needs to be converted into an object in order to be returned
FlowDiagramLayoutGenerator.getObjValues = function(obj) {
    var res = {};
    var keys = Object.keys(obj);

    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        res[key] = obj[key];
    }

    return res;
};

// converts a script include object class into a pure javascript string representation.
FlowDiagramLayoutGenerator.convertObjToString = function(obj, name) {
    var jsonObj = FlowDiagramLayoutGenerator.getObjValues(obj);
    var stringObj = JSON.stringify(jsonObj);

    var objDeclaration = 'var ' + name + ' = ' + stringObj + ';';

    return objDeclaration;
};

// generates a layout script that pre-defines the flow diagram constants script include
FlowDiagramLayoutGenerator.createLayoutScript = function(layoutScript, diagramConstants) {

    var constants = FlowDiagramLayoutGenerator.convertObjToString(diagramConstants, 'FlowDiagramConstants');
    // function name from sn_diagram_builder_configuration
    var diagramConfigurationFnName = 'getFlowDiagrammingLayout';

    var script = 'function flowDiagramLayoutGen($, go) {\n';
    script += constants + '\n';
    script += layoutScript + '\n';
    script += 'return ' + diagramConfigurationFnName + '($, go);\n';
    script += '}';

    return script;
};
