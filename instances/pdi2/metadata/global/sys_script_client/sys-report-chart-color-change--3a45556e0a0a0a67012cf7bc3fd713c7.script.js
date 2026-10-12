// match the background color of the input control to the
// color choice the user made
function onChange(control, oldValue, newValue) {
  if (newValue == '') {
    control.style.background = "white";
    return;
  }
  
  control.style.background = newValue;
}
