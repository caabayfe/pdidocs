(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var guidedTourPlugin = 'com.glide.guided_tours';
        var isActive = GlidePluginManager.isActive(guidedTourPlugin);
        response.setStatus(200);
        response.setBody({
            isActive: isActive
        });
    } catch (e) {
        // Given status as 200 to avoid showing alert in UI.
        response.setStatus(200);
        response.setBody({
            error: {
                message: e.message
            }
        });
    }
})(request, response);
