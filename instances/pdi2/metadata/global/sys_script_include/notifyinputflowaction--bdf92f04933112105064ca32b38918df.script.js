var NotifyInputFlowAction = Class.create();
NotifyInputFlowAction.prototype = Object.extendsObject(BaseNotifyFlowAction, {
    initialize: function() {
        BaseNotifyFlowAction.prototype.initialize.apply(this, arguments);
        this.gatherAction = this.action.addGather();
        this.numberOfDigits = null;
        this.finishKey = null;
        this.timeout = null;
    },

    _isValidFinishKey: function( /*String*/ finishKey) {
        return (typeof finishKey === "string" &&
            (finishKey === "#" || finishKey === "*")
        );
    },

    _isValidLocale: function( /*String*/ languageCode) {
        // make sure the language code is one of the supported languages
        var notifyLanguageGR = new GlideRecord(NotifyFlowConstants.TABLES.NOTIFY_LANGUAGE);
        return notifyLanguageGR.get(NotifyFlowConstants.COLUMNS.LANGUAGE_CODE, languageCode);
    },

    // Setters
    setNumberOfDigits: function( /*Number */ numberOfDigits) {
        if (gs.nil(numberOfDigits) || typeof numberOfDigits !== "number" || numberOfDigits <= 0)
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "numberOfDigits");
        this.numberOfDigits = numberOfDigits;
    },

    setFinishKey: function( /*String*/ finishKey) {
        if (!this._isValidFinishKey(finishKey))
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "finishKey");
        this.finishKey = finishKey;
    },

    setTimeout: function( /*Number*/ timeout) {
        if (gs.nil(timeout) || typeof timeout !== "number" || timeout <= 0)
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "timeout");
        this.timeout = timeout;
    },

    execute: function( /*String*/ text) {
        if (gs.nil(this.numberOfDigits) || this.finishKey === null || gs.nil(this.timeout))
            this.notifyFlowErrorHandler.throwInvalidInputsToAction(this.type);

        if (gs.nil(text) || typeof text !== "string")
            this.notifyFlowErrorHandler.throwNotifyFlowActionError(
                this.type,
                gs.getMessage("Text to say is NOT valid for Input action")
            );

        this.gatherAction.setTimeout(this.timeout);
        this.gatherAction.setFinishKey(this.finishKey);
        this.gatherAction.setNumberOfDigits(this.numberOfDigits);

        text = text.trim();
        // define pattern to match for country code configuration
        var pattern = new RegExp(NotifyFlowConstants.REGEX_PATTERN.COUNTRY_CODE_CONFIG);
        var match = pattern.exec(text);
        var sayAction = this.gatherAction.addSay();
        // check if the condition name matches the following pattern LANGUAGE_CODE: MENU_TEXT
        // e.g. en-US: Press 1 to hear the menu again
        if (!gs.nil(match)) {
            var locale = match[1].trim();
            if (this._isValidLocale(locale))
                sayAction.setLanguage(locale);
            sayAction.setText(match[3].trim());
        } else
            sayAction.setText(text);

        // Save the input action into a new notify_wf_activity
        var json = this.action.toJson();
        var notifyActivityGR = new GlideRecord(NotifyFlowConstants.TABLES.NOTIFY_WF_ACTIVITY);
        notifyActivityGR.initialize();
        notifyActivityGR.setValue(NotifyFlowConstants.COLUMNS.NOTIFY_CALL, this.notifyCallGR.getUniqueValue());
        notifyActivityGR.setValue(NotifyFlowConstants.COLUMNS.NOTIFY_ACTION, json);
        notifyActivityGR.insert();

        this._setNotifyActivityGR(notifyActivityGR);
    },

    type: 'NotifyInputFlowAction'
});
