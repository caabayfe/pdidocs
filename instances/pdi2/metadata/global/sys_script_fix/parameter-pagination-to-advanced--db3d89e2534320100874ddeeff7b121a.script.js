var parameterScreens = new GlideRecord("sys_sg_parameter_screen");
parameterScreens.addQuery("pagination_type", "off");
parameterScreens.setValue("advanced", true);
parameterScreens.updateMultiple();
