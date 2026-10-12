var ACLDescriber = Class.create();

ACLDescriber.prototype = {
    /**
     * Adds or updates the description on the provided ACL if one is not already present, 
     * this script auto-generated the description and it needs to be updated, or the caller
     * has specified that we should override the existing description
     */
    ensureDescription: function(gr, overwrite) {
        if (!this.shouldUpdate(gr, overwrite))
            return;

        // generate our text...
        this.analyze(gr);
        var text = '';
        text += this.isDenyType(gr) ? 'Deny ' : 'Allow ';
        text += gr.operation.name;
        text += ' for ';
        text += this.field;
        text += ' in ';
        text += this.table;

        // if the operation is report_view or report_on, do not include applies_to configuration in the description
        if (!(gr.operation.name == 'report_view') && !(gr.operation.name == 'report_on'))
            text += this.getAppliesTo(gr);

        text += ', ';
        text += this.getWhen(gr);
        text += '.';

        gr.description = text;
    },

    getAppliesTo: function(gr) {
        if (gs.nil(gr.applies_to))
            return '';

        return ' if the record matches the criteria (' + gr.applies_to + ')';
    },

    getWhen: function(gr) {
        var clause = '';

        // if roles are specified, list 'em...
        var roles = this.getRoles(gr);
        if (roles.length == 1) {
            clause += this.isDenyType(gr) ? 'unless users have the role ' : 'for users with role ';
            clause += roles[0];
        } else if (roles.length > 1) {
            clause += this.isDenyType(gr) ? 'unless users have at least one of the roles (' : 'for users with roles (';
            clause += roles.join(', ');
            clause += ')';
        }

        // if a security attribute is specified, provide its name...
        if (!gs.nil(gr.security_attribute)) {
            if (clause.length > 0)
                clause += ', and ';

            if (clause.length == 0 && this.isDenyType(gr))
                clause += 'unless ';

            var att = gr.security_attribute.getDisplayValue();
            if (this.isDenyType(gr))
                clause += 'users satisfy the conditions of the Security Attribute "' + att + '"';
            else
                clause += 'if users satisfy the conditions of the Security Attribute "' + att + '"';
        }

        // if a script is specified, say so...
        if (!gs.nil(gr.script)) {
            if (clause.length > 0)
                clause += ', and ';

            if (clause.length == 0 && this.isDenyType(gr))
                clause += 'unless ';

            clause += this.isDenyType(gr) ? 'the ACL script returns true' : 'if the ACL script returns true';
        }

        // if a condition is specified, say so...
        if (!gs.nil(gr.condition)) {
            if (clause.length > 0)
                clause += ', and ';

            if (clause.length == 0 && this.isDenyType(gr))
                clause += 'unless ';

            clause += this.isDenyType(gr) ? 'the ACL condition (' : 'if the ACL condition (';
            clause += gr.condition;
            clause += ') evaluates to true';
        }

        // no conditions - we either always allow or always deny
        if (clause == '') {
            if (this.isEmptyAllowAclDefaultDenyDisabled() && !this.isDenyType(gr)) {
                // if the default deny property is false and it's an allow type ACL, we'll allow access by default
                clause += 'always (all ACL conditions are empty)';
            } else if (this.isDenyType(gr)) {
                // for denies we say we deny access always
                clause += 'always (all ACL conditions are empty)';
            } else {
                // for allows we say we allow access never
                clause += 'never (all ACL conditions are empty)';
            }
        }

        return clause;
    },

    getRoles: function(gr) {
        var m2m_gr = new GlideRecord('sys_security_acl_role');
        m2m_gr.addQuery('sys_security_acl', gr.sys_id);
        m2m_gr.query();
        var results = [];
        while (m2m_gr.next()) {
            var role_gr = new GlideRecord('sys_user_role');
            if (role_gr.get(m2m_gr.sys_user_role))
                results.push('' + role_gr.name);
        }
        return results;
    },

    analyze: function(gr) {
        var parts = ('' + gr.name).split('.');
        this.table = (parts[0] == '*') ? 'all tables' : parts[0];
        if (parts.length == 1)
            this.field = 'records';
        else if (parts[1] == '*')
			this.field = 'all fields';
		else if (this.isDataTypeAcl(parts[1])) {
			var typeRestrictedByDataTypeAcl = this.extractLettersBetweenBrackets(parts[1]);
			this.field = 'all fields of data type ' + '"' + typeRestrictedByDataTypeAcl + '"';
		} else
			this.field = parts[1];
	},

    shouldUpdate: function(gr, overwrite) {
        // if we don't have a valid GlideRecord for an ACL, bail...
        if (!gr || !gr.isValidRecord() || gr.getTableName() != 'sys_security_acl')
            return false;

        // if this isn't a record type ACL, bail...
        if (gr.type != 'record')
            return false;

        // if we already have a description that we didn't write, and we're not overwriting, bail...
        var descr = '' + gr.description;
        if (descr == null)
            descr = '';

        // examples of messages this regex needs to match:
        // - Deny read for additional_assignee_list in sc_task, unless users have the role admin.
        // - Allow write for active in incident, for users with roles (admin, itil), and if the ACL script returns true, and if the ACL condition (active=true^EQ) evaluates to true.
        // - Deny write for records in all tables, unless the ACL script returns true.
        // - Deny write for all fields in all tables, always (all ACL conditions are empty).
        var denyMatch = descr.match(/^Deny .*? for .*? in .*?( if the record meets the criteria .*)?, (?:never \(all ACL conditions are empty\)|(unless users have the role.*?|unless users have at least one of the roles.*?)?(, and )?((?:unless )?users satisfy the conditions of the Security Attribute .*?)?(, and )?((?:unless )?the ACL script returns true)?(, and )?((?:unless )?the ACL condition \(.*?\) evaluates to true)?)\.$/);
        var allowMatch = descr.match(/^Allow .*? for .*? in .*?( if the record meets the criteria .*)?, (?:always \(all ACL conditions are empty\)|never \(all ACL conditions are empty\)|(for users with role.*?)?(, and )?((?:if )?users satisfy the conditions of the Security Attribute .*?)?(, and )?((?:if )?the ACL script returns true)?(, and )?((?:if )?the ACL condition \(.*?\) evaluates to true)?)\.$/);
        if (!(denyMatch || allowMatch) && !overwrite && !gs.nil(gr.description))
            return false;

        // we've passed the gauntlet...
        return true;
    },

    isDenyType: function(gr) {
        return gr.decision_type == 'deny';
    },

	isDataTypeAcl: function(fieldPortion) {
		return this.fieldPortionHasOnePairOfOpeningAndClosingBrackets(fieldPortion);
	},

	fieldPortionHasOnePairOfOpeningAndClosingBrackets: function(str) {
		return /^\[[^\[\]]*\]$/.test(str);
	},

	extractLettersBetweenBrackets: function (str) {
		// target the characters found between the brackets
		return str.match(/\[(.*?)\]/)[1]; 
	},
	
	isEmptyAllowAclDefaultDenyDisabled: function() {
        return gs.getProperty('glide.security.enable.deny_empty_or_invalid_acl_validation', 'true') != 'true';
    },

    type: 'ACLDescriber'
};
