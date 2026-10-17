var PostMajorIncidentSummarySNC = Class.create();
PostMajorIncidentSummarySNC.prototype = {
    initialize: function() {
        this.constants = new PostIncidentReportConstants();
        this.pirUtil = new PostIncidentReportUtil();
    },

    syncIncidentSummary: function(incidentSysID) {
        var incidentGR = this.pirUtil.getIncidentRecord(incidentSysID);
        if (incidentGR.next()) {
            var shortDescription = incidentGR.getDisplayValue(this.constants.INCIDENT.SHORT_DESCRIPTION);
            var description = incidentGR.getDisplayValue(this.constants.INCIDENT.DESCRIPTION);
            var businessImpact = incidentGR.getDisplayValue(this.constants.INCIDENT.BUSINESS_IMPACT);
            var closeNotes = incidentGR.getDisplayValue(this.constants.INCIDENT.CLOSE_NOTED);
            var pirGR = this.pirUtil.getPirByIncidentSysId(incidentSysID);
            if (pirGR.next()) {
                var incidentSummary = this._getPostIncidentSummary(shortDescription, description, businessImpact, closeNotes);
                pirGR.setValue('report_draft', incidentSummary);
                pirGR.update();
            }
        }
    },

    _getPostIncidentSummary: function(shortDescription, description, businessImpact, closeNotes) {
        shortDescription = shortDescription ? shortDescription : "--";
        description = description ? description : "--";
        businessImpact = businessImpact ? businessImpact : "--";
        closeNotes = closeNotes ? closeNotes : "--";
        var styles = this.constants.INCIDENT_SUMMARY_STYLES;
        var styleHeader = '<span style="' + styles.header + '">';
        var summaryInfo = '</span><span style="' + styles.shortDescription + '">' + shortDescription + '</span><span style="' + styles.plainText + '">' + description + '</span><span style="' + styles.header + '">';
        var impactInfo = '</span><span style="' + styles.plainText + '">' + businessImpact + '</span><span style="' + styles.header + '">';
        var resolutionInfo = '</span><span style="' + styles.lastSectionText + '">' + closeNotes + '</span>';
	var incidentSummary = styleHeader + "Summary" + summaryInfo + "Impact" + impactInfo + "Resolution" + resolutionInfo;
        return incidentSummary;
    },

    type: 'PostMajorIncidentSummarySNC'
};
