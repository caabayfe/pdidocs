var portal = gs.getProperty('sn_km_portal.glide.knowman.serviceportal.portal_url') || 'sp';
var url = portal + '?id=actsub_notif_pref&sysparm_domain_restore=false&sysparm_stack=no';
g_response.sendRedirect(url);
