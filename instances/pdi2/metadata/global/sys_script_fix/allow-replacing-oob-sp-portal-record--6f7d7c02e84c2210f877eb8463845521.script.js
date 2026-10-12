if (!pm.isZboot()) {
    gs.info("Fix Script: Started OOB SP portal Upgrade Cleanup");

    var isSpOob = function () {
        var gr = new GlideRecord("sys_update_version");
        gr.addQuery("name", "sp_portal_81b75d3147032100ba13a5554ee4902b");
        // query sys_updated_by where it is non empty and doesn't equals to  'system'
        gr.addNotNullQuery("sys_updated_by");
        gr.addQuery("sys_updated_by", "!=", "system");
        gr.query();
        if (gr.next())
            return false;
        return true;
    };

    if (isSpOob()) {
        var gr = new GlideRecord("sys_update_xml");
        gr.addQuery("name", "sp_portal_81b75d3147032100ba13a5554ee4902b");
        gr.query();
        if (gr.next()) {
            gs.info("Setting the update xml file of the OOB sp portal record to replace on upgrade.");
            gr.replace_on_upgrade = true;
            gr.setWorkflow(false);
            gr.update();
            gs.info("OOB SP portal record will be replaced on next change");
        }
    }
}
if (pm.isZboot()) {
    gs.info("ZBoot instance: Setting Coral as default theme for OOB SP");

    var cleanup = function(name) {
    	var version = new GlideRecord("sys_update_version");
        version.addQuery("name", name);
        version.setWorkflow(false);
        version.query();
        version.deleteMultiple();

        var update = new GlideRecord("sys_update_xml");
        update.addQuery("name", name);
        update.setWorkflow(false);
        update.query();
        update.deleteMultiple();
    };

    var setContainerBackground = function() {
		var gr = new GlideRecord('sp_container');
		gr.addQuery('sys_id', 'be98a8d2cb20020000f8d856634c9c63');
		gr.query();
		if (gr.next()) {
			gr.setValue('background_image', '02b15be943671210ca4c1f425db8f242');
			gr.setWorkflow(false);
			gr.update();
			cleanup('sp_container_be98a8d2cb20020000f8d856634c9c63');
			gs.info("OOB SP Container background image changed to Coral");
		}

		gr = new GlideRecord('sys_attachment');
		gr.addQuery('sys_id', '02b15be943671210ca4c1f425db8f242');
		gr.addQuery('table_sys_idISEMPTY');
		gr.query();
		if (gr.next()) {
			gr.setValue('table_sys_id', 'be98a8d2cb20020000f8d856634c9c63');
			gr.setWorkflow(false);
			gr.update();
			gs.info("OOB SP background image attachment linked to SP Container");
		}
	};

	var linkAttachmentIds = function() {
		var gr = new GlideRecord('sys_attachment');
		gr.addQuery('sys_id', 'IN', '28554274432fd210ca4c1f425db8f21a,a33ef5dd43535610ca4c1f425db8f2f0');
		gr.query();
		while (gr.next()) {
			gr.setValue('table_sys_id', '81b75d3147032100ba13a5554ee4902b');
			gr.setWorkflow(false);
			gr.update();
		}
		gs.info("OOB SP logo and icon attachment linked to SP Portal");
	};

    var sp = new GlideRecord('sp_portal');
    var updated = false;
    sp.addQuery('sys_id', '81b75d3147032100ba13a5554ee4902b');
    sp.query();
    if (sp.next()) {
        var theme = new GlideRecord('sp_theme');
        if (theme.get('281507c44317d210ca4c1f425db8f2fd')) {
            sp.setValue('theme', '281507c44317d210ca4c1f425db8f2fd');
            sp.setValue('logo', 'a33ef5dd43535610ca4c1f425db8f2f0');
            sp.setValue('icon', '28554274432fd210ca4c1f425db8f21a');
            sp.setWorkflow(false);
            sp.update();
            setContainerBackground();
            linkAttachmentIds();
            updated = true;
            gs.info("OOB SP Theme changed to Coral");
        }
    }

    if (updated == true) {
        cleanup('sp_portal_81b75d3147032100ba13a5554ee4902b');
        gs.info("Cleaned up OOB SP script customizations");
    }
}
