/**
 * RequestWorkflowStageProcessor
 *
 * This script include handles generating and processing workflow stage choice lists
 * for different renderer types. Also handles icon and color mapping for workflow stages.
 *
 * @class RequestWorkflowStageProcessor
 * @type {Class}
 */
var RequestWorkflowStageProcessor = Class.create();

RequestWorkflowStageProcessor.prototype = {

    // Define renderer type constants
    RENDERER_LEGACY: "Legacy",
    RENDERER_SC_REQ_ITEM: "SCReqItemRenderer",
    RENDERER_LINEAR: "Linear",
    RENDERER_FLOW_DESIGNER: "FlowDesigner",
    RENDERER_WORKFLOW_DRIVEN: "Workflow-driven",
    RENDERER_MAIN_FLOW: "Main flow",
    RENDERER_SIMPLE_PROGRESS_BAR: "SimpleProgressBar",

    // Allowed tables and fields for input validation
    ALLOWED_TABLES: ["sc_req_item"],
    ALLOWED_FIELDS: ["stage"],

    // Object mapping UI16 icon names to now-icon names
    ICON_MAPPING: {
        "icon-empty-circle": "circle-outline",
        "icon-arrow-right": "circle-arrow-right-outline",
        "icon-cross-circle": "circle-close-outline",
        "icon-alert": "circle-exclamation-outline",
        "icon-check-circle": "circle-check-outline",
        "icon-clear": "circle-minus-outline",
        "icon-step-over": "circle-workflow-skip-outline",
        "icon-ellipsis": "circle-ellipsis-outline",
    },

    // Object mapping UI16 color classes to sn-flow-stage-renderer color class names
    COLOR_MAPPING: {
        "color-positive": "positive",
        "color-negative": "negative",
        "color-warning": "warning",
        "color-accent": "accent",
    },

    /**
     * Constructor for the RequestWorkflowStageProcessor class
     *
     * @param {String} tableName - The name of the table
     * @param {String} fieldName - The name of the field
     * @param {GlideRecordSecure} current - The current GlideRecordSecure
     */
    initialize: function(tableName, fieldName, current) {
        this.tableName = tableName || "";
        this.fieldName = fieldName || "";
        this.renderer = this.RENDERER_LEGACY; // Default renderer
        this.rendererApi = null;
        this.workflowField = null;
        this.currentStageDisplayValue = '';

        // Re-fetch the record internally in global scope. SNC.RendererAPI methods silently fail
        // when passed a scope-fenced GlideRecord from a different calling context. Creating the
        // record here guarantees it is owned by this class and safe for SNC.RendererAPI consumption.
        if (this.tableName) {
            var sysId = (typeof current === 'string') ? current : (current ? current.getUniqueValue() : null);
            if (sysId) {
                var currentItem = new GlideRecordSecure(this.tableName);
                this.current = currentItem.get(sysId) ? currentItem : null;
            }
        }

        // Validate tableName against allowed tables
        if (this.tableName && this.ALLOWED_TABLES.indexOf(this.tableName) === -1) {
            gs.error("RequestWorkflowStageProcessor: disallowed tableName '{0}'", this.tableName);
            this.current = null;
            return;
        }

        // Validate fieldName against allowed fields
        if (this.fieldName && this.ALLOWED_FIELDS.indexOf(this.fieldName) === -1) {
            gs.error("RequestWorkflowStageProcessor: disallowed fieldName '{0}'", this.fieldName);
            this.current = null;
            return;
        }

        // Validate that current GlideRecordSecure's table matches the provided tableName
        if (this.current && typeof this.current.getTableName === 'function' &&
            this.current.getTableName() !== this.tableName) {
            gs.error("RequestWorkflowStageProcessor: tableName '{0}' does not match GlideRecordSecure table '{1}'", this.tableName, this.current.getTableName());
            this.current = null;
            return;
        }

        this.workflowField = this.current ? this.current[this.fieldName] : null;
        if (this.current && this.workflowField) {
            // this.current.putCurrent();
            GlideController.putGlobal("current", this.current);
            GlideController.putGlobal(this.tableName, this.current);
            this.renderer = this.getRequestRenderer(this.workflowField, this.current.sys_id);
            this.rendererApi = new SNC.RendererAPI(this.renderer);
            // setting workflow field display value as current value of field initially
            this.currentStageDisplayValue = this.current.getValue(this.fieldName);
        }
    },

    /**
     * Gets the current renderer being used
     *
     * @return {String} - The current renderer
     */
    getRenderer: function() {
        return this.renderer;
    },

    /**
     * Gets the appropriate choice list for the workflow stages based on the renderer type
     *
     * @return {ChoiceList} - The choice list for the workflow stages
     */
    getChoiceList: function() {
        var choiceList;
        var fieldRef = this.tableName + "." + this.fieldName;

        switch (this.renderer) {
            case this.RENDERER_FLOW_DESIGNER:
                choiceList = this.workflowField.getStages();
                break;

            case this.RENDERER_WORKFLOW_DRIVEN:
            case this.RENDERER_LINEAR:
                choiceList = this.rendererApi.getAllWorkflowChoices(this.current, fieldRef);
                this.rendererApi.addIconsAndStatus(choiceList);
                break;

            case this.RENDERER_MAIN_FLOW:
                choiceList = this.rendererApi.getParentWorkflowChoices(this.current, fieldRef);
                this.rendererApi.addIconsAndStatus(choiceList);
                break;

            case this.RENDERER_SIMPLE_PROGRESS_BAR:
                choiceList = this.rendererApi.getParentWorkflowChoices(this.current, fieldRef);
                break;

            default:
                var clGenerator = new GlideChoiceListGenerator(this.tableName, this.fieldName);
                clGenerator.none = false;
                choiceList = clGenerator.get();
                this.rendererApi.internationalizeChoices(choiceList);
                var iconsAttribute = "WorkflowIcons";
                if (this.workflowField.hasAttribute("icons")) {
                    var customIcons = this.workflowField.getAttribute("icons");
                    if (customIcons && typeof global[customIcons] === "function") {
                        iconsAttribute = customIcons;
                    }
                }
                var wfw = new global[iconsAttribute](fieldRef);
                choiceList = wfw.process(choiceList);
                break;
        }

        return choiceList;
    },

    /**
     * Transforms the workflow stages into a formatted JSON object
     *
     * @return {Object} - A JSON object with the formatted workflow stages
     */
    getStages: function() {
        if (!this.current) {
            return [];
        }
        var choiceList = this.getChoiceList();
        return this.transformStages(choiceList);
    },

    /**
     * Determines the visibility of a workflow stage based on renderer type and stage properties
     *
     * @param {Choice} stage - The workflow stage
     * @return {Boolean} - Whether the stage should be visible
     */
    determineStageVisibility: function(stage) {
        var visible = null;

        // Check if stage has empty value first - applies to all renderer types
        if (stage.getValue() === "") {
            return false;
        }

        switch (this.renderer) {
            case this.RENDERER_LEGACY:
            case this.RENDERER_SC_REQ_ITEM:
                visible = true;
                break;

            case this.RENDERER_LINEAR:
            case this.RENDERER_SIMPLE_PROGRESS_BAR:
                visible = true;

                // Check if skipped stages should be hidden
                if (!this.rendererApi.getOption("showSkipped") && String(stage.getParameter("state")) === "skipped") {
                    visible = false;
                }
                break;

            default:
                // For all other renderer types, use the visible parameter
                visible = stage.getParameter('visible');
                if (!visible)
                    visible = false;
                break;
        }

        return visible;
    },

    /**
     * Maps an icon name to its corresponding now-icon name
     *
     * @param {String} iconName - The UI16 icon name
     * @return {String} - The mapped now-icon name or default
     */
    mapIcon: function(iconName) {
        return iconName && this.ICON_MAPPING[iconName] ?
            this.ICON_MAPPING[iconName] :
            '';
    },

    /**
     * Maps a color class to its corresponding sn-flow-stage-renderer color class name
     *
     * @param {String} colorKey - The UI16 color class
     * @return {String} - The mapped sn-flow-stage-renderer color class name or default
     */
    mapColor: function(colorKey) {
        return colorKey && this.COLOR_MAPPING[colorKey] ?
            this.COLOR_MAPPING[colorKey] :
            'default';
    },

    /**
     * Transforms the workflow stages ChoiceList into a formatted JSON object
     *
     * @param {ChoiceList} stagesChoiceList - The ChoiceList of workflow stages
     * @return {Array} - An array of transformed workflow stages
     */
    transformStages: function(stagesChoiceList) {
        try {
            stagesChoiceList.removeNone();
            var transformedStages = [];

            // Get current stage value from current GlideRecordSecure
            var currentStageValue = this.current.getValue(this.fieldName);

            // Process each stage
            for (var i = 0; i < stagesChoiceList.size(); i++) {
                var stage = stagesChoiceList.get(i);

                var transformedStage = {};
                transformedStage.value = stage.getValue();

                transformedStage.label = stage.getLabel();

                var title = stage.getParameter("title");
                if (!title) {
                    title = transformedStage.label;
                }
                transformedStage.title = title;

                transformedStage.selected = stage.getSelected();

                transformedStage.icon = stage.getImage();

                var duration = stage.getParameter("duration");
                if (!duration) {
                    transformedStage.duration = null;
                } else {
                    // Check if duration starts with " - " then remove it
                    transformedStage.duration = (duration.indexOf(" - ") === 0) ? duration.substring(3) : duration;
                }

                transformedStage.state = stage.getParameter("state");
                transformedStage.approvers = stage.getParameter("approvers");

                transformedStage.visible = this.determineStageVisibility(stage);

                // Process icon and color mapping
                if (transformedStage.icon) {
                    var iconParts = transformedStage.icon.split(" ");
                    var iconName = iconParts[0] || "";
                    var colorKey = iconParts[1] || "";

                    // Set the icon to the mapped now-icon name
                    transformedStage.icon = this.mapIcon(iconName);
                    transformedStage.color = this.mapColor(colorKey);
                }

                // Apply renderer-specific transformations to the individual stage
                this.applyRendererSpecificStageTransformations(transformedStage, stage, this.renderer);

                transformedStages.push(transformedStage);
            }

            // Mark the current stage as selected based on the current stage value from GlideRecordSecure
            transformedStages.forEach(function(stage) {
                stage.selected = false;
                if (stage.value == currentStageValue) {
                    stage.selected = true;
                    this.currentStageDisplayValue = stage.title + ' (' + stage.label + ')';
                }
                if (!stage.icon) {
                    if (stage.selected) {
                        // Renderer-specific icon finalization after selection resolution
                        this.finalizeSelectedStageIcon(stage, this.renderer);
                    } else {
                        // Set default icon and color class for stages without icon
                        stage.icon = "circle-outline";
                        stage.color = "default";
                    }
                }
            }, this);

            return transformedStages;
        } catch (e) {
            gs.error("RequestWorkflowStageProcessor: transformStages() failed: {0}", e);
            return [];
        }
    },

    /**
     * Determines whether approvers should be shown based on the renderer type
     *
     * @return {Boolean} - True if approvers should be shown, false otherwise
     */
    shouldShowApprovers: function() {
        try {
            switch (this.renderer) {
                case this.RENDERER_LINEAR:
                    return gs.getProperty("glide.workflow.renderer.linear.show_approver") == "true";

                case this.RENDERER_FLOW_DESIGNER:
                    return gs.getProperty("com.glide.hub.flow_engine.stage_display.show_approvers") == "true";

                case this.RENDERER_MAIN_FLOW:
                    return gs.getProperty("glide.workflow.renderer.mainflow.show_approver") == "true";

                case this.RENDERER_WORKFLOW_DRIVEN:
                    return gs.getProperty("glide.workflow.renderer.workflowdriven.show_approver") == "true";

                case this.RENDERER_SC_REQ_ITEM:
                case this.RENDERER_SIMPLE_PROGRESS_BAR:
                case this.RENDERER_LEGACY:
                default:
                    return false;
            }
        } catch (e) {
            gs.error("RequestWorkflowStageProcessor: shouldShowApprovers() failed: {0}", e);
            return false;
        }
    },

    /**
     * Apply renderer-specific transformations to an individual stage
     *
     * @param {Object} transformedStage - The stage being transformed
     * @param {Choice} originalStage - The original stage object
     * @param {String} renderer - The current renderer
     */
    applyRendererSpecificStageTransformations: function(transformedStage, originalStage, renderer) {
        try {
            switch (renderer) {
                case this.RENDERER_FLOW_DESIGNER:
                    // Add duration to title if show_duration property is true
                    if (gs.getProperty("com.glide.hub.flow_engine.stage_display.show_duration") == "true" && transformedStage.duration) {
                        transformedStage.title = transformedStage.title + " - " + transformedStage.duration;
                    }

                    // Label does not contain state value, it contains title value, hence replacing it with state value
                    if (transformedStage.state) {
                        transformedStage.label = transformedStage.state;
                    }
                    break;

                    // Add cases for other renderers if they need stage-specific transformations
                default:
                    // No specific transformations for other renderers
                    break;
            }
        } catch (e) {
            gs.error("RequestWorkflowStageProcessor: applyRendererSpecificStageTransformations() failed: {0}", e);
        }
    },

    /**
     * Finalizes selected stage icons after selection is resolved.
     *
     * @param {Array} stages - Transformed stages array
     * @param {String} renderer - The current renderer
     */
    finalizeSelectedStageIcon: function(selectedStage, renderer) {
        if (!selectedStage || typeof selectedStage !== 'object') return;
        switch (renderer) {
            case this.RENDERER_LEGACY:
            case this.RENDERER_SC_REQ_ITEM:
            case this.RENDERER_WORKFLOW_DRIVEN:
                selectedStage.icon = 'circle-check-outline';
                selectedStage.color = 'positive';
                break;
            case this.RENDERER_MAIN_FLOW:
            case this.RENDERER_FLOW_DESIGNER:
                selectedStage.icon = 'circle-arrow-right-outline';
                selectedStage.color = 'accent';
                break;
            default:
                // No finalization needed for other renderers yet
                break;
        }
    },

    /**
     * Gets the display value for the current stage
     *
     * @return {String} - The display value for the current stage
     */
    getCurrentStageDisplayValue: function() {
        return this.currentStageDisplayValue;
    },

    /** 
     * Select renderer for a given table.column ref and row ID
     */
    getRequestRenderer: function(ref, id) {
        if (GlideUtil.isExpressInstance())
            return "express_workflow_renderer";
        if (this.current.getValue("flow_context"))
            return "FlowDesigner";

        //if we have stage_state record and it specified the Flow Designer renderer, use FlowDesigner's provider
        var stageStateGR = new GlideRecordSecure("stage_state");
        stageStateGR.addQuery("table", this.current.getTableName());
        stageStateGR.addQuery("id", this.current.getUniqueValue());
        stageStateGR.addQuery("field", ref.getName());
        stageStateGR.orderByDesc("sys_created_on");
        stageStateGR.setLimit(1);
        stageStateGR.query();
        if (stageStateGR.next() && stageStateGR.getDisplayValue("column_renderer") == "FlowDesigner")
            return "FlowDesigner";

        return new SNC.WorkflowScriptAPI().getRenderer(this.current);
    },

    type: 'RequestWorkflowStageProcessor'
};
