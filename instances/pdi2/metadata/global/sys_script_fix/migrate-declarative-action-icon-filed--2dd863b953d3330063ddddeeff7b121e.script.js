var gr = new GlideRecord("sys_declarative_action_assignment");
      gr.query();
      while (gr.next()) {
        var iconName = gr.getValue("icon");
        var iconSysId;
        var vr = new GlideRecord("st_sys_design_system_icon");
        vr.addQuery("name", iconName);
        vr.query();
        if (vr.next()) {
            iconSysId = vr.getUniqueValue();
            gr.setValue("design_icon", iconSysId);
            gr.setWorkflow(false);
            gr.update();
        }
      }
