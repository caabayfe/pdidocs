(function executeRule(current, previous /*null when async*/ ) {

    if (!current.getValue("ml_capability_definition"))
        return;
    var groupbyUtils = new MLGroupbyUtils();
    var parentGR = groupbyUtils.getGlideRecord(current.getValue("ml_capability_definition"));
    if (parentGR.getValue("groupby_field") == null || parentGR.sys_class_name.toString().includes("groupby")) {
        return;
    }
    var partialTrainingState = ['solution_cancelled', 'timed_out'];
    if (partialTrainingState.indexOf(current.state.toString()) != -1) {
        var childSolutionList = [];
        var groupbySol = new GlideRecord(parentGR.sys_class_name + "_groupby");
        groupbySol.addQuery("solution_definition", parentGR.getUniqueValue());
        groupbySol.addQuery("current_solution_version", parentGR.getValue('current_solution_version'));
        groupbySol.addQuery("groupby_field", parentGR.groupby_field);
        groupbySol.query();
        while (groupbySol.next()) {
            childSolutionList.push(groupbySol.getUniqueValue());
        }
        var childSolutionDef = new GlideRecord("ml_solution");
        childSolutionDef.addQuery('ml_capability_definition', 'IN', childSolutionList);
        childSolutionDef.addQuery('version', parentGR.getValue('current_solution_version'));
        childSolutionDef.query();
        childSolutionDef.deleteMultiple();
    }

})(current, previous);
