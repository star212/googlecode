;(function($) {
	$.fn.extend({
		"checkbox":function(options) {
			options = $.extend({
				label:false,
				callback: function(){}
			},options);
			this.prepend("<span class='i_chk'></span>");
			return this.each(function() {
				var $this = $(this);			
				if (!($(".checkboxReal:checked").length == 0)) {
					$(".checkboxReal:checked").prev(".i_chk").addClass("chkSelected");
				};
				$(".i_chk",$this).click(function(e) {					
						$(this).toggleClass("chkSelected").next(".checkboxReal").click();
						options.callback.call($(".checkboxReal",$this),e);
				})
				if (options.label == true) {
					$this.children("label").click(function(){
						var checkboxId = $(this).prev().attr("id");
						$(this).attr("for",checkboxId);
						if ($(this).prev().is(":checked")) {
							$this.children(".i_chk").removeClass("chkSelected");
						} else {
							$this.children(".i_chk").addClass("chkSelected");						
						}
					})
				}			
			});
		}
	});
})(jQuery);
