// change the background color of the input control to match
// the color chosen by the user for reports
// uses a GlideRecord to go back after the color definition
function onChange(control, oldValue, newValue) {
  if (newValue == '') {
    setChartColors(control, "white");
    return;
  }
  
  var ar = new GlideRecord("sys_report_color");
  ar.addQuery("sys_id", newValue);
  ar.query(); 
  if (!ar.next())
    return;

  setChartColors(control, ar.color);
}

function setChartColors(control, color) {
  var e = gel('sys_readonly.sys_report_chart_color.color_name.display');
  if (e != null)
     e.style.background = color;
  var e = gel('sys_display.sys_report_chart_color.color_name');
  e.style.background = color;
}
