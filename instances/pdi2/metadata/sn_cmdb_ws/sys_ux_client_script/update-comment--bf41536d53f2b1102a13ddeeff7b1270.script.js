/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        selectionProps: {
            selectedRowIds
        }
    } = api.data.list;
    const {
        attributeCheckedState
    } = api.state;
    const {
        attrStatusAndCommentCache
    } = api.data.cert;

    let attrComments = new Set();
    let recordComments = new Set();

    const selectedAttributes = Object.keys(attributeCheckedState).filter(key => attributeCheckedState[key]);

    selectedRowIds.forEach((rowId) => {
        selectedAttributes.forEach((attrName) => {
            let attrComment = attrStatusAndCommentCache[rowId]["attributes"][attrName].comment;
            if (attrComment)
                attrComments.add(attrComment);
        });

        let recordComment = attrStatusAndCommentCache[rowId].recordLevelComment;
        if (recordComment)
            recordComments.add(recordComment);
    });

    let comment = "";
    // 1 or more fields selected, show attribute comment
    if (selectedAttributes.length >= 1) {
      comment = attrComments.size === 1 ? [...attrComments][0] : "";
    }
    // no attribute selected, show record comment
    else {
      comment = recordComments.size === 1 ? [...recordComments][0] : "";
    }
 
    api.setState("comment",  comment);
}
