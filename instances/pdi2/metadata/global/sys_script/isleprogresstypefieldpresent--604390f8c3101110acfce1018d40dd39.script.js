(function executeRule(current, previous /*null when async*/) {

	g_scratchpad.isLEProgressTypeFieldPresent = isLEProgressTypeFieldPresent();

    function isLEProgressTypeFieldPresent() {
        var grEntity = new GlideRecord("promin_project_entity");
        grEntity.addQuery("project", current.getUniqueValue());
        grEntity.addNullQuery("parent_entity");
        grEntity.query();

        var entityCount = grEntity.getRowCount();
        if (entityCount == 1 && grEntity.next()) {
            return new global.ProminUtils().isLeProgressTypeFieldPresent(grEntity.table);
        }
        return false;
    }

})(current, previous);
