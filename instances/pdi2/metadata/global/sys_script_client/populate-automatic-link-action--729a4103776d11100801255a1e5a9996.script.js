function onChange(control, oldValue, newValue, isLoading, isTemplate) {	
	if(g_form.getUniqueValue() != '3f51f7a3771700105d7b3882a910616d'){
		return;
	}
	
    if (g_form.getValue('channel') == '5ae1b3e3771700105d7b3882a91061bd') {
        if (g_form.getValue('link_account_enabled') && g_form.getValue('account_link_type') != 'basic') {
		
			if (g_form.getValue('automatic_link_action').length > 0) {
                return;
            }
            g_form.setValue('automatic_link_action', 'sn_va_sms_twilio.va_sms_auto_link_account');
			
        } else {
            g_form.setValue('automatic_link_action', '');
        }
		
		
    }
}
