function tryIt() {
   var options = {};
   options.text = $('message_text').value;
   options.fadeIn = $('fade_in').value;
   options.fadeOut = $('fade_out').value;
   options.closeDelay = $('close_delay').value;
   options.sticky = $('sticky').checked;
   var type = $('image_type').value;
   if (type == 'info' || type == 'warn' || type == 'warning' || type == 'error')
      options.type = type;
   else
      options.image = type;

   var s = "<br/>Sticky: " + options.sticky.toString() + " FadeIn: " + options.fadeIn + " FadeOut: " + options.fadeOut + " Close Delay: " + options.closeDelay;
   options.text += s;
   new NotificationMessage(options);
}
   
