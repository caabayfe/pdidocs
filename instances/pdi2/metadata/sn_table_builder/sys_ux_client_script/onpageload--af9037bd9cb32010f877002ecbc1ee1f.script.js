
      
function handler({api, event, helpers, imports}) {
    if(api.context.props.scopename){
      api.setState('hide_scope',false);
    }
}
