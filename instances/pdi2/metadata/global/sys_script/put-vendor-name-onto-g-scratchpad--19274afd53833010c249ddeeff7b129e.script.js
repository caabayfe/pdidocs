var defaultVendorName = gs.hasRole('maint') ? 'ServiceNow' : '';
g_scratchpad.author = gs.getProperty('glide.appcreator.company.friendly_name', defaultVendorName);
