window.parent.$j("#dialog_frame").attr('style', 'min-width:440px;width:420px;max-height:440px;');
window.parent.$j('.drag_section_movearea').attr('style', 'opacity:0;');

var styles = ".required-marker, .timingDiv, .form-field-addons, .element-breakdown-element>a {display:none !important;}";
styles += ".form-horizontal .control-label {width:25%; text-align:right; margin-bottom:0; padding-top:7px;}";
styles += ".form-field {width:68% !important; padding-left:0 !important;}";
styles += ".section_header_content_no_scroll {padding:0;overflow:show;}";
styles += ".touch_scroll {overflow:visible;}";
$j("head").append("<style>" + styles + "</style>");

var select = $j('.form_action_button');
select.addClass('btn-primary').attr('style', 'padding:6px 25px;');
var group = $j('<div />', {});
group.insertBefore(select);
var labelDivStyle = window.NOW && window.NOW.isPolarisEnabled === 'true' ? 'width: 25%;' : 'float:left; width: 25%;';
var labelDiv = $j('<div />', {}).attr('style', labelDivStyle).appendTo(group);
var label = $j('<label />', { 'for': '', title: getMessage('Clear this check box to prevent users from applying breakdowns to this formula component.'), text: '' }).addClass('url').addClass('sn-tooltip-basic').addClass('col-sm-12').addClass('col-md-12').addClass('col-lg-12').attr('style', 'margin:4px; text-align: right;').appendTo(labelDiv);
var url = $j('<a />', {target: '_blank', href: 'http://docs.servicenow.com/?context=CSHelp:Performance-Analytics-Formula-Indicator-Component-Allow-Breakdown'}).appendTo(label);
var alabel = $j('<span />', {text: getMessage('Allow breakdowns')}).appendTo(url);
var aicon = $j('<span />', {text: ''}).addClass('icon-help').attr('style', 'padding-left: 3px').appendTo(url);
var checkboxGroup = $j('<div />', {}).addClass('input-group-checkbox').appendTo(group);
$j('<input />', { type: 'checkbox', id: 'should_breakdown', checked: 'checked'}).addClass('checkbox').appendTo(checkboxGroup);
$j('<label />', { 'for': 'should_breakdown', title: '', text: '' }).addClass('sn-tooltip-basic').addClass('checkbox-label').attr('style', 'margin:4px 0;').appendTo(checkboxGroup);

var labelDivid = $j('<div />', {}).attr('style', labelDivStyle).appendTo(group);
var labelid = $j('<label />', { 'for': '', title: getMessage('Select this check box to get unique identifier for this formula component to use in a method.'), text: '' }).addClass('url').addClass('sn-tooltip-basic').addClass('col-sm-12').addClass('col-md-12').addClass('col-lg-12').attr('style', 'margin:4px; text-align: right;').appendTo(labelDivid);
var alabelid = $j('<span />', {text: getMessage('Use in method')}).appendTo(labelid);
var checkboxGroup = $j('<div />', {}).addClass('input-group-checkbox').appendTo(group);
$j('<input />', { type: 'checkbox', id: 'get_id'}).addClass('checkbox').appendTo(checkboxGroup);
$j('<label />', { 'for': 'get_id', title: '', text: '' }).addClass('sn-tooltip-basic').addClass('checkbox-label').attr('style', 'margin:4px 0;').appendTo(checkboxGroup);

if (window.NOW.isPolarisEnabled === 'true') {
    // override the form
    var actionContainer = $j('.form_action_button_container')[0];
    actionContainer.style = 'display:block';
}
