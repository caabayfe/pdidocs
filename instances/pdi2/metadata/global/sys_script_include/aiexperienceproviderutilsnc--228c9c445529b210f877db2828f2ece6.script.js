var AIExperienceProviderUtilSNC = Class.create();
    AIExperienceProviderUtilSNC.prototype = {

        /**
        * Initializes the object with the parameters provided from experience provider.
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
                gs.error(`AIExperienceProviderUtilSNC [ERROR]: ${message}`);
            else
                gs.info(`AIExperienceProviderUtilSNC [INFO]: ${message}`);
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
        * Evaluates the content script from the experience content configuration.
        * @param {Object} contentConfigGr - The experience content configuration GlideRecord.
        * @param {Array} previousActors - The list of previous actors.
        * @returns {Object} return value of the script
        */
        _evaluateContentScript: function(contentConfigGr, previousActors, previousNotificationExecution) {
            const evaluator = new GlideScopedEvaluator();
            evaluator.putVariable("current", this.recordGr);
            evaluator.putVariable("eventName", !gs.nil(this.eventGr) ? this.eventGr.name.toString() : "");
            evaluator.putVariable("eventParm1", !gs.nil(this.eventGr) && this.eventGr.parm1 ? this.eventGr.parm1.toString() : "");
            evaluator.putVariable("eventParm2", !gs.nil(this.eventGr) && this.eventGr.parm2 ? this.eventGr.parm2.toString() : "");
            evaluator.putVariable("previousActors", previousActors);
            evaluator.putVariable("previousNotificationExecution", previousNotificationExecution);

            try {
                return evaluator.evaluateScript(contentConfigGr, 'content_script');
            } catch (err) {
                gs.error("Error while evaluating content script" + err);
                return;
            }
        },

        /**
        * Retrieves the notification content based on the experience content configuration and previous actors.
        * @param {Object} contentConfigGr - The experience content configuration GlideRecord.
        * @param {Array} previousActors - The list of previous actors.
        * @param {Array} previousNotificationExecution - The list of previous notification executions.
        * @returns {Object} The notification content object.
        */
        _getNotificationContent(contentConfigGr, previousActors, previousNotificationExecution) {
            const content = {
                actor: '',
                messageContentTemplate: '',
                messageContentParams: [],
                aggregatedContentTemplate: '',
                aggregatedContentParams: [],
                actionUrl: ''
            };

            if (contentConfigGr.getValue("advanced") === '1') {
                const results = this._evaluateContentScript(contentConfigGr, previousActors, previousNotificationExecution);
                content.actor = results.actor;
                content.messageContentTemplate = results.messageContentTemplate;
                content.messageContentParams = results.messageContentParams;
                content.aggregatedContentTemplate = results.aggregatedContentTemplate;
                content.aggregatedContentParams = results.aggregatedContentParams;
                content.actionUrl = results.actionUrl;
            } else {
                content.actionUrl = this.substituteVariables(contentConfigGr.action_url.toString(), this.recordGr) || "";
                content.actor = this.substituteVariables(contentConfigGr.actor.toString(), this.recordGr) || "";
                content.messageContentTemplate = contentConfigGr.content_template.toString() || "";
                const trimmedParamString = (contentConfigGr.content_params.toString() || "").split('\n').map(line => line.trim()).filter(line => line.length > 0).join('\n');
                content.messageContentParams = trimmedParamString ? trimmedParamString.split(",").map(el => this.substituteVariables(el, this.recordGr)) : [];
            }

            return content;
        },

        /**
        * Retrieves the existing notification content for aggregation.
        * @param {string} userID - The user ID.
        * @param {Object} contentConfigGr - The experience content configuration GlideRecord.
        * @param {string} experience - The experience sys_id to filter by.
        * @returns {Object} The existing notification content GlideRecord.
        */
        _getExistingNotificationContent(userID, contentConfigGr, experience) {
            const notificationContentGr = new GlideRecord(AIExperienceNotificationConstants.TABLE_NOTIFICATION_CONTENT);
            notificationContentGr.addQuery("user", userID);
            notificationContentGr.addQuery("record", this.recordGr.sys_id.toString());
            notificationContentGr.addQuery("status", AIExperienceNotificationConstants.STATE_NEW);
            notificationContentGr.addQuery("experiences", experience);
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
        * @param {Object} contentConfigGr - The experience content configuration GlideRecord.
        * @param {string} experience - The experience sys_id to associate with this content record.
        * @returns {Object} The inserted notification content GlideRecord.
        */
        _insertNotificationContent(userID, notificationContent, contentConfigGr, experience) {
            const notificationContentGr = new GlideRecord(AIExperienceNotificationConstants.TABLE_NOTIFICATION_CONTENT);
            notificationContentGr.initialize();

            notificationContentGr.user = userID;
            notificationContentGr.actors = notificationContent.actor;
            notificationContentGr.action_url = notificationContent.actionUrl;
            notificationContentGr.content_template = notificationContent.messageContentTemplate;
            notificationContentGr.content_params = this._listToString(notificationContent.messageContentParams);
            notificationContentGr.experiences = experience || '';
            notificationContentGr.order = 100;
            notificationContentGr.notification = this.notificationGr.sys_id.toString();
            notificationContentGr.notification_content_config = contentConfigGr.sys_id.toString();
            notificationContentGr.notification_executions = this.executionGr.sys_id.toString();
            notificationContentGr.active = true;
            notificationContentGr.status = AIExperienceNotificationConstants.STATE_NEW;

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
        * @param {Object} contentConfigGr - The experience content configuration GlideRecord.
        * @returns {Object} The updated notification content GlideRecord.
        */
        _aggregateNotificationContent(existingNotificationContentGr, notificationContent, contentConfigGr) {
            const actors = new Set(existingNotificationContentGr.actors ? existingNotificationContentGr.actors.toString().split(",") : []);

            actors.add(notificationContent.actor);

            const executions = new Set(existingNotificationContentGr.notification_executions.toString().split(","));
            executions.add(this.executionGr.sys_id.toString());

            existingNotificationContentGr.actors = Array.from(actors).join(",");
            existingNotificationContentGr.notification_executions = Array.from(executions).join(",");
            existingNotificationContentGr.notification_content_config = contentConfigGr.sys_id.toString();
            existingNotificationContentGr.notification = this.notificationGr.sys_id.toString();

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
        * Generates notification contents for a user using the associated contentConfigGr
        * @param {string} userID - The user ID.
        * @param {Object} contentConfigGr - GlideRecord for experience notification content config
        * @param {string} experience - The experience sys_id to associate with this content record.
        */
        _generateNotificationContent: function(userID, contentConfigGr, experience) {
            const hasRecordContext = !gs.nil(this.recordGr);
            const existingNotificationContentGr = hasRecordContext ? this._getExistingNotificationContent(userID, contentConfigGr, experience) : null;
            const hasExistingNotifContent = !gs.nil(existingNotificationContentGr);
            let previousActors = [];
            let previousNotificationExecutions = [];
            if (existingNotificationContentGr && existingNotificationContentGr.actors)
                previousActors = existingNotificationContentGr.actors.toString().split(",");
            if (existingNotificationContentGr && existingNotificationContentGr.notification_executions)
                previousNotificationExecutions = existingNotificationContentGr.notification_executions.toString().split(",");
            const notificationContent = this._getNotificationContent(contentConfigGr, previousActors, previousNotificationExecutions);
            const hasAggregatedTemplate = !gs.nil(notificationContent.aggregatedContentTemplate) && notificationContent.aggregatedContentTemplate != "";
            const canBeAggregated = hasRecordContext && hasExistingNotifContent && hasAggregatedTemplate;

            if (this.notificationGr.getValue("include_originator") === "0" && notificationContent.actor && notificationContent.actor == userID)
                return;

            if (canBeAggregated)
                return this._aggregateNotificationContent(existingNotificationContentGr, notificationContent, contentConfigGr);
            return this._insertNotificationContent(userID, notificationContent, contentConfigGr, experience);
        },

        /**
        * Processes the notifications for a user.
        * @param {string} userID - The user ID.
        * @returns {Object} The notification content GlideRecord.
        */
        _processNotificationsForUser(userID) {
            const contentConfigGr = this.providerService.getProviderContent();

            while (contentConfigGr.next()) {
                const experiencesList = contentConfigGr.experiences.toString();
                const experiences = experiencesList ? experiencesList.split(',').map(function(e) { return e.trim(); }).filter(function(e) { return e; }) : [];

                if (experiences.length === 0) {
                    return;
                } else {
                    experiences.forEach(function(experienceId) {
                        this._generateNotificationContent(userID, contentConfigGr, experienceId);
                    }.bind(this));
                }
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

        type: 'AIExperienceProviderUtilSNC'
    };
