/**
 Service-now.com

 Description: Limit Numeric scale variables to a maximum value of 1000.  A large maximum value is not user friendly and rendering such content could impact performance.

A typical Numeric scale (or Likert scale) variable has a scale of 1 to 5.
**/ 

var maxScale = current.scale_max;
if (maxScale > 1000) {
    var msg = gs.getMessage('numeric_scale_max_msg');
    current.setAbortAction(true);
    current.scale_max.setError(msg);
}
