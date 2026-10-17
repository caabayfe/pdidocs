var WrapUpInteractionAjaxUtil = Class.create();
WrapUpInteractionAjaxUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    isWrapUpEnabled: function() {
        var sysId = this.getParameter('sysparm_recSysId');
		var intGr = new GlideRecordSecure("interaction");
        intGr.addQuery('sys_id', sysId);
        intGr.query();

        if (intGr.next()) {
            return new WrapUpInteractionUtil().isWrapUpEnabled(intGr);
        }
        return false;
    },

    type: 'WrapUpInteractionAjaxUtil'
});
