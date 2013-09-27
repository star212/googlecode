/*=============================================================================
#     FileName: jquery.rating.js
#         Desc: 评级插件
#       Author: Smeagol
#        Email: star212417@163.com
#     HomePage: http://www.quxing.info
#      Version: 0.0.1
#   LastChange: 2011-12-01 16:10:22
#      History:
=============================================================================*/
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
				}).mouseover(function(){
					_rating_level.removeClass().filter(":lt("+now+")").addClass("current");
				}).mouseout(function(e){
					e.stopPropagation();
				});
			});
			$this.find(".rating").mouseout(function() {
				var index = $(this).siblings("span.rating_radio").find("input:checked").val();
				if (index) {
					$(this).children().removeClass().filter(":lt("+index+")").addClass("current");
				}else{
					$(this).children().removeClass();
				}
			})
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
