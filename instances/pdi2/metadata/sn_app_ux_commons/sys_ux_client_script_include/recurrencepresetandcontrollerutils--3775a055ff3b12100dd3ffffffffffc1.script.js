/// @ts-check
/**
 * @param {*} importsIncludes
 * @param {RecurrencePresetController.ClientParams} param1
 * @returns
 */
function include(importsIncludes, { api, event, helpers, imports }) {

    const {
        getRecurrenceObject,
        getCMNObject
    } = imports["sn_app_ux_commons.CmnObjectUtils"]();

    const DEFAULT_DATE_FORMAT = "dd-MM-yyyy";
    const DEFAULT_TIME_FORMAT = "hh:mm a";
    const NEVER = "never";
    const DEFAULT_MONTH_OR_YEAR_TYPE = "date";
    const FLOATING_TIME_ZONE = "floating";
    const {scheduleSysId} = api.context.props;

    /**
     *
     * @param {Partial<RecurrencePresetController.State>} props
     */
    function updateState(props) {
        Object.entries(props).forEach(([key, value]) => {
            /// @ts-ignore
            api.setState(key, value);
        })
    }

    function setAllStatesToDefault() {
        updateState({
            eventTitle: '',
            startDate: '',
            allDay: false,
            fromTime: '',
            toTime: '',
            toDate: '',
            selectedTimezone: FLOATING_TIME_ZONE,
            repeatsType: NEVER,
            repeatsCount: 0,
            repeatsUntil: '',
            daysInWeek: [],
            monthType: DEFAULT_MONTH_OR_YEAR_TYPE,
            yearType: DEFAULT_MONTH_OR_YEAR_TYPE,
            exceptions: [],
            timeFormat: DEFAULT_TIME_FORMAT,
            dateFormat: DEFAULT_DATE_FORMAT,
            validationMessages: []
        })
    }

    function getCmnScheduleDetailsSuccessHandler() {
        const { data } = api.data.getcmnscheduledetails.output;
        if (!Object.keys(data).length || !scheduleSysId) {
            setAllStatesToDefault();
            return;
        }
        const timeFormat = api.state.timeFormat;
        const dateFormat = api.state.dateFormat;
        const recurrenceData = getRecurrenceObject(data, dateFormat, timeFormat);
        updateState({
            ...recurrenceData,
            repeatsType: recurrenceData.repeatType,
            repeatsCount: recurrenceData.repeatCount,
            repeatsUntil: recurrenceData.repeatUntil,
            exceptions: recurrenceData.recurrenceExceptions,
            dateFormat,
            timeFormat,
            validationMessages: []
        });
    }

    async function getCmnScheduleDetailsErrorHandler() {
        const { errors } = event.payload || [];
        setAllStatesToDefault()
        if (errors.length === 0 || !scheduleSysId) return;
        /**
         * @type {Array<RecurrencePresetController.validationMessage>}
         */
        const validationMessages = [];
        for (const error of errors) {
            if (error.includes('Schedule not found')) {
                validationMessages.push({
                    type: 'critical',
                    message: await helpers.translate('No schedule for corresponding schedule Id')
                });
            }
            if (error.includes('ACL')) {
                validationMessages.push({
                    type: 'critical',
                    message: await helpers.translate('schedule admin role is not present for logged in user')
                });
            }
        }
        if (validationMessages.length > 0)
            updateState({ validationMessages });
    }

    async function macroponentReadyHandler() {
        const roles = api.context.session.user.roles;
        const allowedRoles = ['admin', 'maint', 'schedule_admin'];
        /**
         * @type {Array<RecurrencePresetController.validationMessage>}
         */
        const validationMessages = [];
        const hasAllowedRole = roles.some(role => allowedRoles.includes(role));
        if (!hasAllowedRole)
            validationMessages.push({
                type: 'critical',
                message: await helpers.translate('schedule admin role is not present for logged in user'),
            });
        updateState({ validationMessages });
    }

    function validateAndCreateScheduleRecurrenceHandler() {
      const {
        payload: { eventRecurrence },
      } = event;

      const timeFormat = api.state.timeFormat;
      const dateFormat = api.state.dateFormat;

      let scheduleRecurrenceData = getCMNObject(
        eventRecurrence,
        dateFormat,
        timeFormat
      );

      const scheduleSysId = !api.context.props.scheduleSysId
        ? ""
        : api.context.props.scheduleSysId;

      const documentKey = api.context.props.documentKey;

      scheduleRecurrenceData = {
        ...scheduleRecurrenceData,
        scheduleSysId,
        documentKey,
      };

      ;
      api.setState("scheduleRecurrenceData", scheduleRecurrenceData);
    }

    function createScheduleRecurrenceSuccessHandler() {
      const scheduleSysId = api.data.create_schedule_recurrence.output.sys_id;

      api.emit("CREATE_SCHEDULE_RECURRENCE_SUCCESS", {
        scheduleSysId,
      });

      api.data.getcmnscheduledetails.refresh();
    }

    async function createScheduleRecurrenceErrorHandler() {
      const { errors } = event.payload;
      const validationMessages = [];

      if (errors.some((error) => error.includes("ACL"))) {
        validationMessages.push({
          message: await helpers.translate(
            "schedule admin role is not present for logged in user"
          ),
          type: "critical",
        });
      }
      if (errors.some((error) => error.includes("Overlap Error"))) {
        validationMessages.push({
          message: await helpers.translate(
            "The repeat type and date range results in overlapping events - please change to avoid overlaps"
          ),
          type: "critical",
        });
      } else {
        validationMessages.push({
          message: await helpers.translate(
            "An error occurred while creating the recurring event."
          ),
          type: "critical",
        });
      }

      api.setState("validationMessages", validationMessages);
    }

    function deleteScheduleRecurrenceHandler() {
      const { scheduleSysId } = event.payload;
      api.setState("toDeleteScheduleSysId", scheduleSysId);
    }

    function deleteScheduleRecurrenceSuccessHandler() {
      const result = api.data.delete_schedule_recurrence.output;
      if (result)
        api.emit("ON_DELETE_SCHEDULE_RECURRENCE", {
          isScheduleDeleted: result,
        });
    }

    function deleteScheduleRecurrenceErrorHandler() {
      api.emit("ON_DELETE_SCHEDULE_RECURRENCE", {
        isScheduleDeleted: false,
      });
    }

    return {
        getCmnScheduleDetailsSuccessHandler,
        getCmnScheduleDetailsErrorHandler,
        macroponentReadyHandler,
        validateAndCreateScheduleRecurrenceHandler,
        createScheduleRecurrenceSuccessHandler,
        createScheduleRecurrenceErrorHandler,
        deleteScheduleRecurrenceHandler,
        deleteScheduleRecurrenceSuccessHandler,
        deleteScheduleRecurrenceErrorHandler
    }
}
