var NowAssistForSearchStatus = Class.create();
NowAssistForSearchStatus.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    type: 'NowAssistForSearchStatus',

    isActive: function() {
        return new GlidePluginManager().isActive('sn_ais_assist');
    }
});
