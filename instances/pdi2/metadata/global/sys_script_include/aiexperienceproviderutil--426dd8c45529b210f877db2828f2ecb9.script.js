var AIExperienceProviderUtil = Class.create();
    AIExperienceProviderUtil.prototype = Object.extendsObject(AIExperienceProviderUtilSNC, {
        initialize: function() {
            AIExperienceProviderUtilSNC.prototype.initialize.apply(this, arguments);
        },

        type: 'AIExperienceProviderUtil'
    });
