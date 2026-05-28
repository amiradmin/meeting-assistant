import $ from 'jquery';
import 'bootstrap-material-design';

// Initialize on DOM ready
$(document).ready(function() {
  $('body').bootstrapMaterialDesign();

  // Initialize persianumber if available
  if (typeof $.fn.persiaNumber === 'function') {
    $('.persianumber').persiaNumber();
  }
});