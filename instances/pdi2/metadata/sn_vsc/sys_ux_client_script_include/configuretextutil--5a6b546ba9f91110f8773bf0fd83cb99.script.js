function include({
    imports
}) {
    return {
        navigateTo: _navigateTo,
        getHighlightedTextColor: _getHighlightedTextColor,
        getHighlightedTextIcon: _getHighlightedTextIcon
    };

//  Get Configure and Non-Configure highlighted text color
 function _getHighlightedTextColor (api) { 
    var state = api.context.props.payload.props_details.compliance_state;
    if (state == "Compliant") {
        api.setState("color",  "green");
    } else if (state == "Not compliant") {
        api.setState("color", "warning");
    } 
 }

//  Get Configure and Non-Configure highlighted text icon
 function  _getHighlightedTextIcon (api) {
    var state = api.context.props.payload.props_details.compliance_state;
    if (state == "Compliant") {
        api.setState("icon",  "Circle Check Outline");
    } else if (state == "Not compliant") {
        api.setState("icon",  "Diamond Exclamation Outline");
    } 
}
}
