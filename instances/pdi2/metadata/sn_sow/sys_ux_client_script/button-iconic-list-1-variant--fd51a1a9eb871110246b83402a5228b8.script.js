function script({api, event}) { 
    return !api.state.gridViewSelected ? 'primary' : 'secondary';
 }
