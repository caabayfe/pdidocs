/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
   api,
   event,
   helpers,
   imports
}) {
   const eventMap = {
      "replace_coverage": "CALENDAR_OPEN_REPLACE_COVERAGE",
      "schedule_absence": "CALENDAR_OPEN_SCHEDULE_ABSENCE",
      "delete_coverage": "CALENDAR_OPEN_DELETE_COVERAGE",
      "provide_coverage": "CALENDAR_OPEN_PROVIDE_COVERAGE"
   };
   if (event.context.item.value.id === "replace_coverage") api.state.contextProps.actionObj.provideCoverageObject.isReplaceCoverage = true;
   const modalData = (event.context.item.value.id === "schedule_absence") ? api.state.contextProps.actionObj.scheduleAbsenceObject : api.state.contextProps.actionObj.provideCoverageObject;

   switch (event.context.item.value.id) {
      case "replace_coverage":
         modalData.header = await helpers.translate("Replace Coverage");
         break;
      case "schedule_absence":
         modalData.header = await helpers.translate("Schedule Absence");
         break;
      case "delete_coverage":
         modalData.header = await helpers.translate("Delete Coverage");
         break;
      case "provide_coverage":
         modalData.header = await helpers.translate("Provide Coverage");
         break;
   }
   api.emit(eventMap[event.context.item.value.id], {
      modalData: modalData
   });
}
