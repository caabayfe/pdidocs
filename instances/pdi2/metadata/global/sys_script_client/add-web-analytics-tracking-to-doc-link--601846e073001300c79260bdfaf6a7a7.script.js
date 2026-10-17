function onLoad() {
	var docLink = gel ? gel('client_error_doc_link') : null;
	if (!docLink)
		return;

	docLink.onclick = function() {
		try {
			if (GlideWebAnalytics && GlideWebAnalytics.trackEvent)
				GlideWebAnalytics.trackEvent('com.glide.automated_testing_framework', 'Client Error', 'Client Error doc link visited');
		} catch (e) {
			console.log('Failed to send ATF analytic event: Client Error doc link visited');
			console.log(e);
		}
	};
}
