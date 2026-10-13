var AccessReviewSchedule = Class.create();
AccessReviewSchedule.prototype = {
    initialize: function() {
        this.now = new GlideDateTime();
        this.reminderDays = parseInt(gs.getProperty('x_2222332_acc_rev.reminder_interval_days', '3'), 10);
        this.escalationDays = parseInt(gs.getProperty('x_2222332_acc_rev.escalation_days_before_due', '2'), 10);
    },

    // Daily: expiry (FR-14), escalation (FR-13) and reminders (FR-12) for campaigns in review.
    // Each step is idempotent, so a missed or repeated run does no harm.
    run: function() {
        var campaign = new GlideRecord('x_2222332_acc_rev_campaign');
        campaign.addQuery('state', '2');
        campaign.query();
        while (campaign.next()) {
            var due = new GlideDateTime(campaign.getValue('due_date'));
            if (due.compareTo(this.now) <= 0) {
                this._expire(campaign);
                continue;
            }
            var escalateFrom = new GlideDateTime(due);
            escalateFrom.addDaysUTC(-this.escalationDays);
            if (escalateFrom.compareTo(this.now) <= 0) {
                this._escalate(campaign);
            }
            this._remind(campaign);
        }
    },

    _expire: function(campaign) {
        var item = this._pending(campaign);
        item.query();
        while (item.next()) {
            item.setValue('decision', 'expired');
            item.update();
        }
        new AccessReviewDecision().refreshTotals(campaign.getUniqueValue());
    },

    _escalate: function(campaign) {
        var counts = this._pendingByReviewer(campaign, 'escalated=false');
        var reviewers = Object.keys(counts);
        if (reviewers.length) {
            // One query for all reviewers, rather than one per reviewer.
            var user = new GlideRecord('sys_user');
            user.addQuery('sys_id', 'IN', reviewers.join(','));
            user.addNotNullQuery('manager');
            user.query();
            while (user.next()) {
                gs.eventQueue('x_2222332_acc_rev.reviewer.escalated', campaign, user.getValue('manager'),
                    user.getDisplayValue() + ' has ' + counts[user.getUniqueValue()] + ' pending item(s)');
            }
        }
        var item = this._pending(campaign);
        item.addQuery('escalated', false);
        item.setValue('escalated', true);
        item.updateMultiple();
    },

    _remind: function(campaign) {
        var since = new GlideDateTime(this.now);
        since.addDaysUTC(-this.reminderDays);
        var due = 'reminded_onISEMPTY^ORreminded_on<=' + since.getValue();
        var counts = this._pendingByReviewer(campaign, due);
        for (var reviewer in counts) {
            gs.eventQueue('x_2222332_acc_rev.reviewer.reminder', campaign, reviewer, counts[reviewer]);
        }
        var item = this._pending(campaign);
        item.addEncodedQuery(due);
        item.setValue('reminded_on', this.now);
        item.updateMultiple();
    },

    _pending: function(campaign) {
        var item = new GlideRecord('x_2222332_acc_rev_review_item');
        item.addQuery('campaign', campaign.getUniqueValue());
        item.addQuery('decision', 'pending');
        return item;
    },

    _pendingByReviewer: function(campaign, query) {
        var counts = {};
        var tally = new GlideAggregate('x_2222332_acc_rev_review_item');
        tally.addQuery('campaign', campaign.getUniqueValue());
        tally.addQuery('decision', 'pending');
        tally.addEncodedQuery(query);
        tally.addAggregate('COUNT');
        tally.groupBy('assigned_to');
        tally.query();
        while (tally.next()) {
            counts[tally.getValue('assigned_to')] = tally.getAggregate('COUNT');
        }
        return counts;
    },

    type: 'AccessReviewSchedule'
};
