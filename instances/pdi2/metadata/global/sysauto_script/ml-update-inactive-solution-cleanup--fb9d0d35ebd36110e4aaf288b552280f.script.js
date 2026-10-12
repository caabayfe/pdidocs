var grClusterModel = new GlideRecord("ml_update_set");
grClusterModel.addQuery("solution.active", false);
grClusterModel.query();
while (grClusterModel.next()) {
    gs.info("Deleting ML Update Set: " + grClusterModel.getUniqueValue() + " for solution: " + grClusterModel.solution.solution_name + " with version:" + grClusterModel.solution.version);
    grClusterModel.deleteRecord();
}
