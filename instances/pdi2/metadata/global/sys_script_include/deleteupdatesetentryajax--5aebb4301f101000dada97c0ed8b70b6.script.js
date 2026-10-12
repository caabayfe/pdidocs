var DeleteUpdateSetEntryAjax = Class.create();

DeleteUpdateSetEntryAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    deleteEntries: function() {
        var updateXmlGR = new GlideRecord('sys_update_xml');
        if (!GlideSecurityManager.tableLevelACLAllow(updateXmlGR, 'delete'))
            return false;
        
        var entries = this.getParameter('sysparm_entry_ids');
        var sysIds  = entries.split(",");
        var i = 0;
        while(updateXmlGR.get(sysIds[i])) {
			if (updateXmlGR.canDelete())
				updateXmlGR.deleteRecord();
			
			i++;
        }
        return true;
    },
    
    toString: function() { return 'DeleteUpdateSetEntryAjax'; }
});
