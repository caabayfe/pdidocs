// change the background color of the control to what
// the user selected
function onChange(control, oldValue, newValue) {
  if (newValue == '') {
    control.style.background = "white";
    return;
  }
  
  control.style.background = newValue;
}
