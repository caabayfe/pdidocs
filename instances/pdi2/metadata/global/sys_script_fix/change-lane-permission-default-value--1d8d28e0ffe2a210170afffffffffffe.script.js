var gr = new GlideRecord("sys_dictionary");
gr.addQuery("name", "sys_pd_lane");
gr.addQuery("element", "permission");
gr.query();
if (gr.next()) {
    gr.setValue("default_value", "javascript:PDUtils.getDefaultLanePermission();");
    gr.update();
    gs.info('sys_pd_lane: Updated permission attribute default_value through fix script.');

}
