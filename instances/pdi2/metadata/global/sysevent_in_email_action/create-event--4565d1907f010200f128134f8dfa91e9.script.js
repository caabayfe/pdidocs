current.source = 'email';
current.event_class = 'email';
current.description = email.body_text;
current.time_of_event = new GlideDateTime();
current.insert();
