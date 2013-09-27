;(function($) {
	$.fn.extend({
		"radio":function(options) {
			options = $.extend({
				label:false
			},options);
			$(".radioReal").parent().prepend("<span class='i_radio'></span>");
			return this.each(function() {			
				var $this = $(this);			
				if (!($(".radioReal:checked").length == 0)) {
					$(".radioReal:checked").prev(".i_radio").addClass("radioSelected");
				};
				$(".i_radio").click(function() {
					$(this).addClass("radioSelected")
						.next(".radioReal").click().end()
					.parent().siblings(".radio").children(".i_radio").removeClass("radioSelected");		
				})	
				if (options.label == true) {
					$this.children("label").click(function() {
						var checkboxId = $(this).prev().attr("id");
						$(this).attr("for",checkboxId);
						$(this).prev().click()
							.siblings(".i_radio").addClass("radioSelected")
							.parent().siblings(".radio").children(".i_radio").removeClass("radioSelected");
					})
				}		
			});
		}
	});
})(jQuery);
