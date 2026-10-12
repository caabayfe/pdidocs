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
        parseGroupTree,
        parseGeneralTree,
        parseCITree,
        getTargetField
    } =
    imports['sn_record_page.Content Tree Utils']();
    const {
        props: {
            table,
            referenceTable,
            referenceField,
            dependentField,
            fieldType,
            currentValue,
            displayValue,
            displayValueList
        }
    } = api.context;
    const {
        treePickerConfig: {
            processor,
            targetPath = '',
            targetValue,
            queryString
        },
        domainID
    } = api.data.tree_picker.treePicker;
    let targetPathValue = [
        []
    ];
    if (targetPath) {
        targetPathValue = targetPath.split(';').reduce((target, source) => {
            target.push(source.split(','));
            return target;
        }, []);
    }
    let nameSuffix = 'parent';
    let type = 'child';
    const name = `${referenceTable}.${nameSuffix}`;
    const reference = `${table}.${referenceField}`;
    const chars = targetValue || '';
    const target = getTargetField(referenceTable, referenceTable, dependentField);

    const params = {
        sysparm_processor: processor,
        method: 'getTreeNodes',
        sysparm_name: name,
        sysparm_type: type,
        sysparm_chars: chars,
        sysparm_reference: reference,
        sysparm_target: target,
        sysparm_dependent_value: targetValue,
        sysparm_domain: domainID,
        sysparm_query: queryString || undefined
    };

    if (currentValue !== '')
        api.setState('clickedItems', {
            value: currentValue.split(','),
            displayValue: displayValueList || displayValue.split(',')
    });

    helpers
        .snHttp(
            '/xmlhttp.do', {
                method: 'POST',
                batch: false,
                body: {},
                params: params,
                headers: {
                    'X-WantSessionNotificationMessages': 'true',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                }
            }
        )
        .then(async ({
            response
        }) => {
            const xml = Object.values(response).join('');
            let treeJSON;
            if (referenceTable === 'sys_user_group') {
                treeJSON = parseGroupTree(xml);
                api.setState('treeItems', [treeJSON]);
            } else if (referenceTable === 'cmdb_ci') {
                treeJSON = await parseCITree(xml, undefined, targetValue, helpers);
                api.setState('treeItems', treeJSON);
            } else {
                treeJSON = parseGeneralTree(xml);
                api.setState('treeItems', [treeJSON]);
            }

            if (fieldType !== 'glide_list' && targetPathValue[0].length > 1) {
                api.emit('EXPAND_ON_LOAD');
            } else {
                api.setState('selectedItems', targetPathValue);
            }
        });
}
