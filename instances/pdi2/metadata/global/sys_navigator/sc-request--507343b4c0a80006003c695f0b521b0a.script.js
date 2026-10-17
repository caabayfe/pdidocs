var view = g_request.getParameter('sysparm_view');
if (!view && !gs.getUser().hasRoles())
    view = 'ess';

if (view == 'ess' || view == 'checkout') {
	var checkOutForm = gs.getProperty('glide.sc.checkout.form', 'com.glideapp.servicecatalog_checkout_view');
    var useLayouts = new SNC.ServiceCatalogLayoutService().useSCLayout();
    if (useLayouts || checkOutForm == 'com.glideapp.servicecatalog_checkout_view') {
        var realID = g_uri.get('sys_id');
        g_uri.set('sysparm_sys_id', realID);
        g_uri.set('sysparm_new_request', 'false');
    }

    if (useLayouts)
        answer =  g_uri.toString('com.glideapp.servicecatalog_checkout_view_v2.do');
	else if (checkOutForm == 'com.glideapp.servicecatalog_checkout_view')
        answer = g_uri.toString('com.glideapp.servicecatalog_checkout_view.do');
}

answer;
