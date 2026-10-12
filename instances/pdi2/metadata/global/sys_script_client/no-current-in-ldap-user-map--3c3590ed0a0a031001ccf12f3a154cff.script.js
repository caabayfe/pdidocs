//Warn the submitter when current is used in the LDAP user map

function onSubmit() {
  var scr = g_form.getValue('script');
  var mapname = g_form.getValue('name');
  if (mapname == 'USER LDAP MAPPING' && scr.toString().indexOf('current.') > -1) {
    return confirm(getMessage('The LDAP user map cannot use "current" - continue with save?'));
  }
}
