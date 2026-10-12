
			var internal_type = current.internal_type.toString();
			switch (internal_type) {
				case "reference":
					current.max_length = 32;
					break;
				case "glide_list":
					current.max_length = 4000;
					break;
				case "glide_action_list":
					current.max_length = 4000;
					break;					
				case "journal":
					current.max_length = 4000;
					break;
				case "journal_input":
					current.max_length = 4000;
					break;
				case "journal_list":
					current.max_length = 4000;
					break;
				case "user_roles":
					current.max_length = 255;
					break;
				case "url":
					current.max_length = 1024;
					break;
				case "script":
					current.max_length = 8000;
					break;
				case "script_plain":
					current.max_length = 8000;
					break;
				case "email_script":
					current.max_length = 8000;
					break;
				case "html":
					current.max_length = 8000;
					break;
				case "translated_html":
					current.max_length = 8000;
					break;
				case "decimal":
					current.max_length = 20;
					break;
				case "email":
					current.max_length = 100;
					break;
				case "conditions":
					current.max_length = 4000;
					break;
				default:
					current.max_length = new GlideDefaultObjectLengthResolver().resolve(internal_type);
			}
			
