var TrackFavoriteTemplateAjax = Class.create();
TrackFavoriteTemplateAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	trackFavorite: function() {
        var templateId = this.getParameter('sysparm_template_id');
        var userId = gs.getUserID();
        var newFavoriteValue = this.getParameter('sysparm_favorite_value');

        return this.updateOrInsertTemplateFavorite(templateId, userId, newFavoriteValue);
    },
	updateOrInsertTemplateFavorite: function(templateId, userId, newFavoriteValue) {
		try {
            if (!this.checkTemplateExists(templateId)) {
                gs.error("Template ID does not exist: " + templateId);
                return false;
            }

			var gr = new GlideRecordSecure('sys_template_usage');
			gr.addQuery('template', templateId);
			gr.addQuery('user', userId);
			gr.query();

			if (gr.next()) {
				gr.favorite = newFavoriteValue;
				gr.update();
			} else {
				gr.initialize();
				gr.template = templateId;
				gr.user = userId;
				gr.favorite = newFavoriteValue;
				gr.insert();
			}
			return true;
		} catch (err) {
			gs.error("Error in updating/inserting favorite template: "+ err.message);
			return false;
		}

    },
	checkTemplateExists: function(templateId) {
        var templateCheck = new GlideRecordSecure('sys_template');
        return templateCheck.get("sys_id", templateId);
    },
    type: 'TrackFavoriteTemplateAjax'
});
