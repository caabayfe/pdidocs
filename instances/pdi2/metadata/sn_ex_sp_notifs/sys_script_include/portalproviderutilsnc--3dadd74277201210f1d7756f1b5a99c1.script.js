var PortalProviderUtilSNC = Class.create();
PortalProviderUtilSNC.prototype = {

    /**
     * Initializes the object with the parameters provided from portal provider.
     * @param {Object} deliveryContext - The delivery context object.
     * @param {Object} providerService - The provider service object.
     * @param {Object} destinations - The destinations object.
     */
    initialize: function(deliveryContext, providerService, destinations) {
        this.deliveryContext = deliveryContext;
        this.providerService = providerService;
        this.destinations = destinations;

        this.notificationGr = deliveryContext.getNotification();
        this.executionGr = deliveryContext.getExecution();
        this.recordGr = deliveryContext.getTarget();
        this.eventGr = deliveryContext.getEvent();
    },

    _log: function(message, isError) {
        if (isError)
            gs.error(`PortalProviderUtilSNC [ERROR]: ${message}`);
        else
            gs.info(`PortalProviderUtilSNC [INFO]: ${message}`);
    },

    /**
     * Converts a list to a JSON string.
     * @param {Array} list - The list to convert.
     * @returns {string} The JSON string representation of the list.
     */
    _listToString(list) {
        try {
            return JSON.stringify(list);
        } catch (e) {
            return JSON.stringify([]);
        }
    },

    /**
     * Evaluates the content script from the portal content configuration.
     * @param {Object} portalContentConfigGr - The portal content configuration GlideRecord.
     * @param {Array} previousActors - The list of previous actors.
     * @returns {Object} return value of the script
     */
    _evaluateContentScript: function(portalContentConfigGr, previousActors) {
        const evaluator = new GlideScopedEvaluator();
        evaluator.putVariable("current", this.recordGr);
        evaluator.putVariable("eventName", !gs.nil(this.eventGr) ? this.eventGr.name.toString() : "");
        evaluator.putVariable("eventParm1", !gs.nil(this.eventGr) && this.eventGr.parm1 ? this.eventGr.parm1.toString() : "");
        evaluator.putVariable("eventParm2", !gs.nil(this.eventGr) && this.eventGr.parm2 ? this.eventGr.parm2.toString() : "");
        evaluator.putVariable("previousActors", previousActors);

        try {
            return evaluator.evaluateScript(portalContentConfigGr, 'content_script');
        } catch (err) {
            gs.error("Error while evaluating content script" + err);
            return;
        }
    },

    /**
     * Retrieves the notification content based on the portal content configuration and previous actors.
     * @param {Object} portalContentConfigGr - The portal content configuration GlideRecord.
     * @param {Array} previousActors - The list of previous actors.
     * @returns {Object} The notification content object.
     */
    _getNotificationContent(portalContentConfigGr, previousActors) {
        const content = {
            actor: '',
            messageContentTemplate: '',
            messageContentParams: [],
            aggregatedContentTemplate: '',
            aggregatedContentParams: [],
            actionUrl: ''
        };

        if (portalContentConfigGr.getValue("advanced") === '1') {
            const results = this._evaluateContentScript(portalContentConfigGr, previousActors);
            content.actor = results.actor;
            content.messageContentTemplate = results.messageContentTemplate;
            content.messageContentParams = results.messageContentParams;
            content.aggregatedContentTemplate = results.aggregatedContentTemplate;
            content.aggregatedContentParams = results.aggregatedContentParams;
            content.actionUrl = results.actionUrl;
        } else {
            content.actionUrl = this.substituteVariables(portalContentConfigGr.action_url.toString(), this.recordGr) || "";
            content.actor = this.substituteVariables(portalContentConfigGr.actor.toString(), this.recordGr) || "";
            content.messageContentTemplate = portalContentConfigGr.content_template.toString() || "";
            const trimmedParamString = (portalContentConfigGr.content_params.toString() || "").split('\n').map(line => line.trim()).filter(line => line.length > 0).join('\n');
            content.messageContentParams = trimmedParamString ? trimmedParamString.split(",").map(el => this.substituteVariables(el, this.recordGr)) : [];
        }

        return content;
    },

    /**
     * Retrieves the existing notification content for aggregation.
     * @param {string} userID - The user ID.
     * @param {Object} portalContentConfigGr - The portal content configuration GlideRecord.
     * @returns {Object} The existing notification content GlideRecord.
     */
    _getExistingNotificationContent(userID, portalContentConfigGr) {
        const notificationContentGr = new GlideRecord(sn_ex_sp_notifs.PortalNotificationConstants.TABLE_NOTIFICATION_CONTENT);
        notificationContentGr.addQuery("user", userID);
        notificationContentGr.addQuery("record", this.recordGr.sys_id.toString());
        notificationContentGr.addQuery("notification_content_config", portalContentConfigGr.sys_id.toString());
        notificationContentGr.addQuery("notification", this.notificationGr.sys_id.toString());
        notificationContentGr.addQuery("reminder", false);
        notificationContentGr.addQuery("status", sn_ex_sp_notifs.PortalNotificationConstants.STATE_NEW);
        notificationContentGr.orderByDesc("sys_created_on");
        notificationContentGr.setLimit(1);
        notificationContentGr.query();
        if (notificationContentGr.next())
            return notificationContentGr;
    },

    /**
     * Inserts new notification content for a user.
     * @param {string} userID - The user ID.
     * @param {Object} notificationContent - The notification content object.
     * @param {Object} portalContentConfigGr - The portal content configuration GlideRecord.
     * @returns {Object} The inserted notification content GlideRecord.
     */
    _insertNotificationContent(userID, notificationContent, portalContentConfigGr) {
        const notificationContentGr = new GlideRecord(sn_ex_sp_notifs.PortalNotificationConstants.TABLE_NOTIFICATION_CONTENT);
        notificationContentGr.initialize();

        notificationContentGr.user = userID;
        notificationContentGr.actors = notificationContent.actor;
        notificationContentGr.action_url = notificationContent.actionUrl;
        notificationContentGr.content_template = notificationContent.messageContentTemplate;
        notificationContentGr.content_params = this._listToString(notificationContent.messageContentParams);
        notificationContentGr.critical = this.notificationGr.getValue("mandatory") === '1';
        notificationContentGr.order = this.notificationGr.getValue("mandatory") === '1' ? 200 : 100;
        notificationContentGr.notification = this.notificationGr.sys_id.toString();
        notificationContentGr.notification_content_config = portalContentConfigGr.sys_id.toString();
        notificationContentGr.portals = portalContentConfigGr.portals.toString();
        notificationContentGr.notification_executions = this.executionGr.sys_id.toString();
        notificationContentGr.active = true;
        notificationContentGr.reminder = false;
        notificationContentGr.status = sn_ex_sp_notifs.PortalNotificationConstants.STATE_NEW;

        if (!gs.nil(this.recordGr)) {
            notificationContentGr.table = this.recordGr.getTableName();
            notificationContentGr.record = this.recordGr.sys_id.toString();
        }

        if (!gs.nil(this.eventGr))
            notificationContentGr.events = this.eventGr.sys_id.toString();

        notificationContentGr.insert();
        return notificationContentGr;
    },

    /**
     * Aggregates the notification content with existing notification content.
     * @param {Object} existingNotificationContentGr - The existing notification content GlideRecord.
     * @param {Object} notificationContent - The notification content object.
     * @returns {Object} The updated notification content GlideRecord.
     */
    _aggregateNotificationContent(existingNotificationContentGr, notificationContent) {
        const actors = new Set(existingNotificationContentGr.actors ? existingNotificationContentGr.actors.toString().split(",") : []);

        // If there's an existing notification content for the set (actor, record, content_config), we need not aggregate.
        if (actors.has(notificationContent.actor)) return;

        actors.add(notificationContent.actor);

        const executions = new Set(existingNotificationContentGr.notification_executions.toString().split(","));
        executions.add(this.executionGr.sys_id.toString());

        existingNotificationContentGr.actors = Array.from(actors).join(",");
        existingNotificationContentGr.notification_executions = Array.from(executions).join(",");

        if (this.eventGr) {
            const events = new Set(existingNotificationContentGr.events.toString().split(","));
            events.add(this.eventGr.sys_id.toString());
            existingNotificationContentGr.events = Array.from(events).join(",");
        }

        existingNotificationContentGr.content_template = notificationContent.aggregatedContentTemplate;
        existingNotificationContentGr.content_params = this._listToString(notificationContent.aggregatedContentParams);
        existingNotificationContentGr.update();
        return existingNotificationContentGr;
    },

    /**
     * Generates notification contents for a user using the associated portalContentConfigGr
     * @param {string} UserID - The existing notification content GlideRecord.
     * @param {Object} portalContentConfigGr - GlideRecord for portal notification content config
     */
    _generateNotificationContent: function(userID, portalContentConfigGr) {
        const hasRecordContext = !gs.nil(this.recordGr);
        const existingNotificationContentGr = hasRecordContext ? this._getExistingNotificationContent(userID, portalContentConfigGr) : null;
        const hasExistingNotifContent = !gs.nil(existingNotificationContentGr);

        let previousActors = [];
        if (existingNotificationContentGr && existingNotificationContentGr.actors)
            previousActors = existingNotificationContentGr.actors.toString().split(",");
        const notificationContent = this._getNotificationContent(portalContentConfigGr, previousActors);

        const hasAggregatedTemplate = !gs.nil(notificationContent.aggregatedContentTemplate) && notificationContent.aggregatedContentTemplate != "";
        const canBeAggregated = hasRecordContext && hasExistingNotifContent && hasAggregatedTemplate;

        if (this.notificationGr.getValue("include_originator") === "0" && notificationContent.actor && notificationContent.actor == userID)
            return;

        if (canBeAggregated)
            return this._aggregateNotificationContent(existingNotificationContentGr, notificationContent);
        return this._insertNotificationContent(
            userID,
            notificationContent,
            portalContentConfigGr
        );
    },

    /**
     * Processes the notifications for a user.
     * @param {string} userID - The user ID.
     * @returns {Object} The notification content GlideRecord.
     */
    _processNotificationsForUser(userID) {
        const portalContentConfigGr = this.providerService.getProviderContent();

        while (portalContentConfigGr.next()) {
            this._generateNotificationContent(userID, portalContentConfigGr);
        }
    },

    /**
     * Substitutes variable in a string using a GlideRecord object.
     * Support format for variable: ${variable_name}
     * @param {string} templatedString - The user ID.
     * @param {Object} recordGr - GlideRecord object from which the variables needs to be substituted.
     * @returns {string} String after substitution
     */
    substituteVariables: function(templatedString, recordGr) {
        if (!templatedString)
            return templatedString;

        var regex = /\${([^}]+)}/g;
        var matches = templatedString.match(regex) || [];
        var result = templatedString;
        matches.forEach(function(match) {
            var variable = match.slice(2, -1); // Extract variable name
            var value = recordGr.getElement(variable);
            if (!gs.nil(value))
                result = result.replace(match, value.toString());
        });
        return result;
    },

    /**
     * Processes notifications for all destinations synchronously.
     */
    processNotifications() {
        let destinationsCount = 0;
        const startTime = new GlideDateTime();
        while (this.destinations.next()) {
            this._processNotificationsForUser(this.destinations.getDeliverTo());
            destinationsCount += 1;
        }
        const endTime = new GlideDateTime();
        const execTime = GlideDateTime.subtract(startTime, endTime).getNumericValue();
        this._log(`Processed ${destinationsCount} destinations in ${execTime} ms`);
    },

    type: 'PortalProviderUtilSNC'
};
