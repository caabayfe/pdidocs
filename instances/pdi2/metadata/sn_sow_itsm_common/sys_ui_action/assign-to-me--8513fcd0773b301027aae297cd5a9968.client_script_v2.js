function onClick(g_form) {
    getMessages(["Select Assignment Group", "Cancel", "Assign", "Assignment Group"], onCopy);

    function onCopy(tMsgs) {
        var ga = new GlideAjax("sn_sow_itsm_common.SOWITSMCommonClientUtils");
        ga.addParam("sysparm_name", "getMemberGroups");
        ga.addParam("userSysID", g_user.userID);
        ga.getXMLAnswer(function(response) {
            try {
                answer = JSON.parse(response);
            } catch (e) {
                return;
            }

            if (g_form.isMandatory("assignment_group") && answer.length > 1 && !g_form.getValue('assignment_group')) {
                var choices = [];
                for (var i = 0; i < answer.length; i++) {
                    choices.push({
                        displayValue: answer[i].displayName,
                        value: answer[i].sys_id,
                    });
                }
                g_modal.showFields({
                    title: tMsgs["Select Assignment Group"],
                    cancelTitle: tMsgs["Cancel"],
                    confirmTitle: tMsgs["Assign"],
                    cancelType: "default",
                    size: "md",
                    confirmType: "confirm",
                    fields: [{
                        type: 'choice',
                        name: 'assignment_group',
                        label: tMsgs['Assignment Group'],
                        choices: choices,
                        mandatory: true
                    }],
                }).then(function(fieldValues) {
                    g_form.setValue('assignment_group', fieldValues.updatedFields[0].value);
                    g_form.setValue('assigned_to', g_user.userID);
                    g_form.save();
                });
            } else {
                assignToMeHelper(answer);
            }
        });
    }
}

function assignToMeHelper(answer) {
    if (!g_form.getValue('assignment_group')) {
        var memberGroups = answer;
        if (memberGroups.length == 1)
            g_form.setValue('assignment_group', memberGroups[0].sys_id);
    }
    g_form.setValue('assigned_to', g_user.userID);
    g_form.save();
}
