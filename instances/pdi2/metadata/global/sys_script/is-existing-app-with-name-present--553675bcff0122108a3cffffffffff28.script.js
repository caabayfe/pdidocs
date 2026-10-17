(function executeRule(current, previous /*null when async*/ ) {
      var existingAppProfile = new GlideRecord("dp_app_profile");
      existingAppProfile.addQuery("app_name", current.app_name);
      existingAppProfile.query();
      if (existingAppProfile.hasNext()) {
          gs.addErrorMessage(sn_i18n.Message.getMessage("com.glide.data_classification", "App Profile '{appProfile}' already exists", {
              appProfile: String(GlideStringUtil.escapeHTML(current.app_name))
          }));
          current.setAbortAction(true);
      }
  })(current, previous);
