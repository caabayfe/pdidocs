var NLUModelCategoryUtil = Class.create();


(function() {

    var constants = NLUConstants.constants;

    NLUModelCategoryUtil.prototype = {
        initialize: function() {},

        type: 'NLUModelCategoryUtil'
    };

    NLUModelCategoryUtil.isVAEnabled = function() {
        if (GlidePluginManager.isActive('com.glide.cs.chatbot')) {
            return true;
        }
        return false;
    };
	
	NLUModelCategoryUtil.isIAREnabled = function() {
        if (gs.getProperty(NLUConstants.SYS_PROPS.ENABLE_IAR_MODEL_CAT, "false") == "true") {
            return true;
        }
        return false;
    };

    NLUModelCategoryUtil.getValidCategories = function() {
        var categories = [{
            label: gs.getMessage("Search"),
            value: constants.MODEL_CAT_SEARCH
        }];
        if (NLUModelCategoryUtil.isVAEnabled()) {
            categories.push({
                label: gs.getMessage("Virtual Agent"),
                value: constants.MODEL_CAT_VA
            });
        }
        if (NLUModelCategoryUtil.isIAREnabled()) {
            categories.push({
                label: gs.getMessage("Issue Auto Resolution"),
                value: constants.MODEL_CAT_IAR
            });
        }
        return categories;
    };

    NLUModelCategoryUtil.getDefaultModelCategory = function() {
        var category = constants.MODEL_CAT_SEARCH;
        if (NLUModelCategoryUtil.isVAEnabled()) {
            category = constants.MODEL_CAT_VA;
        }
        return category;
    };

    NLUModelCategoryUtil.isValidCategory = function(category) {
        var categories = NLUModelCategoryUtil.getValidCategories();
        for (var i = 0, j = categories.length; i < j; i++) {
            if (categories[i].value == category) {
                return true;
            }
        }
        return false;
    };

})();
