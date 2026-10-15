(function executeRule(current, previous) {
  if (current.status.nil()) current.status = 'open';
})(current, previous);
