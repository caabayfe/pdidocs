var KBContentTranslationUtil = Class.create();
KBContentTranslationUtil.prototype = Object.extendsObject(KBContentTranslationUtilSNC, {
    initialize: function() {
		KBContentTranslationUtilSNC.prototype.initialize.apply(this, arguments);
    },

    type: 'KBContentTranslationUtil'
});
