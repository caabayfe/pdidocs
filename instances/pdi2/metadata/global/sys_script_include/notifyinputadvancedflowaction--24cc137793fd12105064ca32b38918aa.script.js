var NotifyInputAdvancedFlowAction = Class.create();
NotifyInputAdvancedFlowAction.prototype = Object.extendsObject(BaseNotifyFlowAction, {
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

    _isValidMenuItem: function(menuItem) {
        if (typeof menuItem === "string") {
            menuItem = menuItem.trim();
            return menuItem.length > 0;
        }
        return false;
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

    execute: function( /*JSONObj*/ menuPlayList) {
        if (gs.nil(this.numberOfDigits) || this.finishKey === null || gs.nil(this.timeout))
            this.notifyFlowErrorHandler.throwInvalidInputsToAction(this.type);

        if (gs.nil(menuPlayList) || typeof menuPlayList !== "object")
            this.notifyFlowErrorHandler.throwNotifyFlowActionError(
                this.type,
                gs.getMessage("Menu playlist JSON object is NOT valid for Input - Advanced action")
            );

        this.gatherAction.setTimeout(this.timeout);
        this.gatherAction.setFinishKey(this.finishKey);
        this.gatherAction.setNumberOfDigits(this.numberOfDigits);

        var sayElementsList = menuPlayList.say;
        var playElementsList = menuPlayList.play;
        menuPlayList = [];

        sayElementsList.forEach(function(element) {
            if (gs.nil(element.order))
                return;
            var order = Number(element.order);
            var text = element.text;

            if (!Number.isInteger(order))
                return;
            if (typeof text !== "string")
                return;
            text = text.trim();
            if (text.length === 0)
                return;

            var urlPattern = new RegExp(NotifyFlowConstants.REGEX_PATTERN.URL, "ig");
            var matchURL = urlPattern.exec(text);
            if (!gs.nil(matchURL)) {
                // If Say has a valid URL as text, casting it to Play
                delete element.text;
                delete element.language;
                element.url = text;
                element.type = NotifyFlowConstants.ACTIONS.PLAY;
            } else {
                element.text = text;
                element.type = NotifyFlowConstants.ACTIONS.SAY;
            }

            element.order = order;
            menuPlayList.push(element);
        });

        playElementsList.forEach(function(element) {
            if (gs.nil(element.order))
                return;
            var order = Number(element.order);
            var url = element.url;

            if (!Number.isInteger(order))
                return;
            if (typeof url !== "string")
                return;
            url = url.trim();
            if (url.length === 0)
                return;

            element.order = order;
            element.url = url;
            element.type = NotifyFlowConstants.ACTIONS.PLAY;
            menuPlayList.push(element);
        });

        menuPlayList.sort(function(elementA, elementB) {
            return elementA.order - elementB.order;
        });

        menuPlayList.forEach(function(menuItem) {
            switch (menuItem.type) {
                case NotifyFlowConstants.ACTIONS.SAY:
                    var sayAction = this.gatherAction.addSay();
                    var locale = (!gs.nil(menuItem.language) && typeof menuItem.language === "string") ? menuItem.language.trim() : "";
                    if (locale && locale.length && this._isValidLocale(locale)) {
                        sayAction.setLanguage(locale);
                    }
                    sayAction.setText(menuItem.text);
                    break;
                case NotifyFlowConstants.ACTIONS.PLAY:
                    var playAction = this.gatherAction.addPlay();
                    playAction.setURL(menuItem.url);
                    break;
            }
        }, this);

        // Save the input action into a new notify_wf_activity
        var json = this.action.toJson();
        var notifyActivityGR = new GlideRecord(NotifyFlowConstants.TABLES.NOTIFY_WF_ACTIVITY);
        notifyActivityGR.initialize();
        notifyActivityGR.setValue(NotifyFlowConstants.COLUMNS.NOTIFY_CALL, this.notifyCallGR.getUniqueValue());
        notifyActivityGR.setValue(NotifyFlowConstants.COLUMNS.NOTIFY_ACTION, json);
        notifyActivityGR.insert();

        this._setNotifyActivityGR(notifyActivityGR);
    },

    type: 'NotifyInputAdvancedFlowAction'
});
