if (current.sys_domain != 'global') {
   current.sys_domain.setValue('global');
   gs.addInfoMessage(gs.getMessage('GUEST user record must be in global domain - value has been corrected'));
   gs.log('guest user record must be in global domain - value has been corrected');
}

if (previous.user_name == 'guest' && current.user_name != 'guest') {
   current.user_name.setValue('guest');
   gs.addInfoMessage(gs.getMessage('Cannot change GUEST user name - value has been corrected'));
   gs.log('Cannot change GUEST user name - value has been corrected');
}
