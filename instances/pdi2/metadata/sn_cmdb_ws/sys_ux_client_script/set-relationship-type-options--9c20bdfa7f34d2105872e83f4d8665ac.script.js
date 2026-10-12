/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {
        hideRelTypes
    } = api.state.relProps;
    const {
        output
    } = api.data.get_relationship_types;
    let relTypes = {
        suggested: [],
        allCi: [],
        user: [],
        userGroup: []
    };

    for (let i = 0; i < output.length; i++) {
        const {
            dependent_class,
            filter,
            is_parent,
            label,
            rel_name,
            suggested,
            type,
            value
        } = output[i];
        let table = ['cmdb_rel_person', 'cmdb_rel_group'].includes(type) ? dependent_class: 'cmdb_ci';
        let listItem = {
            id: value,
            label,
            relName: rel_name,
            table,
            type,
            filter,
            isParent: is_parent
        };
        if (suggested) {
            relTypes.suggested.push(listItem);
        } else if (type === 'cmdb_rel_person') {
            relTypes.user.push(listItem);
        } else if (type === 'cmdb_rel_group') {
            relTypes.userGroup.push(listItem);
        } else {
            relTypes.allCi.push(listItem);
        }
    }

    let relGroups = [];
    if (relTypes.suggested.length && !hideRelTypes.ci) {
        relGroups.push({
            id: 'suggested_relationships',
            label: await helpers.translate('Suggested relationships'),
            children: [...relTypes.suggested]
        });
    }
    if (relTypes.allCi.length && !hideRelTypes.ci) {
        relGroups.push({
            id: 'ci_relationships',
            label: await helpers.translate('CI relationships'),
            children: [...relTypes.allCi]
        });
    }
    if (relTypes.user.length && !hideRelTypes.user) {
        relGroups.push({
            id: 'user_relationships',
            label: await helpers.translate('User relationships'),
            children: [...relTypes.user]
        });
    }
    if (relTypes.userGroup.length && !hideRelTypes.group) {
        relGroups.push({
            id: 'group_relationships',
            label: await helpers.translate('Group relationships'),
            children: [...relTypes.userGroup]
        });
    }

    api.setState('relProps', ({currentValue}) => {
        return { ...currentValue, relationshipTypes: relGroups };
    });
}
