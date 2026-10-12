var STTRMTemplateFieldPolicySNC = Class.create();
STTRMTemplateFieldPolicySNC.prototype = {

    LOG_PROPERTY: "com.snc.itsm.state_transition_model.log",

    initialize: function(sttrmTemplateFieldPolicyGr, _gs) {
        this._gr = sttrmTemplateFieldPolicyGr;
        this._gs = _gs || gs;
        this._log = new GSLog(this.LOG_PROPERTY, this.type).setLog4J();

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[initialize] valid gr: " + (this._gr && this._gr.isValidRecord()));
    },

    getTemplate: function() {
        if (!this._gr.sttrm_template.nil())
            return new STTRMTemplate(this._gr.sttrm_template.getRefRecord());

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[getTemplate] no template found");

        return null;
    },

    type: "STTRMTemplateFieldPolicySNC"
};
