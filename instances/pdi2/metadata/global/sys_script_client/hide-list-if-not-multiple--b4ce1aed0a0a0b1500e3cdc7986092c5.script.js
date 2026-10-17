function onChange(control, oldValue, newValue, isLoading) {
   var rl = $('fx_price_wrapper');
   if (!rl)
      return;

   if (newValue == 'multi')
      rl.style.display = 'block';
   else
      rl.style.display = 'none';
}
