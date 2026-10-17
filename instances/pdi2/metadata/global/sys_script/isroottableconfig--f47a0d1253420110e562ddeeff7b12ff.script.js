(function executeRule(current, previous /*null when async*/ ) {

    g_scratchpad.isRootTableConfig = isRootTableConfig();

    function isRootTableConfig() {
        var grEntity = new GlideRecord("promin_project_entity");
        grEntity.addQuery("project", current.getValue("project"));
        grEntity.addNullQuery("parent_entity");
        grEntity.query();

        var entityCount = grEntity.getRowCount();
        if (entityCount == 0) {
            return true;
        }
        if (entityCount == 1) {
            if (grEntity.next()) {
                if (grEntity.getUniqueValue() == current.getUniqueValue())
                    return true;
            }
        }
        return false;
    }

})(current, previous);
