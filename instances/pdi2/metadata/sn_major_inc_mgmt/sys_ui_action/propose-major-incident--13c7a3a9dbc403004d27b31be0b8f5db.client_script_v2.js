function onClick(g_form) {
    function proposeMIC(data) {
        var workNotes = data.msg + "\n" + data.workNotes;
        var notes = g_form.getValue('work_notes') + ' ' + workNotes;
        var bi = g_form.getValue('business_impact') + ' ' + data.businessImpact;
        g_form.setValue('work_notes', notes.trim());
        g_form.setValue('business_impact', bi.trim());
        g_form.submit('sysverb_mim_propose');
    }

    function openPopup() {
        var missingMandatoryFields = getMissingFields();
        if (missingMandatoryFields.length > 0) {
            g_form.save();
        } else {
            if (!g_form.getControl('work_notes')) {
                getMessage('Cannot propose major incident as "Worknotes" is not visible', function(msg) {
                    g_form.addErrorMessage(msg);
                });
                return false;
            }

            var url = "/sn_major_inc_mgmt_mim_propose.do?sysparm_stack=no&sysparm_workspace=" + true;
            getMessage('Propose Major Incident', function(msg) {
                g_modal.showFrame({
                    title: msg,
                    url: url,
                    size: 'lg',
                    autoCloseOn: 'URL_CHANGED',
                    callback: function(ret, data) {
                        if (ret)
                            proposeMIC(data);
                    }
                });
            });

        }
    }

    function filterForMissingMandatoryFields(field) {
        if (g_form.isMandatory(field)) {
            return !g_form.getValue(field);
        }
    }

    function getMissingFields() {
        var fieldList = g_form.getFieldNames();
        //return only mandatory fields that have no value
        return fieldList.filter(filterForMissingMandatoryFields);
    }

    openPopup();
}
