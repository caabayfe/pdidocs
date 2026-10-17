/**
 * Content Tree Builder Script
 * Filters the static tree configuration based on conditional flags
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */

function handler({ api, event }) {
  
  // ============================================
  // HELPER FUNCTION: Check if item should be shown
  // ============================================
  function shouldShowItem(item, conditions) {
    // If no conditional flag, always show
    if (!item.conditionalFlag) {
      return true;
    }
    
    // Check the condition from props or state
    return conditions[item.conditionalFlag] === true;
  }
  
  // ============================================
  // HELPER FUNCTION: Filter tree recursively
  // ============================================
  function filterTreeItems(items, conditions) {
    const filteredItems = [];
    
    for (const item of items) {
      // Check if this item should be shown
      if (shouldShowItem(item, conditions)) {
        // Clone the item to avoid mutating the original config
        // Preserve all properties including conditionalFlag
        const filteredItem = { ...item };
        
        // Process children if they exist
        if (item.children && item.children.length > 0) {
          const filteredChildren = filterTreeItems(item.children, conditions);
          
          // Update children with filtered results
          filteredItem.children = filteredChildren;
          
          // Only include parent if it has visible children OR has its own value
          if (filteredChildren.length > 0 || item.value) {
            filteredItems.push(filteredItem);
          }
        } else {
          // No children, just add the item
          filteredItems.push(filteredItem);
        }
      }
    }
    
    return filteredItems;
  }
  
  // ============================================
  // GET ALL CONDITIONAL FLAGS
  // Gather all conditions from props, state, or data
  // ============================================
  const conditions = {
    showHostedMidServers: api.data.midaas_plugin_status.output.active,
    // Add more conditions as needed
  };
  
  // ============================================
  // FILTER THE TREE BASED ON CONDITIONS
  // ============================================
  const contentTreeItems = filterTreeItems(api.state.contentTreeItems, conditions);
  
  // ============================================
  // SET STATE
  // ============================================
  api.setState('contentTreeItems', contentTreeItems);
  
  // ============================================
  // HANDLE INITIAL SELECTION
  // ============================================
  if (contentTreeItems.length > 0) {
    const firstItem = contentTreeItems[0];
    
    if (firstItem.children && firstItem.children.length > 0) {
      // Select first child
      const firstChild = firstItem.children[0];
      api.setState('contentTreeSelectedItem', [firstItem.id, firstChild.id]);

    } else if (firstItem.value) {
      // Select the item itself
      api.setState('contentTreeSelectedItem', [firstItem.id]);
      
    } else {
      // Parent with no children and no value - just select it
      api.setState('contentTreeSelectedItem', [firstItem.id]);
    }
  } else {
    // No items to show
    api.setState('contentTreeSelectedItem', []);
  }
}
