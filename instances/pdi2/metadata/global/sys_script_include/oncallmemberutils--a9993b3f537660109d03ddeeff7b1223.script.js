var OnCallMemberUtils = Class.create();
OnCallMemberUtils.prototype = Object.extendsObject(OnCallMemberUtilsSNC, {
    initialize: function() {
		OnCallMemberUtilsSNC.prototype.initialize.call(this);
    },
    type: 'OnCallMemberUtils'
});
