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
    const ALL_OPERATIONS = 0,
        SINGLE_OPERATION = 1,
        ACL_DETAIL = 2;
        
    const {
        EvalStatus, navTo, addRequestInfo
    } = imports["sn_access_analyzer.UserComparisonUtil"](api, helpers);
    const subPageHandler = imports["sn_access_analyzer.GuidedExperienceSubPageHandler"](api);
     
    const SubPageEvent = subPageHandler.SubPageEvent;
    
    const _initializeRequestInfo = (requestPayload, date, values, _isRoleAction, _hasRecord, _hasField) => {
        const roleOrGroup = _isRoleAction ? 'role' : 'group';
        let ri = [];
        addRequestInfo(ri, values[4], requestPayload.user.label, navTo('sys_user', requestPayload.user.id));
        addRequestInfo(ri, values[5], requestPayload[roleOrGroup].label, navTo(_isRoleAction ? 'sys_user_role' : 'sys_user_group', requestPayload[roleOrGroup].id));
        addRequestInfo(ri, values[6], requestPayload.table.label);

        if (_hasRecord) {
            addRequestInfo(ri, values[25], requestPayload.record.label);
        }
        if (_hasField) {
            addRequestInfo(ri, values[26], requestPayload.field.label);
        }
        addRequestInfo(ri, values[7], date);
        api.setState('requestInfoDefault', ri);
        api.setState('requestInfo', ri);
    }; 
    const _translateTexts = (requestPayload, date, _isRoleAction, _hasRecord, _hasField) => {
        const promises = [
            helpers.translate('Operation'),
            helpers.translate('Present status'),
            helpers.translate('Simulated status'),
            helpers.translate('Operations'),
            helpers.translate('User'),
            _isRoleAction ? helpers.translate('Role') : helpers.translate('Group'),
            helpers.translate('Table'),
            helpers.translate('Date executed'),
            helpers.translate("Sorry, we couldn't find any Access control rules!"),
            helpers.translate("It could be because there are no rules defined for this operation"),
            helpers.translate('#'), //10
            helpers.translate('name'),
            helpers.translate('Roles'),
            helpers.translate('Security attribute'),
            helpers.translate('Condition'),
            helpers.translate('Script'),
            helpers.translate('ACL name'), //16
            helpers.translate('Decision type'),
            helpers.translate('Applies to condition'),
            helpers.translate('Empty')
        ];

        promises.push(helpers.translate('Allow access')); // 20
        promises.push(helpers.translate('Deny access')); // 21
        promises.push(helpers.translate('Not evaluated')); // 22
        promises.push(helpers.translate('True')); // 23
        promises.push(helpers.translate('False')); // 24
        promises.push(helpers.translate('Record')); //25
        promises.push(helpers.translate('Field')); //26
        promises.push(helpers.translate('Controlled by References')); //27
        
        Promise.all(promises).then(values => {
            const allOperationScreencols = api.state.tableDefs[ALL_OPERATIONS].colDef.columns;
            allOperationScreencols[0].label = values[0];
            allOperationScreencols[1].label = values[1];
            allOperationScreencols[2].label = values[2];

            const singleScreencols = api.state.tableDefs[SINGLE_OPERATION].colDef.columns;
            singleScreencols[0].label = values[10];
            singleScreencols[1].label = values[11];
            singleScreencols[2].label = values[17];
            singleScreencols[3].label = values[18];
            singleScreencols[4].label = values[19];
            singleScreencols[5].label = values[1];
            singleScreencols[6].label = values[2];

            const aclDetailScreencols = api.state.tableDefs[ACL_DETAIL].colDef.columns;
            aclDetailScreencols[0].label = values[11];
            aclDetailScreencols[1].label = values[1];
            aclDetailScreencols[2].label = values[2];

            const bc = [...api.state.breadCrumbs];
            bc[0].label = values[3];
            api.setState('breadCrumbs', bc);

            _initializeRequestInfo(requestPayload, date, values, _isRoleAction, _hasRecord, _hasField);

            api.setState("noAcl", {
                header: values[8],
                emptyStateHeader: {
                    label: values[9],
                    level: 3
                }
            });

            var translatedMessages = api.state.translatedMessages;
            translatedMessages.roles = values[12];
            translatedMessages.securityAttribute = values[13];
            translatedMessages.condition = values[14];
            translatedMessages.script = values[15];
            translatedMessages.acl_name = values[16];
            translatedMessages.decisionType = values[17];
            translatedMessages.appliesToCondition = values[18];
            translatedMessages.empty = values[19];

            translatedMessages.allow = values[20];
            translatedMessages.deny = values[21];
            translatedMessages.not_evaluated = values[22];
            translatedMessages['true'] = values[23];
            translatedMessages['false'] = values[24];
            translatedMessages.controlledByReferences = values[27];
        });
    };
    
    const onPageReady = (payload) => {
        EvalStatus.translate();
        const requestPayload = payload.dataSet.criteria.request;
        const action = payload.pageParams.action;
        let _isRoleAction = (action == 'add-role' || action == 'remove-role'), _hasRecord = requestPayload.record.id, _hasField = requestPayload.field.id;
        const simulatedResult = payload.dataSet.criteria.simulatedResult;
        _translateTexts(requestPayload, simulatedResult.date, _isRoleAction, _hasRecord, _hasField);
    }

    subPageHandler.onReceive(SubPageEvent.PAGE_READY, onPageReady);
    subPageHandler.handle(event);
}
