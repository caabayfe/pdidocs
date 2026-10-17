var gdt = new GlideDateTime();

current.expires_in_days = GlideDateTime.subtract(gdt, current.getElement("expires").getGlideObject()).getRoundedDayPart();
