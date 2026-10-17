function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	
	if(newValue == 'false'){
		g_form.showFieldMsg("active", getMessage("A field that is disabled in an article template will no longer be displayed in the article view page. However, it will be displayed in the article edit form. To permanently remove the field, remove it from the edit form as well. Then, regenerate text index for the template table to clear index related to the deactivated field(s)."), "information", true);
	}
	else{
		g_form.hideFieldMsg("active", false);
	}
	
   
}
