var SoftPINAjaxProcessor = Class.create();
SoftPINAjaxProcessor.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    manager: new SoftPINEnrollmentManager(),

    enroll: function() {
        if (this.manager._isEnrollmentDisabled()) {
            var res = this.newItem("result");
            res.setAttribute("status", "failure");
            res.setAttribute("message", gs.getMessage("Soft PIN enrollment is currently disabled"));
            return;
        }
        var map = {};
        var total = this.getParameter("sysparm_total_count");

        for (var i = 0; i < total; i++) {
            var name = 'sysparm_param_' + i;
            var data = this.getParameter(name);
            this._parseData(data, map);
        }
        var formCnt = this.getParameter('sysparm_form_count');
        var userId = gs.getUserID();
        for (i = 0; i < formCnt; i++) {
            var dataFormName = 'sysparm_macro_' + i + '_data';
            var dataEntryMap = map[dataFormName];
            var verificationId = dataEntryMap['verification_id'];

            try {
                var response = this.manager.createNew(dataEntryMap, verificationId, userId);
                //Sets the ajax response from the processor response.
                this._setResponse(verificationId, response);
            } catch (err) {
                gs.error("SoftPIN Enrollment: Error while creating enrollment" + err);
                this._setErrorResponse(verificationId, err.message);
            }
        }
    },

    enrollSP: function() {
        if (this.manager._isEnrollmentDisabled()) {
            var res = this.newItem("result");
            res.setAttribute("status", "failure");
            res.setAttribute("message", gs.getMessage("Soft PIN enrollment is currently disabled"));
            return;
        }
        var map = {};
        var verificationId = this.getParameter("sysparam_verification_id");
        var softPin = this.getParameter("sysparam_soft_pin");

        var userId = gs.getUserID();

        try {
            var response = this.manager.createNewSP(verificationId, userId, softPin);
            //Sets the ajax response from the processor response.
            this._setResponse(verificationId, response);
        } catch (err) {
            gs.error("SoftPIN Enrollment: Error while creating enrollment" + err);
            this._setErrorResponse(verificationId, err.message);
        }

    },

    _setErrorResponse: function(verificationId, msg) {
        var res = this.newItem("_" + verificationId);
        response.setAttribute('status', 'failure');
        response.setAttribute('message', msg);
    },

    _parseData: function(data, map) {
        var formId = this._getFormId(data);
        var entry = map[formId];
        if (entry == undefined) {
            entry = {};
            map[formId] = entry;
        }
        var name = this._getElementName(data);
        var value = this._getElementValue(data);

        entry[name] = value;
    },

    _getFormId: function(data) {
        var val = data;
        var index = val.indexOf(":");
        return val.substring(0, index);
    },

    _getElementName: function(data) {
        var val = data;
        var index = val.indexOf(':');
        val = val.substring(index + 1);
        index = val.indexOf("=");
        return val.substring(0, index);
    },

    _getElementValue: function(data) {
        var val = data;
        var index = val.indexOf('=');
        try {
            return val.substring(index + 1);
        } catch (err) {
            gs.error("SoftPIN Enrollment: Error while getting element value" + err);
            return '';
        }
    },
	
    _setResponse: function(verificationId, response) {
        var res = this.newItem("_" + verificationId);
        res.setAttribute('status', response.result);
        res.setAttribute('message', response.message);
    },
    type: 'SoftPINAjaxProcessor'
});
