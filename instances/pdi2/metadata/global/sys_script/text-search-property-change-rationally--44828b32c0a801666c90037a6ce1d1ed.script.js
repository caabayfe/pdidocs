if (current.name == 'glide.ts.query.parallelism')
  if (current.value < 1 || current.value > 10) {
    current.setAbortAction(true);
    gs.addErrorMessage(createErrorMessage(1, 10));
  }

if (current.name == 'glide.ts.max_duration')
  if (current.value < 10 || current.value > 600) {
    current.setAbortAction(true);
    gs.addErrorMessage(createErrorMessage(10, 600));
  }

if (current.name == 'glide.ts.index.parallelism')
  if (current.value < 1 || current.value > 16) {
    current.setAbortAction(true);
    gs.addErrorMessage(createErrorMessage(1, 16));
  }

if (current.name == 'glide.ts.optimize.threshold')
  if (current.value < 20 || current.value > 90) {
    current.setAbortAction(true);
    gs.addErrorMessage(createErrorMessage(20, 90));
  }

if (current.name == 'glide.ts.optimize.parallelism')
  if (current.value < 1 || current.value > 16) {
    current.setAbortAction(true);
    gs.addErrorMessage(createErrorMessage(1, 16));
  }

function createErrorMessage(min, max) {
  var msgArray = new Array();
  msgArray.push(current.name + "");
  msgArray.push(current.description + "");
  msgArray.push(current.value + "");
  msgArray.push(min + "");
  msgArray.push(max + "");
  var msg = gs.getMessage('Property update aborted</br>{0}:  <i>{1}</i></br>The number <b>{3}</b> does not fall within the accepted range.', msgArray);

  return msg;
}
