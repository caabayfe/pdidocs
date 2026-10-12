var StandardChangeLinkerSNC = Class.create();
StandardChangeLinkerSNC.prototype = {

    LOG_PROP: "com.snc.std_change_request.log",
    STANDARD: "standard",
    TABLE: "table",
    SYS_ID: "sysid",
    FIELD: "field",
    TYPE: "type",
    SYSPARM_PROCESSING_HINT: "sysparm_processing_hint",
    VALID_FIELDS: "com.snc.change_request.standard_change.link_task.valid_fields",

    initialize: function(_gs) {
        this._log = new GSLog(this.LOG_PROP, this.type);

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[initialize] type: " + this.type);

        this._gs = _gs || gs;
    },

    /**
     * @param recordStr table:targetTable;sysid:targetsysId;field:targetField
     */
    linkChgToTask: function(recordStr, chgSysId, chgDisplayValue) {

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[linkChgToTask] recordStr: " + recordStr + " chgSysId: " + chgSysId + " chgDisplayValue: " + chgDisplayValue);

        if (this._gs.nil(recordStr) || this._gs.nil(chgSysId) || !this._isEligibleSysID(chgSysId))
            return;

        var recordArr = recordStr.split(";");
        var recordMap = {};
        recordArr.forEach(function(record) {
            var split = record.split(":");
            recordMap[split[0].trim()] = split[1].trim();
        });

        this._linkChgToTask(recordMap[this.TABLE], recordMap[this.SYS_ID], recordMap[this.FIELD], chgSysId, chgDisplayValue);
    },

    /**
     * Link the created standard change to the target record e.g. incident, problem etc.
     *
     * @param table
     * @param sysId
     * @param field
     * @param chgSysId
     * @param chgDisplayValue
     */
    _linkChgToTask: function(table, sysId, field, chgSysId, chgDisplayValue) {
        if (this._gs.nil(table) || this._gs.nil(field) || !this._isEligibleSysID(sysId) || !this._isEligibleSysID(chgSysId))
            return;

        chgDisplayValue = chgDisplayValue || "";

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[_linkChgToTask] table: " + table + " sysId: " + sysId + " field: " + field + " chgSysId: " + chgSysId + " chgDisplayValue: " + chgDisplayValue);

        var gr = new GlideRecord(table);
        if (!gr.get(sysId))
            return;

        var validFields = gs.getProperty(this.VALID_FIELDS, "").split(",");

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[_linkChgToTask] field: " + field + " validFields: " + validFields.join(","));

        if (validFields.indexOf(field) === -1 || !gr.isValidField(field))
            return;

        var fieldType = gr[field].getED().getInternalType() + "";

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[_linkChgToTask] fieldType: " + fieldType);

        if (fieldType !== "reference")
            return;

        var referenceTable = gr[field].getReferenceTable() + "";

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[_linkChgToTask] referenceTable: " + referenceTable);

        var tableHierarchy = global.j2js(new global.TableUtils(referenceTable).getHierarchy());
        var extendsTask = Array.isArray(tableHierarchy) && tableHierarchy.includes("task");

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[_linkChgToTask] referenceTable: " + referenceTable + " extendsTask: " + extendsTask);

        // Only reference tables that extend task, can be written to, and are empty should be modified
        var forbidUpdate = !extendsTask || !gr.canWrite() || !gr[field].nil();

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[_linkChgToTask] forbidUpdate: " + forbidUpdate);

        if (forbidUpdate)
            return;

        var chgGr = new GlideRecord("change_request");
        if (!chgGr.get(chgSysId) || !chgGr.canRead())
            return;

        gr.setValue(field, chgSysId);

        var taskUrl = "<a href='" + gr.getLink(true) + "'>" + gr.getDisplayValue() + "</a>";
        var updated = gr.update();

        if (updated)
            this._gs.addInfoMessage(this._gs.getMessage("{0} Change {1} created from {2}", [chgGr.type.getDisplayValue(), chgDisplayValue, taskUrl]));
        else
            this._gs.addInfoMessage(this._gs.getMessage("{0} Change could not be created from {1}", [chgGr.type.getDisplayValue(), taskUrl]));
    },

    /**
     * Check if string is a valid sys_id format (32 char hex)
     * @param sysId
     * @return boolean
     */
    _isEligibleSysID: function(sysId) {
        if (this._gs.nil(sysId) || sysId.length != 32)
            return false;

        return /^[0-9a-fA-F]{32}$/.test(sysId);
    },

    type: "StandardChangeLinkerSNC"
};
