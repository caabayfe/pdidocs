var SOWIncidentUtilsAjaxSNC = Class.create();
SOWIncidentUtilsAjaxSNC.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    initialize: function(request, responseXML, gc) {
        global.AbstractAjaxProcessor.prototype.initialize.call(this, request, responseXML, gc);
    },

    ajaxFunction_createKnowledgeGap: function() {
        var incidentSysId = this.getParameter("sysparm_incident");
        var topic = this.getParameter("topic");
        var description = this.getParameter("description");
        var incGr = new GlideRecord("incident");
        if (incGr.get(incidentSysId)) {
            var gr = new GlideRecord('kb_feedback_task');
            gr.initialize();
            gr.short_description = topic;
            gr.description = description;
            gr.parent = incidentSysId;
            gr.opened_by = gs.getUserID();
            if (gr.insert()) {
                var url = '<a href="' + gr.getLink(true) + '">' + gr.getDisplayValue() + '</a>';
                return gs.getMessage("<b>Knowledge gap reported</b> Find this record under related lists to add additional comments. {0}", url);
            }
        }
    },

    ajaxFunction_reopenIncident: function() {
        var response = {};
        try {
            var sysId = this.getParameter('sysparm_sys_id');
            var updatedFields = JSON.parse(this.getParameter('sysparm_updated_fields'));
            var gr = new GlideRecord('incident');
            if (gr.get(sysId)) {
                for (var fieldName in updatedFields) {
                    gr[fieldName] = updatedFields[fieldName];
                }
                gr.incident_state = global.IncidentState.IN_PROGRESS;
                gr.state = global.IncidentState.IN_PROGRESS;
                if (gr.update()) {
                    var msg;
                    if (gr.child_incidents > 0) {
                        msg = sn_i18n.Message.getMessage("sn_sow_inc", "{incident} and its child incident(s) have been reopened", {
                            incident: gr.getDisplayValue()
                        });
                    } else {
                        msg = sn_i18n.Message.getMessage("sn_sow_inc", "{incident} has been reopened", {
                            incident: gr.getDisplayValue()
                        });
                    }
                    response = {
                        status: "success",
                        message: msg
                    };
                } else {
                    response = {
                        status: "error",
                        message: sn_i18n.Message.getMessage("sn_sow_inc", "Failed to reopen {incident}", {
                            incident: gr.getDisplayValue()
                        })
                    };
                }
            }
        } catch (ex) {
            gs.error("[SOWIncidentUtilsAjax]: reopenIncident failed with error \n" + ex);
            response = {
                status: "error",
                message: sn_i18n.Message.getMessage("sn_sow_inc", "Failed to reopen the Incident")
            };
        }
        return JSON.stringify(response);
    },

    type: 'SOWIncidentUtilsAjaxSNC'
});
