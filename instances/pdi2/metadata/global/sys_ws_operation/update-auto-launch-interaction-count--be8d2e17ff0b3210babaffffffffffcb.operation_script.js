(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    try {
        var requestBody = (request.body && request.body.data) || {};
        var guidanceId = String(requestBody.guidanceId || '').trim();

        if (!guidanceId) {
            response.setBody({ error: 'guidanceId is required' });
            response.setStatus(400);
            return;
        }

        var currentUserId = gs.getUserID();

        // Find the auto-launch config for this guidance
        var configGr = new GlideRecord('guidance_auto_launch_config');
        configGr.addQuery('product_reference', guidanceId);
        configGr.addQuery('active', true);
        configGr.setLimit(1);
        configGr.query();

        if (!configGr.next()) {
            response.setBody({ error: 'No active auto-launch config found for this guidance' });
            response.setStatus(404);
            return;
        }

        var configSysId = configGr.getUniqueValue();
        var currentCount;

        // Check if user interaction record exists
        var interactionGr = new GlideRecord('guidance_auto_launch_user_interaction');
        interactionGr.addQuery('user', currentUserId);
        interactionGr.addQuery('guidance_auto_launch', configSysId);
        interactionGr.query();

        if (interactionGr.next()) {
            // Update existing record
            currentCount = (parseInt(interactionGr.getValue('count'), 10) || 0) + 1;
            interactionGr.setValue('count', currentCount);
            if (!interactionGr.update()) {
                response.setBody({ error: 'Failed to update interaction record' });
                response.setStatus(500);
                return;
            }
        } else {
            // Create new record
            currentCount = 1;
            interactionGr.initialize();
            interactionGr.setValue('user', currentUserId);
            interactionGr.setValue('guidance_auto_launch', configSysId);
            interactionGr.setValue('count', currentCount);
            if (!interactionGr.insert()) {
                response.setBody({ error: 'Failed to create interaction record' });
                response.setStatus(500);
                return;
            }
        }

        response.setBody({
            success: true,
            guidanceId: guidanceId,
            currentCount: currentCount
        });
        response.setStatus(200);

    } catch (e) {
        gs.error('Error in Update Auto Launch Interaction Count API: ' + e.message);
        response.setBody({ error: 'An unexpected error occurred' });
        response.setStatus(500);
    }

})(request, response);
