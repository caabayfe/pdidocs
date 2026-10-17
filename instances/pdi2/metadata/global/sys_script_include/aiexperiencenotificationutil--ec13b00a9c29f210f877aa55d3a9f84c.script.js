var AIExperienceNotificationUtil = Class.create();
AIExperienceNotificationUtil.prototype = Object.extendsObject(AIExperienceNotificationUtilSNC, {
        initialize: function() {
            AIExperienceNotificationUtilSNC.prototype.initialize.apply(this, arguments);
        },

        type: 'AIExperienceProviderUtil'
    });
