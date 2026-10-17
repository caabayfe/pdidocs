validateUniqueUsers();

function validateUniqueUsers() {
   var userStockroom = new GlideRecord('alm_user_stockroom');
   userStockroom.addQuery('user', current.user);
   userStockroom.query();
   
   if (userStockroom.next() && userStockroom.sys_id != current.sys_id) {
	  gs.addErrorMessage(gs.getMessage('A default stockroom already exists for {0}', current.user.name));
	  current.setAbortAction('true');
   }
}
