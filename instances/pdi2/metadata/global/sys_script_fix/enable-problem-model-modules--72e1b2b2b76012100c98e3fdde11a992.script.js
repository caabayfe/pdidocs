if (GlidePluginManager.isZboot()) {
    //enable problem models property only on zboot
    gs.setProperty("com.snc.problem_management.models.enabled", true);

    //Activating menu items for Problem Models
    var appModules = ["be1903d143040210644b3d1e2ab8f21a",
        "81d94fd143040210644b3d1e2ab8f2c9",
        "2ee610a618333110f8779a21c06dca33",
        "11ef6e434373311041c239aaaab8f27d"
    ];

    var moduleGR = new GlideRecord("sys_app_module");
    moduleGR.addEncodedQuery("sys_idIN" + appModules.join(","), true);
    moduleGR.setValue("active", "true");
    moduleGR.updateMultiple();
}
