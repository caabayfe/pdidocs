
			/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const tabs = api.data.controller.listMenu.model.tabs;
  const menuItems = api.data.controller.listMenu.model.menuItems;
  const defaultListsTab = tabs.find((tab) => tab.id == 'sys_ux_list');
  const myListsTab = tabs.find((tab) => tab.id == 'sys_ux_my_list');
 
  const constructTree = (roots) => {
    const newRoots = [];
    for (const rootIndex in roots) {
      const root = roots[rootIndex];
      
      if (root.treeContent){
        newRoots[rootIndex] = {...root};
        newRoots[rootIndex].children = [];
        newRoots[rootIndex].children = constructTree(root.treeContent);
      }
      else if (root.children){
        newRoots[rootIndex] = {...root};
        newRoots[rootIndex].children = [];
        newRoots[rootIndex].children = constructTree(root.children);
      }
      else{
        newRoots[rootIndex] = menuItems[root.id];
      }
    } 
    return newRoots;
  };

  const defaultListTree = constructTree(defaultListsTab.treeContent);
  // When my list sections are added construct tree using constmyListsTab.treeContent instead
  const myListTree = constructTree(myListsTab.treeContent);
	return myListTree.concat(defaultListTree);
}
