// Look for new SLAs that must be started, then process active SLAs for this task
// NB. Two copies of this asynch business rule could be running concurrently
//     Make sure that any BRs that call gs.flushWorkflow() are ordered to run before this

lookForNewSLAs();
processExistingSLAs();

// Finds potentially relevant SLAs
function lookForNewSLAs() {
   if (useContract()) {
      runContractSLAs();
      return;
   }

   // process SLA Definitions
   var sla = new GlideRecord('contract_sla');
   sla.addActiveQuery();
   sla.addQuery('collection', current.getRecordClassName());
   if (sla.isValidField("sys_class_name"))
      sla.addQuery("sys_class_name", "contract_sla");
   sla.query();
   while (sla.next())
      processNewSLA(sla);

   // process Service Offering-specific SLA Definitions
   if (current.cmdb_ci.sys_class_name + '' !== "service_offering")
      return;

   var soc = new GlideRecord("service_offering_commitment");
   if (!soc.isValid())
      return;

   soc.addQuery("service_offering", current.cmdb_ci);
   soc.addQuery("service_commitment.type", "SLA");
   soc.addNotNullQuery("service_commitment.sla");
   soc.query();
   while (soc.next()) {
      if (sla.get(soc.service_commitment.sla) && sla.collection + '' === current.getRecordClassName() && Boolean(sla.active) === true)
         processNewSLA(sla);
   }
}

function useContract() {
   var contractTables = gs.getProperty('com.snc.sla.contract.tables', '');
   var arr = contractTables.replaceAll(" ", "").split(",");
   return new ArrayUtil().contains(arr, current.getRecordClassName());
}

function runContractSLAs() {
   var contractRelSLA = new GlideRecord('contract_rel_contract_sla');
   contractRelSLA.addQuery('contract', current.contract);
   contractRelSLA.addQuery('contract_sla.collection', current.sys_class_name);
   contractRelSLA.addQuery('contract_sla.active', 'true');
   contractRelSLA.query();
   while (contractRelSLA.next())
      processNewSLA(contractRelSLA.contract_sla);
}

function processNewSLA(sla) {
   // If start condition matches this task and stop condition doesn't,
   // create task_sla if there isn't one
   if (!sla.start_condition)
      return;

   var startConditionMatches = GlideFilter.checkRecord(current, sla.start_condition);
   if (!startConditionMatches)
      return;

   var stopConditionMatches = GlideFilter.checkRecord(current, sla.stop_condition);
   if (sla.stop_condition && stopConditionMatches)
      return;

   var taskSLA = new GlideRecord('task_sla');
   taskSLA.addActiveQuery();
   taskSLA.addQuery('task', current.sys_id);
   taskSLA.addQuery('sla', sla.sys_id);
   taskSLA.setLimit(1);
   taskSLA.query();
   if (taskSLA.hasNext())
      return;

   insertTaskSLA(sla);
}

function insertTaskSLA(sla) {
   // Get preferences for where to get time zone and schedule
   var schSource = sla.schedule_source + '';
   var tzSource = sla.timezone_source + '';

   var newTaskSLA = new GlideRecord('task_sla');
   newTaskSLA.task = current.sys_id;
   newTaskSLA.sla = sla.sys_id;
   newTaskSLA.start_time = current.sys_updated_on;
   var scheduleId = SLASchedule.source(schSource, newTaskSLA);
   if (scheduleId)
	  newTaskSLA.schedule = scheduleId;
   newTaskSLA.timezone = SLATimezone.source(tzSource, newTaskSLA);
   // explicitly use system timezone, if the above property points to an empty/null value
   if (!newTaskSLA.timezone)
      newTaskSLA.timezone = gs.getSysTimeZone();
   newTaskSLA.start_time = Boolean(sla.retroactive) === true ? current[sla.set_start_to] : current.sys_updated_on;
   newTaskSLA.insert();
}

function processExistingSLAs() {
   // Iterate through this task's active SLAs to determine necessary action
   var taskSLA = new GlideRecord('task_sla');
   taskSLA.addQuery('task', current.sys_id);
   taskSLA.addActiveQuery();
   taskSLA.query();
   while (taskSLA.next()) {
      // Do the pause and resume checks
      if (taskSLA.sla.pause_condition) {
         var pauseConditionMatches = GlideFilter.checkRecord(current, taskSLA.sla.pause_condition);
         if (taskSLA.stage + '' !== 'paused' && pauseConditionMatches) {
            // If pause condition matches this task, pause the SLA
            taskSLA.stage = 'paused';
            taskSLA.update();
         } else if (taskSLA.stage + '' === 'paused' && !pauseConditionMatches) {
            // If pause condition no longer matches this task, resume the SLA
            taskSLA.stage = 'in_progress';
            taskSLA.update();
         }
      }

      //Do the stop check
      if (taskSLA.sla.stop_condition) {
         var stopConditionMatches = GlideFilter.checkRecord(current, taskSLA.sla.stop_condition);
         if (stopConditionMatches) {
            // If stop condition matches this task, stop the SLA
            taskSLA.active = false;
            taskSLA.end_time = current.sys_updated_on;
            taskSLA.update();
         } else {
            // Not stopping, so do the cancel check
            var startConditionMatches = GlideFilter.checkRecord(current, taskSLA.sla.start_condition);
            if (!startConditionMatches || cancelServiceOfferingSLA(taskSLA)) {
               // If the start condition no longer applies, cancel the SLA
               // If service offering-specific SLA longer relevant, cancel the SLA
               taskSLA.active = false;
               taskSLA.end_time = current.sys_updated_on;
               taskSLA.stage = 'cancelled';
               taskSLA.update();
            }
         }
      }
   }
}

function cancelServiceOfferingSLA(taskSLA) {
   var soc = new GlideRecord("service_offering_commitment");
   if (!soc.isValid())
      return false;

   if (taskSLA.sla.sys_class_name + '' !== "service_offering_sla")
      return false;

   soc.addQuery("service_commitment.type", "SLA");
   soc.addQuery("service_commitment.sla", taskSLA.sla);
   soc.addQuery("service_offering", current.cmdb_ci);
   soc.query();
   if (soc.hasNext())
      return false;

   gs.print("canceling Service Offering SLA: " + taskSLA.sla.name + " - task is now against different CI");
   return true;
}
