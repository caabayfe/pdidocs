var DomainCleanupValidator = Class.create();
DomainCleanupValidator.prototype = {

    canMoveInactiveDomainsToStaging: function() {
        var gr = new GlideRecordSecure('domain_cleanup_queue');
        gr.addQuery('state', 'ready_for_staging');
        gr.query();
        return gr.hasNext();
    },

    canRunDomainDataCleanupJob: function() {
        var gr = new GlideRecordSecure('domain_cleanup_queue');
        gr.addQuery('state', 'staged_and_deletion_planned');
        gr.addQuery('planned_deletion_date', '<=', this.endOfYesterday());
        gr.query();
        return gr.next();
    },

    endOfYesterday: function() {
        var currentDateTime = new GlideDateTime();
        currentDateTime.addDays(-1); // Move the date back by 1 day
        var endOfYesterday = new GlideDateTime(currentDateTime);
        endOfYesterday.setValue(endOfYesterday.getDate() + " 23:59:59");
        return endOfYesterday.getValue();
    },

    type: 'DomainCleanupValidator'
};
