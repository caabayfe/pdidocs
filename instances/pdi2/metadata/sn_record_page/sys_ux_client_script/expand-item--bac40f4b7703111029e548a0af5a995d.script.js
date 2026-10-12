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
    const {
        parseGroupTree,
        parseGeneralTree,
        parseCITree,
        addNewChild,
        getTargetField
    } = imports['sn_record_page.Content Tree Utils']();

    const {
        props: {
            table,
            referenceTable,
            referenceField,
            dependentField
        }
    } = api.context;
    const {
        item,
        path
    } = event.payload;
    let nameSuffix = 'parent';
    let type = 'child';
    const name = `${item.class}.${nameSuffix}`;
    const {
        treePickerConfig: {
            processor,
            targetValue,
            queryString
        },
        domainID
    } = api.data.tree_picker.treePicker;
    const reference = `${table}.${referenceField}`;
    const target = getTargetField(referenceTable, item.class, dependentField);
    const params = {
        sysparm_processor: processor,
        method: 'getTreeNodes',
        sysparm_name: name,
        sysparm_type: type,
        sysparm_chars: item.id,
        sysparm_reference: reference,
        sysparm_target: target,
        sysparm_dependent_value: targetValue,
        sysparm_domain: domainID,
        sysparm_query: queryString || undefined
    };

    api.setState('loadingItems', [{
        path: path,
        erorr: false
    }]);
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
                treeJSON = parseGroupTree(xml, item);
                const newTreeJSON = addNewChild(
                    api.state.treeItems[0],
                    path,
                    treeJSON,
                    0
                );
                api.setState('treeItems', [newTreeJSON]);
            } else if (referenceTable === 'cmdb_ci') {
                treeJSON = await parseCITree(xml, path, targetValue, helpers);
                let newTreeJSON = {};
                if (item.relType === 'child') {
                    newTreeJSON = addNewChild(api.state.treeItems[0], path, treeJSON[0]);
                    api.setState('treeItems', [newTreeJSON, [...api.state.treeItems[1]]]);
                    api.emit('SELECTED_ITEM', {
                        treeJSON: treeJSON[0],
                        parentId: item.id
                    });
                } else {
                    newTreeJSON = addNewChild(api.state.treeItems[1], path, treeJSON[1]);
                    api.setState('treeItems', [
                        [...api.state.treeItems[0]], newTreeJSON
                    ]);
                    api.emit('SELECTED_ITEM', {
                        treeJSON: treeJSON[1],
                        parentId: item.id
                    });
                }
            } else {
                treeJSON = parseGeneralTree(xml);
                const newTreeJSON = addNewChild(
                    api.state.treeItems[0],
                    path,
                    treeJSON,
                    0
                );
                api.setState('treeItems', [newTreeJSON]);
            }
            api.setState('loadingItems', []);
        });
}
