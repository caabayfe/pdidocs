/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        NowDateTime
    } = imports['sn_uxf.core_libraries']();

    const EVENT_DATA_READY = "SN_FORM_DATA_CONNECTED#FETCH_STATUS_UPDATED";
    const {
        name,
        payload
    } = event;

    const convertChoiceToDropDown = (choiceList) => {
        var dropdownArray = [];
        for (var item of choiceList) {
            var choice = {};
            choice.id = item.value;
            choice.label = item.displayValue;
            dropdownArray.push(choice);
        }
        return dropdownArray;
    };

    switch (name) {
        case EVENT_DATA_READY:
            const blobData = api.data.glide_form_add_event.nowRecordFormBlob;
            if (blobData) {
                api.setState('repeatTypeChoiceList', convertChoiceToDropDown(blobData.fields.repeat_type.choices));
                api.setState('monthlyTypeChoiceList', convertChoiceToDropDown(blobData.fields.monthly_type.choices));
                api.setState('yearlyTypeChoiceList', convertChoiceToDropDown(blobData.fields.yearly_type.choices));
                api.setState('floatWeekChoiceList', convertChoiceToDropDown(blobData.fields.float_week.choices));
                api.setState('floatDayChoiceList', convertChoiceToDropDown(blobData.fields.float_day.choices));
                api.setState('monthChoiceList', convertChoiceToDropDown(blobData.fields.month.choices));
                if (api.context.props.scheduleSpanSysId != "-1") {
                    api.emit('SCHEDULE#HANDLE_DATA_FROM_RECORD');
                }
            }
            break;
        default:
            break;
    }
}
