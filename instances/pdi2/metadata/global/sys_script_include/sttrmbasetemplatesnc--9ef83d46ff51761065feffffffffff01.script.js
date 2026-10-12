var STTRMBaseTemplateSNC = Class.create();
STTRMBaseTemplateSNC.prototype = {

    LOG_PROPERTY: "com.snc.itsm.state_transition_model.log",

    initialize: function(grOrSysId, _gs) {
        var baseTemplateGr = grOrSysId;
        if (grOrSysId) {
            if (typeof grOrSysId === "string") {
                var sttrmBaseTemplateGr = new GlideRecordSecure("sttrm_base_template");
                if (sttrmBaseTemplateGr.get(grOrSysId))
                    baseTemplateGr = sttrmBaseTemplateGr;
            }
        }
        this._gr = baseTemplateGr;
        this._gs = _gs || gs;
        this._log = new GSLog(this.LOG_PROPERTY, this.type).setLog4J();

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[initialize] valid gr: " + (this._gr && this._gr.isValidRecord()));
    },

    _getBaseTemplateByClass: function() {
        if (!this._gr)
            return null;

        var className = this._gr.sys_class_name;
        if (!className)
            return null;

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[_getBaseTemplateByClass] className: " + className);

        var gr = new GlideRecordSecure(className);
        return gr.get(this._gr.getUniqueValue()) ? gr : null;
    },

    getModel: function() {
        var gr = this._getBaseTemplateByClass();
        if (!gr)
            return null;

        if (gr.isValidField("sttrm_model")) {
            if (!gr.sttrm_model.nil())
                return new STTRMModel(gr.sttrm_model.getRefRecord());
        }

        if (gr.isValidField("sttrm_model") && !gr.sttrm_model.nil())
            return new STTRMModel(gr.sttrm_model.getRefRecord());

        if (gr.isValidField("parent_template")) {
            if (!gr.parent_template.nil()) {
                var parentTemplateGr = gr.parent_template.getRefRecord();
                if (!parentTemplateGr.sttrm_model.nil())
                    return new STTRMModel(parentTemplateGr.sttrm_model.getRefRecord());
            }
        }

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[getModel] no model found");

        return null;
    },

    canDelete: function() {
        var canDelete = this.getState() === "draft";

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[canDelete] canDelete: " + canDelete);

        return canDelete;
    },

    getState: function() {
        var state = "";
        var gr = this._getBaseTemplateByClass();
        if (!gr)
            return state;

        state = (gr.isValidField("state") && !gr.state.nil()) ? gr.getValue("state") : null;
        if (!state && gr.isValidField("parent_template")) {
            if (!gr.parent_template.nil()) {
                var parentTemplateGr = gr.parent_template.getRefRecord();
                if (parentTemplateGr.isValidField("state") && !parentTemplateGr.state.nil())
                    state = parentTemplateGr.getValue("state");
            }
        }

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[getState] state: " + state);

        return state;
    },

    type: "STTRMBaseTemplateSNC"
};
