function onLoad() {
  // if met_commitment field is on the form, this is easy
  if (g_form.getValue("met_commitment") == "false") {
    colorFields("tomato");
    return;
  } else if (g_form.getValue("met_commitment") == "true") {
    colorFields("lightgreen");
    return;
  }

  // otherwise need to compare allowed downtime with actual downtime
  var allowed = gel("sys_original.service_availability.allowed_downtime");
  var actual = gel("sys_original.service_availability.scheduled_downtime");
  if (allowed && actual) {
    var compare = getSeconds(allowed) - getSeconds(actual);
    if (compare < 0)
      colorFields("tomato");
    else
      colorFields("lightgreen");
  }
}

function getSeconds(e) {
  var days = 0;
  var hours = 0;
  var minutes = 0;
  var seconds = 0;
  var dur = e.value.split(" ");
  if (dur.length == 2) // there are days
     days = dur[0] * 1;
  var time = dur[dur.length - 1];
  time = time.split(":");
  hours = time[0] * 1;
  minutes = time[1] * 1;
  seconds = time[2] * 1;
  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}

function colorFields(color) {
  var e = gel("label.service_availability.scheduled_availability");
  if (e)
    e.style.backgroundColor = color;
  e = gel("label.service_availability.scheduled_downtime");
  if (e)
    e.style.backgroundColor = color;
}
