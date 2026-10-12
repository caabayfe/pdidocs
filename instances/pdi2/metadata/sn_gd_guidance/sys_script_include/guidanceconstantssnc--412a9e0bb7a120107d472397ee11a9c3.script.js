var GuidanceConstantsSNC = Class.create();
GuidanceConstantsSNC.prototype = {
    initialize: function() {
        //Table Name
        this.GUIDANCE_INSTANCE_TABLE = 'ga_guidance_inputs_instance';
        this.GUIDANCE_INPUT_TABLE = 'ga_guidance_input';
        this.GUIDANCE_HISTORY_TABLE = 'ga_guidance_history';
        this.GUIDANCE_TABLE = 'ga_guidance';
        this.DECISION_TREE_EXECUTION_TABLE = 'ga_decision_tree_execution';
        //Field Names
        this.COL_CONTEXT = 'context';
        this.COL_DESCRIPTION = 'descrition';
        this.COL_GUIDANCE = 'guidance';
        this.COL_GUIDANCE_INPUTS = 'guidance_inputs';
        this.COL_GUIDANCE_INSTANCE_EXECUTION = 'guidance_instance_execution';
        this.COL_INTERNAL_TYPE = 'internal_type';
        this.COL_MODEL = 'model';
        this.COL_NAME = 'name';
        this.COL_REFERENCE = 'reference';
        this.COL_TITLE = 'title';
        this.COL_U_CONTEXT = 'u_context';
        this.COL_VERSION = 'version';
        this.COL_RECOMMENDED_BY = 'recommended_by';
        this.COL_RECOMMENDER = 'recommender';
        this.COL_PREVIEW_TITLE = 'preview_title';
        this.COL_STATE = 'state';
        //Values
        this.VAL_REFERENCE = 'reference';
        //states
        this.STATE_WAITING = "waiting";
        this.STATE_IN_PROGRESS = "in_progress";
        this.STATE_COMPLETED = "completed";
        this.STATE_SKIPPED = "skipped";
        this.STATE_IN_ERROR = "in_error";
        this.STATE_ERROR_SKIPPED = "error_skipped";

        this.ERROR = "error";
        this.ERROR_405 = "405";
        this.ERROR_405_MESSAGE = gs.getMessage("Another user already completed this action.");
    },
    type: 'GuidanceConstantsSNC'
};
