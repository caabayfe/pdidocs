function(controlData) {
    /* Build a message for the custom control that will be recorded in the transcript

        return 'The CustomControl myCustomInputControl just rendered, with controlData: '
            + JSON.stringify(controlData);
   */

  return 'The Language Switch Custom Control was rendered with: '
  + 'Prompt: '
  + controlData.label + ' '
  + controlData.translatedLabel + ' '
  + 'Buttons: '
  + controlData.defaultYes + '|' + controlData.translatedYes + ' '
  + controlData.defaultNo + '|' + controlData.translatedNo;
}
