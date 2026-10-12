function handler({
    api,
    event,
    imports
}) {
    const isEmpty = (value) => {
        return (
            value == null || (typeof value === 'object' && Object.keys(value).length === 0) || (typeof value === 'string' && value.trim().length === 0)
        );
    };

    var changes = JSON.parse(api.context.props.serializedChanges);
    var sysId = api.context.props.sysId;
    var value = api.context.props.value;
    var encodedRecord = api.context.props.encodedRecord;
    var hasValue = true;

    if (isEmpty(value)) {
        hasValue = false;
        value = '';
    }

    api.setState('hasValue', hasValue);
    api.setState('value', value);
    api.setState('sysId', '-1');

    if (changes.hasOwnProperty('kb_knowledge_base') && !isEmpty(changes.kb_knowledge_base)) {
        api.setState('parentId', changes.kb_knowledge_base);
    } else if (!isEmpty(sysId) && sysId.length == 32) {
        api.setState('sysId', sysId);
    } else if (!isEmpty(encodedRecord)) {
        api.setState('encodedRecord', encodedRecord);
    }
}
