setDomains();

function setDomains() {
   if (!current.sys_id) {
      var message = gs.getMessage("Business Rule 'Domain - Cascade Company': Company sys_id is undefined, skipping updates");
      gs.error(message);
      //also raise the error in the session if applicable
      if (gs.isInteractive()) {
         gs.addErrorMessage(message);
      }
      return;
   }
   //make current transaction uncancelable while this rule runs,
   //set variable to previous cancelable state to restore when done
   var isCancelable = gs.setCannotCancel(true);

   setNewDomain('sys_user');
   setNewDomain('sys_user_group');
   setNewDomain('cmn_department');
   setNewDomain('cmn_location');

   //restore previous cancelable state
   gs.setCannotCancel(isCancelable);
}

function setNewDomain(table) {
   var domainID = current.sys_domain.toString();
   var rec = new GlideRecord(table);
   rec.addQuery('company', current.sys_id);
   if (rec.isValidField("managed_domain"))
      rec.addQuery("managed_domain", false);
   rec.query();
   while (rec.next()) {
      rec.sys_domain = domainID;
      rec.update();
   }
}
