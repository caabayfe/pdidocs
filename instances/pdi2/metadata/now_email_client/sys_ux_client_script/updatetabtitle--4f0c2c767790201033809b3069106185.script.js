function script({api, event}) {  
  const subject = api.data.get_subject_value.result["subject"];
  api.emit('SCREEN_STATUS_CHANGED', {title: subject.displayValue});
}
