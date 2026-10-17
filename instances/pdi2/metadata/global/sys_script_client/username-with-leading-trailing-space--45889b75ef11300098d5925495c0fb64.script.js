function onChange(control, oldValue, newValue, isLoading, isTemplate) {

   if (isLoading == true)
	   return;
	
   if (newValue == "" || newValue == null)
       return;
	
   if (newValue.length == 0)
	   return;

   if (!hasLeadingOrTrailingSpace(newValue))
       return;

    g_form.addInfoMessage(formatMessage(getMessage('The user name field contains leading or trailing space(s). Please ensure it is intentional.')));
}

function hasLeadingOrTrailingSpace(fValue) {
   if ((trim(fValue)).length != fValue.length)
       return true;
	
   return false;
}
