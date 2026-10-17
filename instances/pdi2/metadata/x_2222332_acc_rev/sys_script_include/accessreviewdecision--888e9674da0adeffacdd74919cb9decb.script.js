var AccessReviewDecision = Class.create();
AccessReviewDecision.prototype = {
    initialize: function() {},

    // After a reviewer's decision: a revoke opens a revocation task (FR-08); the campaign's totals
    // follow (FR-10) and it completes when nothing is pending (FR-15). Expiry and cancellation
    // refresh the totals once, after all their items.
    applied: function(item) {
        if (item.getValue('decision') == 'revoke') {
            this._openRevocation(item);
        }
        this.refreshTotals(item.getValue('campaign'));
    },

    refreshTotals: function(campaignId) {
        var campaign = new GlideRecord('x_2222332_acc_rev_campaign');
        if (!campaign.get(campaignId)) {
            return;
        }
        var counts = {};
        var total = 0;
        var tally = new GlideAggregate('x_2222332_acc_rev_review_item');
        tally.addQuery('campaign', campaignId);
        tally.addAggregate('COUNT');
        tally.groupBy('decision');
        tally.query();
        while (tally.next()) {
            var count = parseInt(tally.getAggregate('COUNT'), 10);
            counts[tally.getValue('decision')] = count;
            total += count;
        }
        var pending = counts.pending || 0;
        campaign.setValue('total_items', total);
        campaign.setValue('decided_items', total - pending);
        campaign.setValue('percent_complete', total ? Math.round((total - pending) * 1000 / total) / 10 : 0);
        var finished = campaign.getValue('state') == '2' && pending === 0;
        if (finished) {
            campaign.setValue('state', '3');
        }
        campaign.update();
        if (finished) {
            gs.eventQueue('x_2222332_acc_rev.campaign.finished', campaign, this._summary(counts), '');
        }
    },

    // Cancels a campaign and its pending items (FR-16). The campaign is cancelled first, so the
    // totals refreshed afterwards never complete it.
    cancel: function(campaign) {
        campaign.setValue('state', '7');
        campaign.update();
        var item = new GlideRecord('x_2222332_acc_rev_review_item');
        item.addQuery('campaign', campaign.getUniqueValue());
        item.addQuery('decision', 'pending');
        item.query();
        while (item.next()) {
            item.setValue('decision', 'cancelled');
            item.update();
        }
        this.refreshTotals(campaign.getUniqueValue());
    },

    _openRevocation: function(item) {
        var task = new GlideRecord('x_2222332_acc_rev_revocation');
        task.initialize();
        task.setValue('review_item', item.getUniqueValue());
        task.setValue('subject_user', item.getValue('subject_user'));
        task.setValue('access_type', item.getValue('access_type'));
        task.setValue('role', item.getValue('role'));
        task.setValue('group', item.getValue('group'));
        task.setValue('source_id', item.getValue('source_id'));
        task.setValue('assignment_group', item.campaign.fulfilment_group.toString());
        task.setValue('short_description', 'Remove ' + this._accessName(item) + ' from '
            + item.subject_user.getDisplayValue());
        task.setValue('description', 'Revoked by ' + item.decided_by.getDisplayValue()
            + ' in ' + item.campaign.getDisplayValue() + ': ' + item.getValue('justification'));
        task.insert();
    },

    _accessName: function(item) {
        return item.getValue('access_type') == 'role' ? 'role ' + item.role.getDisplayValue()
            : 'membership of ' + item.group.getDisplayValue();
    },

    _summary: function(counts) {
        return 'kept ' + (counts.keep || 0) + ', revoked ' + (counts.revoke || 0)
            + ', expired ' + (counts.expired || 0);
    },

    type: 'AccessReviewDecision'
};
