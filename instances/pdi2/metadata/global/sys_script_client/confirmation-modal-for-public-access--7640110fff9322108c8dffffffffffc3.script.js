function onSubmit() {
    var oldValue = g_scratchpad.publicAccessOldValue || 'false';
    var newValue = g_form.getValue('public_access');
    var message = "";

    // Only trigger confirmation if the user hasn't already confirmed
    if (!g_scratchpad.publicAccessConfirmed) {

        // ===== False → True (enable public access) =====
        if (oldValue === 'false' && newValue === 'true') {
            var sourceType = g_form.getValue('source_type');
            var warningText = getMessage("You have enabled this activity to be available for use on Public Playbooks. If not configured correctly this could pose a security risk to sensitive data contained within the activity.");
            message = warningText +
                "<br/> <br/>" +
                (sourceType === "sys_hub_action_type_definition" ? g_scratchpad.RUN_AS_WARNING_ACTIONS : g_scratchpad.RUN_AS_WARNING_FLOWS) +
                "<br/> <br/>" +
                g_scratchpad.LEARN_MORE_LINK;

            showModal(getMessage("Enable Public Access?"), message, oldValue);
            return false; // block submission until confirmed
        }

        // ===== True → False (disable public access) =====
        if (oldValue === 'true' && newValue === 'false') {
            var ga = new GlideAjax('PlaybookAjaxADUtils');
            ga.addParam('sysparm_name', 'getPublicPDsUsingAD');
            ga.addParam('sys_id', g_form.getUniqueValue());
            ga.getXMLWait();
            var response = ga.getAnswer();
            var result = JSON.parse(response);
            var publicPDs = result.publicPDs || [];

            if (result.restrictedCount > 0) {
                var template = getMessage('Please note: {0} impacted playbooks are not shown because you do not have permission to view them.');
                result.message = template.replace('{0}', result.restrictedCount.toString());
            }

            if (publicPDs.length === 0) {
                // No affected playbooks visible - show generic warning
                var confirmText = getMessage("Making this activity definition private means you won't be able to use it within Public Playbooks. Are you sure?");
                message = "<p>" + confirmText + "</p>";
            } else {
                // Show affected playbooks
                var playbooksText = getMessage("This activity definition is used in the following Public Playbooks:");
                message = "<p>" + playbooksText + "</p><ul>";

                publicPDs.forEach(function(pd) {
                    var url = "/sys_pd_process_definition.do?sys_id=" + pd.sys_id;
                    message += '<li><a href="' + url + '" target="_blank" style="color: #1a73e8; text-decoration: underline;">' + pd.name + '</a></li>';
                });

                message += "</ul>";
                var confirmText = getMessage("Are you sure you want to remove public access for this activity definition?");
                message = message + "<p>" + confirmText + "</p>";
            }
            
            // Add restricted message from PlaybookAjaxADUtils script include
            if (result.message) {
                message += "<p style='font-style: italic; color: #666; margin-top: 10px;'>" + 
                           result.message + 
                           "</p>";
            }

            message += g_scratchpad.LEARN_MORE_LINK;
            showModal(getMessage("Disable Public Access?"), message, oldValue);

            return false; // block submission until confirmed
        }
    }

    // Reset the confirmation flag for next time
    g_scratchpad.publicAccessConfirmed = false;
    return true; // allow submission if already confirmed

    function showModal(title, message, oldValue) {
        var gm = new GlideModal('public_access_confirmation_modal');
        gm.setTitle(title);
        gm.setPreference('sysparm_message', message);
        gm.setPreference('sysparm_old_value', oldValue);
        gm.setWidth(500);
        gm.render();
    }
}
