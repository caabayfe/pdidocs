gs.log("fixing advanced acl field");
var mu = new GlideMultipleUpdate("sys_security_acl");
mu.addQueryString('scriptISNOTEMPTY');
mu.addQuery("advanced", "false");
mu.setValue("advanced", "true");
mu.execute();
mu.close();
