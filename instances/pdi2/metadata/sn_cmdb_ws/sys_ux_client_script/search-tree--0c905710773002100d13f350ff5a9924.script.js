/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    let baseTree = {...api.state.baseTree};
    let searchTerm = event.payload.fieldValue.toLowerCase();
    let currentTree = [];
    let expandedItems = [];

    if(api.state.selectedType != 'group') {
        // start with first object
        var startPath = searchTerm ? [] : ['cmdb_ci'];
        currentTree.push(search(baseTree[0],startPath));

        // set results
        api.setState('currentTree',currentTree);
        api.setState('searchTerm',searchTerm);
        if(searchTerm.length == 0)
            expandedItems=[[baseTree[0].id]];
            
        api.setState('expandedItems',expandedItems);
    } else {
        for (let i in baseTree) {
            let group = baseTree[i];
            if(group.label.toLowerCase().includes(searchTerm)|| searchTerm.length == 0) {
                currentTree.push( {
                    "id": group.id,
                    "label": group.label
                    }
                );
            }
        }
        api.setState('currentTree',currentTree);
        api.setState('searchTerm',searchTerm);   

    }
    
    function search(x,path) {
        let pathCopy = [...path];
        pathCopy.push(x.id);
        let children = [];
        let childMatch = false;
        if (x.children) {
            for (const child of x.children) {
                let searchChild = search(child,pathCopy);
                if(searchChild.match){
                    childMatch = true;
                    children.push(searchChild);
                }
            }
        }
        children.sort((a, b) => (a.label > b.label) ? 1 : -1);
        let match = (x.label.toLowerCase().includes(searchTerm) || childMatch);
        let newChild = {
            "id": x.id,
            "label": x.label,
            "children": children,
            "match" : match,
            "childMatch" : childMatch
        };
        if(childMatch){
            expandedItems.push(pathCopy);
        }
        return newChild;
    }
   
}
