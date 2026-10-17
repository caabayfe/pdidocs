/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        assignmentGroupSysId
    } = api.context.props;
    // reset the client state params
    api.setState('assigneeSysId', null);
    api.setState('comments', null);
    api.setState('searchString', null);
    api.setState('validForm', false);
    api.setState('assignmentGroupSysId', assignmentGroupSysId == '-1' ? '' : assignmentGroupSysId);
    api.setState('userTable', api.context.props.userTable);
}
