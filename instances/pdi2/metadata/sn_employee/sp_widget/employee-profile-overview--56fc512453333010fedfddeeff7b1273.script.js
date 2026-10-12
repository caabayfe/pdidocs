(function() {
    var userId = $sp.getParameter("sys_id") || gs.getUserID();
    var sysUserGR = new GlideRecord('sys_user');
    data.hasUserProfile = true;
    if (!userId || !sysUserGR.get(userId)) {
        data.hasUserProfile = false;
        return;
    }

    var epPortalUtils = new sn_employee.ep_portalUtil(userId);
    data.content = options;
    data.userId = userId;
    data.messages = {};
    // widgetTitle will consider tab widget mapping table name attribute.
    data.widgetTitle = data.content.widgetTitle ? data.content.widgetTitle : gs.getMessage("About");
    data.messages.emptyFieldMsg = gs.getMessage("(empty)");
    data.messages.mobileHeader = gs.getMessage("Profile details");
    data.messages.makePublic = gs.getMessage("Make it public");
    data.messages.emptyMobileState = gs.getMessage("This information hasn't been set up by your admin");
    data.messages.save = gs.getMessage("Save");
    data.messages.cancel = gs.getMessage("Cancel");
    data.messages.charactersLeft = gs.getMessage("characters left");
    data.messages.charactersOver = gs.getMessage("characters over");
    data.sections = epPortalUtils.getOverviewSections('', data.content.tabWidgetMappingId);
    for (var i = 0; i < data.sections.length; i++) {
        var fields = data.sections[i].fields;
        var foundBio = false;
        for (var j = 0; j < fields.length; j++) {
            var field = fields[j];
            if (field.fieldName === 'short_bio') {
                field.fieldLabel = gs.getMessage("Bio");
                foundBio = true;
                break;
            }
        }
        if (foundBio)
            break;
    }

    data.publicProfileWidget = $sp.getWidget('public_profile_visibility', {
        'tabWidgetMappingId': data.content ? data.content.tabWidgetMappingId : '',
        'isUserSelectionEnabled': data.content ? data.content.isUserSelectionEnabled : '',
        'widgetTitle': data.content ? data.content.widgetTitle : ''
    });
    data.mobileSections = epPortalUtils.getOverviewSections("mobile");
    data.disableLinks = options.disable_links;
    data.expandAllSections = options.expand_all_sections;
    if (input && input.action == 'updateField') {
        if (input.data.hasOwnProperty('fieldValue'))
            epPortalUtils.updateEditableFields(input.fieldName, input.data.fieldValue);
        if (input.data.hasOwnProperty('isPublic'))
            epPortalUtils.updateUserPublicFieldPreference(input.fieldName, input.data.isPublic);
    }
})();
