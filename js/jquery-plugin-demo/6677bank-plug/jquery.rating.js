//rating 
//2011-12-1
(function($) {

	$.fn.rating = function(options) {

		var opts = $.extend({},$.fn.rating.defaults, options);
		return this.each(function() {
			var $this = $(this);
			var _rating_level = $this.find(".rating li");
			var _radios = $this.find("input:radio");
			_rating_level.each(function(i){
				var index = _rating_level.index(this);
				var now = index + 1;
				$(this).click(function(){
					_radios.eq(index).prop("checked",true);
				}).mouseenter(function(){
					_rating_level.removeClass("current").filter(":lt("+now+")").addClass("current");
				}).mouseleave(function(e){
					var index = _radios.filter("input:checked").val();
					if (index) {
						_rating_level.removeClass().filter(":lt("+index+")").addClass("current");
					}else{
						_rating_level.removeClass();
					}
					e.stopPropagation();
				});
			});
			//$this.find(".rating").mouseleave(function() {
			//	var index = $(this).siblings("span.rating_radio").find("input:checked").val();
			//	console.log("leave");
			//	if (index) {
			//		$(this).children().removeClass().filter(":lt("+index+")").addClass("current");
			//	}else{
			//		$(this).children().removeClass();
			//	}
			//})
		});
	};

	//$.fn.qTab.FUNCT = function() {
	//};
	$.fn.rating.defaults = {
		eventType: 'click',
		timeout: 100
	};

	function menuClose(obj) {
	}
})(jQuery);
