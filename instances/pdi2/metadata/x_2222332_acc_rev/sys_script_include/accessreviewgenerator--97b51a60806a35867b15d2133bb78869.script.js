var AccessReviewGenerator = Class.create();
AccessReviewGenerator.prototype = {
    initialize: function() {
        this.reviewers = {};
        this.existing = {};
        this.created = 0;
    },

    // Creates one review item per active user and direct access in the campaign's scope, once per
    // source assignment, then opens the campaign for review (FR-02 to FR-04, FR-11).
    generate: function(campaign) {
        this._loadExisting(campaign);
        var type = campaign.getValue('review_type');
        if (type == 'roles' || type == 'both') {
            this._roles(campaign);
        }
        if (type == 'groups' || type == 'both') {
            this._groups(campaign);
        }
        this._notifyReviewers(campaign);
        campaign.setValue('state', '2');
        campaign.update();
        new AccessReviewDecision().refreshTotals(campaign.getUniqueValue());
        return this.created;
    },

    // Items already generated, so a relaunch after a failure never creates one twice.
    _loadExisting: function(campaign) {
        var item = new GlideRecord('x_2222332_acc_rev_review_item');
        item.addQuery('campaign', campaign.getUniqueValue());
        item.query();
        while (item.next()) {
            this.existing[item.getValue('source_id')] = true;
        }
    },

    _roles: function(campaign) {
        var assignment = new GlideRecord('sys_user_has_role');
        assignment.addQuery('inherited', false);
        assignment.addQuery('state', 'active');
        var roles = campaign.getValue('role_filter');
        if (roles) {
            assignment.addQuery('role', 'IN', roles);
        }
        assignment.query();
        while (assignment.next()) {
            this._add(campaign, assignment, 'role', assignment.getValue('role'), '');
        }
    },

    _groups: function(campaign) {
        var membership = new GlideRecord('sys_user_grmember');
        var groups = campaign.getValue('group_filter');
        if (groups) {
            membership.addQuery('group', 'IN', groups);
        }
        membership.query();
        while (membership.next()) {
            this._add(campaign, membership, 'group', '', membership.getValue('group'));
        }
    },

    _add: function(campaign, source, accessType, role, group) {
        var user = source.user.getRefRecord();
        if (!user.isValidRecord() || !user.active || this.existing[source.getUniqueValue()]) {
            return;
        }
        var reviewer = this._reviewerOf(user, campaign);
        var item = new GlideRecord('x_2222332_acc_rev_review_item');
        item.initialize();
        item.setValue('campaign', campaign.getUniqueValue());
        item.setValue('subject_user', user.getUniqueValue());
        item.setValue('access_type', accessType);
        item.setValue('role', role);
        item.setValue('group', group);
        item.setValue('source_id', source.getUniqueValue());
        item.setValue('assigned_to', reviewer.id);
        item.setValue('no_manager', reviewer.noManager);
        item.setValue('due_date', campaign.getValue('due_date'));
        item.setValue('short_description', 'Review ' + (role ? source.role.getDisplayValue()
            : source.group.getDisplayValue()) + ' for ' + user.getDisplayValue());
        item.insert();
        this.existing[source.getUniqueValue()] = true;
        this.reviewers[reviewer.id] = (this.reviewers[reviewer.id] || 0) + 1;
        this.created++;
    },

    // The user's manager when active; otherwise the campaign's administrator (FR-04).
    _reviewerOf: function(user, campaign) {
        var manager = user.manager.getRefRecord();
        if (manager.isValidRecord() && manager.active) {
            return { id: manager.getUniqueValue(), noManager: false };
        }
        return { id: campaign.getValue('assigned_to'), noManager: true };
    },

    _notifyReviewers: function(campaign) {
        for (var reviewer in this.reviewers) {
            gs.eventQueue('x_2222332_acc_rev.reviewer.assigned', campaign, reviewer, this.reviewers[reviewer]);
        }
    },

    type: 'AccessReviewGenerator'
};
