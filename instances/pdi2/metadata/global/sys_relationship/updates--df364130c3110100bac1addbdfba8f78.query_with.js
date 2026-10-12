var updateManager = new GlideUpdateManager2();
current.addQuery("name", updateManager.getUpdateName(parent));
current.orderByDesc("sys_updated_on");
