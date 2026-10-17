function onLoad() {
	//If the ACL is already created, the type of the ACL cannot be changed anymore
   if (!g_form.isNewRecord()) {
	   g_form.setReadOnly('type', true);
   }
}
