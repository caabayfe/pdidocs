var EstimateCalculatorAjax = Class.create();
EstimateCalculatorAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    calculate: function() {
        var destroyRuleId = this._getDestroyRuleId();
        var archiveDuration = this.getParameter("sysparm_archive_duration");
        return this._setAndGetDestroyEstimate(destroyRuleId, archiveDuration);
    },

    _getDestroyRuleId: function() {
        var destroyRuleId = this.getParameter("sysparm_destroy_rule_id");
        if (!destroyRuleId) {
            var archiveRuleId = this.getParameter("sysparm_archive_rule_id");
            var archiveGr = new GlideRecordSecure('sys_archive');
            if (archiveRuleId && archiveGr.get(archiveRuleId)) {
                destroyRuleId = archiveGr.getValue('destroy_rule');
            }
        }

        return destroyRuleId;
    },

    _setAndGetDestroyEstimate: function(destroyRuleId, archiveDuration) {
        var result = this.newItem("result");
        if (destroyRuleId) {
            var destroyStatus = new GlideArchiveDestroyStatus(destroyRuleId);
            destroyStatus.setEstimate(destroyRuleId, archiveDuration);
            var archiveDestroyGr = new GlideRecordSecure('sys_archive_destroy');
            if (archiveDestroyGr.get(destroyRuleId)) {
                var recordEstimate = 'record_estimate';
                var estimateDate = 'estimate_date';
                result.setAttribute(recordEstimate, archiveDestroyGr.getValue(recordEstimate));
                result.setAttribute(estimateDate, archiveDestroyGr.getValue(estimateDate));
            }
        }

        return result;
    }

});
