var egr = new GlideRecord("sys_email_account");
egr.addQuery("type", "smtp");
egr.addQuery("active", "true");
egr.query();
if (egr.next()) {
  if ( current.sys_id != egr.sys_id){
    // there is already 1 SMTP account
    current.setAbortAction(true);
    gs.addErrorMessage(gs.getMessage("An SMTP server is already defined.  There can only be 1 SMTP server"));
  }// else it's the same one so let it update.
}
