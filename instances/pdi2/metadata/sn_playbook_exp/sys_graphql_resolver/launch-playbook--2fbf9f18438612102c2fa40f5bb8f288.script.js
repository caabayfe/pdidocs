(function process(env) {

      var args = env.getArguments();
      var processDefinitionId = args.processDefinitionId;
      var parentRecordId = args.parentRecord;
      var input = args.input;
      var processDefinitionGr = new GlideRecord(global.PDConstants.TABLES.PD_PROCESS_DEFINITION);

      if (!processDefinitionGr.get(processDefinitionId)) {
        return {
          errorType: "PROCESS_DEFINITION_ID_NOT_VALID",
          message: gs.getMessage("'{0}' is not a valid process definition id.", args.processDefinitionId),
          process_definition_id: args.processDefinitionId,
          parent_record: args.parentRecord
        };
      }

      var snapshotId = processDefinitionGr.getValue("snapshot");
      var parentRecordRef = new GlideRecord(global.PDConstants.TABLES.PD_SNAPSHOT_INPUT);
      parentRecordRef.addQuery("model", snapshotId);
      parentRecordRef.addQuery("element", "parent_record");
      parentRecordRef.query();
      parentRecordRef.next();
      var parentTable = parentRecordRef.getValue("reference");
      var parentRecord = new GlideRecord(parentTable);
      var isOnDemand = processDefinitionGr.getValue(global.PDConstants.FIELDS.EXECUTION_TYPE) === "on_demand";

      if (!isOnDemand && !parentRecord.get(parentRecordId)) {
        return {
          errorType: "PARENT_RECORD_NOT_FOUND",
          message: gs.getMessage("'{0}' is not a valid parent record id", parentRecordId),
          parent_table: parentTable,
          parent_record: args.parentRecord,
          process_definition_id: args.processDefinitionId
        };
      }

      try {
        input = Object.fromEntries(
          decodeURIComponent(args.input) // decode the entire string first
            .trim() // trim whitespace if any
            .split("&") // split at & sign
            .map((s) => s.split("=")) // within each split, split again at equal sign so we can map it to object
            .map((pair) => pair.map(decodeURIComponent))// decodeURIComponent in case the value is uri encoded
        );
      } catch (e) {
        return {
          errorType: "LAUNCH_PLAYBOOK_FAILED",
          message: e.message,
          process_definition_id: processDefinitionId,
          parent_table: parentTable,
          parent_record: parentRecordId,
          input: args.input
        };
      }

      try {
        contextId = sn_playbook.PlaybookExperience.launchPlaybookSecure(processDefinitionId, parentRecord, input);
        if (isOnDemand) {
            parentTable = global.PDConstants.TABLES.SYS_PLAYBOOK_EXECUTION;
            var pdContextGr = new GlideRecord(global.PDConstants.TABLES.PD_CONTEXT);
            if (pdContextGr.get(contextId)) {
                parentRecordId = pdContextGr.getValue("input_record") || "";
            } else {
                parentRecordId = "";
            }
        }
      } catch (e) {
        return {
          errorType: "LAUNCH_PLAYBOOK_FAILED",
          message: e.message,
          process_definition_id: processDefinitionId,
          parent_table: parentTable,
          parent_record: parentRecordId
        };
      }
      return {
          sys_id: contextId,
          parent_table: parentTable,
          parent_record: parentRecordId
      };
})(env);
