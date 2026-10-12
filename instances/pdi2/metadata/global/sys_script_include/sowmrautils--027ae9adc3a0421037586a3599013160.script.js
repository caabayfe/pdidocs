var SOWMraUtils = Class.create();
    SOWMraUtils.prototype = {
        initialize: function() {
            this.TABLE_INCIDENT = 'incident';
            this.PARENT_INCIDENT_COL = 'parent_incident';
        },
    
        updateChildIncidentCount: function(id) {
            // GlideRecordSecure is not used as child_incidents column has ACL restriction to be non writable
            var rec = new GlideRecord(this.TABLE_INCIDENT);
            if (!rec.get(id))
                return;
    
            var gr = new GlideAggregate(this.TABLE_INCIDENT);
            gr.addQuery(this.PARENT_INCIDENT_COL, id);
            gr.addAggregate('COUNT');
            gr.query();
            var count = 0;
            if (gr.next())
                count = gr.getAggregate('COUNT');
    
            // Update child_incidents field only when the current value is different than the actual count
            // Reduces performance overhead of an un-necessary DML operation
            if (rec.child_incidents.nil() || rec.child_incidents != count) {
                rec.child_incidents = count;
                rec.update();
            }
        },

        getParentIncidents: function(childIncidentsQuery, parentRecordSysId) {
            var parentIncidents = [];
            if (!childIncidentsQuery)
                return parentIncidents;
            var gr = new GlideRecordSecure(this.TABLE_INCIDENT);
            gr.addEncodedQuery(childIncidentsQuery + '^parent_incidentISNOTEMPTY');
            gr.query();
            while (gr.next()) {
                var parent = gr.getValue(this.PARENT_INCIDENT_COL);
                if (!parentIncidents.includes(parent) && parent !== parentRecordSysId)
                    parentIncidents.push(parent);
            }
            return parentIncidents;
        },
    
        type: 'SOWMraUtils'
    };
