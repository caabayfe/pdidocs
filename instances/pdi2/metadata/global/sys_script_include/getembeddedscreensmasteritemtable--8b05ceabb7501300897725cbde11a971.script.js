var GetEmbeddedScreensMasterItemTable = Class.create();
GetEmbeddedScreensMasterItemTable.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    getMasterItemTableName: function() {
        var embeddedScreenId = this.getParameter('sysparm_embedded_screen_id');
        var embeddedScreenGR = new GlideRecord('sys_sg_screen');
        if (!embeddedScreenGR.canRead()) {
            MobileMessageUtil.addSecurityErrorForTable('sys_sg_screen');
            return "";
        }

        embeddedScreenGR.get(embeddedScreenId);
        if (!embeddedScreenGR.isValidRecord()) {
            gs.error("Invalid embedded screen id");
            var errorMessage = gs.getMessage("Invalid embedded screen id");
            gs.addErrorMessage(errorMessage);
            return "";
        }

        return embeddedScreenGR.parent.table;
    },
    type: 'GetEmbeddedScreensMasterItemTable'
});
