/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {

let treeItems = [{
        "id": "generalInfo",
        "label": await helpers.translate("General Information"),
        "disabled": false,
        "visited": true,
        "statuses": [{
            "icon": "circle-check-outline",
            "type": "icon"
        }]
     }, {
        "id": "createCondition",
        "label": await helpers.translate("Create condition"),
        "disabled": true,
        "visited": false,
        "statuses": [{
            "icon": "lock-outline",
            "type": "icon"
        }]
    }, {
        "id": "selectMain",
        "label": await helpers.translate("Select main CI"),
        "disabled": true,
        "visited": false,
        "statuses": [{
            "icon": "lock-outline",
            "type": "icon"
        }]
    }, {
        "id": "mergeAttributes",
        "label": await helpers.translate("Merge attributes"),
        "disabled": true,
        "visited": false,
        "statuses": [{
            "icon": "lock-outline",
            "type": "icon"
        }]
    }, {
        "id": "mergeRelationships",
        "label": await helpers.translate("Merge relationships"),
        "disabled": true,
        "visited": false,
        "statuses": [{
            "icon": "lock-outline",
            "type": "icon"
        }]
    }, {
        "id": "mergeRelatedItems",
        "label": await helpers.translate("Merge related items"),
        "disabled": true,
        "visited": false,
        "statuses": [{
            "icon": "lock-outline",
            "type": "icon"
        }]
    }, {
        "id": "duplicateActions",
        "label": await helpers.translate("Duplicate CI actions"),
        "disabled": true,
        "visited": false,
        "statuses": [{
            "icon": "lock-outline",
            "type": "icon"
        }]
    }, {
        "id": "reviewTest",
        "label": await helpers.translate("Review and test"),
        "disabled": true,
        "visited": false,
        "statuses": [{
            "icon": "lock-outline",
            "type": "icon"
        }]
    }];

    api.setState('treeItems', treeItems);

}
