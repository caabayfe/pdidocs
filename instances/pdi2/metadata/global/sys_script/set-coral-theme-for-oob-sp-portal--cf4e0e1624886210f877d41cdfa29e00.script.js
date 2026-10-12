(function executeRule(current, previous /*null when async*/ ) {
    var isOobRecord = function(name) {
        var gr = new GlideRecord("sys_update_version");
        gr.addQuery("name", name);
        // query sys_updated_by where it is non empty and doesn't equals to  'system'
        gr.addNotNullQuery("sys_updated_by");
        gr.addQuery("sys_updated_by", "!=", "system");
        gr.query();
        if (gr.next())
            return false;
        return true;
    };

    var coralLogoId = 'a33ef5dd43535610ca4c1f425db8f2f0';
    var coralIconId = '28554274432fd210ca4c1f425db8f21a';
    var coralHeroId = '02b15be943671210ca4c1f425db8f242';
    var coralThemeId = '281507c44317d210ca4c1f425db8f2fd';

    var oldLogoId = '76ab92395bd56300a9ad49ed5a62bc9e';
    var oldIconId = '119fd2795bd56300a9ad49ed5a62bc40';
    var oldHeroId = 'f1e5a7525b112300a9ad49ed5a62bcd2';
    var oldThemeId = 'a7a6e78277002300a6e592718a10617a';

    var setContainerBackground = function(heroId) {
        if (isOobRecord('sp_container_be98a8d2cb20020000f8d856634c9c63')) {
            var gr = new GlideRecord('sp_container');
            gr.addQuery('sys_id', 'be98a8d2cb20020000f8d856634c9c63');
            gr.query();
            if (gr.next()) {
                gr.setValue('background_image', heroId);
                gr.update();
            }

            if (heroId === coralHeroId) {
                gr = new GlideRecord('sys_attachment');
                gr.addQuery('sys_id', coralHeroId);
                gr.addQuery('table_sys_idISEMPTY');
                gr.query();
                if (gr.next()) {
                    gr.setValue('table_sys_id', 'be98a8d2cb20020000f8d856634c9c63');
                    gr.setWorkflow(false);
                    gr.update();
                }
            }
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
    };

    if (isOobRecord('sp_portal_81b75d3147032100ba13a5554ee4902b')) {
        if (current.theme == coralThemeId) {
            current.logo = coralLogoId;
            current.icon = coralIconId;
            setContainerBackground(coralHeroId);
            linkAttachmentIds();
        } else if (current.theme == oldThemeId) {
            current.logo = oldLogoId;
            current.icon = oldIconId;
            setContainerBackground(oldHeroId);
        }
    }
})(current, previous);
