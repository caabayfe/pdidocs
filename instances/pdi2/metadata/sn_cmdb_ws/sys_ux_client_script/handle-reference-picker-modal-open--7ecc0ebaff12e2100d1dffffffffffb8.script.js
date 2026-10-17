function script({api, event, helpers, imports}) {
const {
        label,
        referenceTable,
        referenceQualifier
    } = event.payload.fieldData;
    api.setState = ('refPickerProps', ({currentValue}) => ({
        ...currentValue,
        table: referenceTable,
        fixedFilter: referenceQualifier,
        requestingEvent: event
    }));

    helpers.modal.open('reference_picker_modal', {headerLabel: label});  }
