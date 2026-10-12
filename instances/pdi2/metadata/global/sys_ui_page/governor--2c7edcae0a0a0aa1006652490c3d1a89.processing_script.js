    if (!gs.hasRole("maint")) {
       gs.warn("No changes made to min/max connections since user does not have maint role");
       gs.addErrorMessage(gs.getMessage("Properties were not modified"));
    } else {
      var mingr = new GlideRecord("sys_properties");
      var exists = mingr.get("name", "glide.db.pooler.connections");
	  if (!exists)
		  mingr.setValue("name", "glide.db.pooler.connections");

      var maxgr = new GlideRecord("sys_properties");
      var exists = maxgr.get("name", "glide.db.pooler.connections.max");
	  if (!exists)
		  mingr.setValue("name", "glide.db.pooler.connections.max");

      maxgr.setValue("value", max);
      mingr.setValue("value", initial);

      // set through update to allow business rule to run & give feedback to the user
      mingr.update();
      maxgr.update();

      gs.setProperty('glide.sys.schedulers', scheds);
    }
    response.sendRedirect("governor.do");
