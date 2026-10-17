// This script gets called whenever the rootNode (from context params) or ciData (from get map data controller) is changed or when rootNode is empty
function script({api, event, helpers, imports}) {
  const { NowDateTime } = imports["sn_uxf.core_libraries"]()
 
  var markerFilterTimestamp = NowDateTime(api.context.props.markerFilterTimestamp).format("YYYY-MM-DD HH:mm:ss");
  api.setState("markerFilterTimestamp", markerFilterTimestamp.toString());
}
