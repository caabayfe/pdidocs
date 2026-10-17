function script({api, event}) {  
   const { listId } = event.payload;
   if (typeof listId !== "undefined" && api.state.listId !== listId) {
        api.emit('LIST_CTRL#SELECTED_LIST_UPDATED', { listId });
        api.setState('listIdUpdateFromMenuClick', true);
   }
}
