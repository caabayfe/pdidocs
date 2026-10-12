GlideProperties.removeProperty("glide.domain.primary");
validatePrimaryDomain();

function validatePrimaryDomain() {
   var primaryDomain = new GlideRecord('domain');
   primaryDomain.addQuery('primary', 'true');
   primaryDomain.addQuery('sys_id', '!=', current.sys_id);
   primaryDomain.queryNoDomain();
   if (!primaryDomain.next())
      return;
   
   gs.addInfoMessage(gs.getMessage('Only one Domain may be set as Primary'));
   var checkIt = new GlideRecord('domain');
   if (!checkIt.get(primaryDomain.sys_id)) {
      gs.addInfoMessage(gs.getMessage("A domain you cannot see is already Primary - canceling update"));
      current.setAbortAction(true);
      return;
   }
   gs.addInfoMessage(gs.getMessage('"Primary" field automatically unchecked for Domain') + ': <b>' + primaryDomain.name + '</b>');
   primaryDomain.setValue('primary', false);
   primaryDomain.update();
}
