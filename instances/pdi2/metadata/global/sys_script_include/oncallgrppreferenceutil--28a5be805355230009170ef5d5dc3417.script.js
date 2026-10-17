var OnCallGrpPreferenceUtil = Class.create();
OnCallGrpPreferenceUtil.prototype = Object.extendsObject(OnCallGrpPreferenceUtilSNC, {
    initialize: function() {
		OnCallGrpPreferenceUtilSNC.prototype.initialize.call(this);
    },

    type: 'OnCallGrpPreferenceUtil'
});
