var list = new GlideRecord("sys_script");
list.addEncodedQuery("collection=sys_email_account^sys_idIN455dfbef7762111007737e567a5a998b,abcdb32377a2111007737e567a5a9902");
list.setWorkflow(false);
list.deleteMultiple();

gs.info("Unnecessary Business rules on sys_email table are removed");
