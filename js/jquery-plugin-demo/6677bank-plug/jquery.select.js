;(function($) {
	$.fn.extend({
		"select":function(options) {
			var options = $.extend({},options);
			return this.each(function() {
				var $this = $(this);
				var $options = $this.children("ul");         
				$options.hide();
				if($this.children("span").text() == "请选择") {
					$this.children("input:hidden").val("");
				}
				$this.mouseover(function() {
					$this.children("span").css({"border-color":"#5735b7","background-position":"right -34px"});
				});			
				$this.mouseout(function() {
					if ($options.is(":hidden")) {
						$this.children("span").css({"border-color":"#b29ffb","background-position":"right 0"});
					}				
				});			
				$this.children("span").click(function() {
					$options.toggle();
					return false;
				});
				$options.find("a").click(function() {
					var text = $(this).text();
					var value = $(this).attr("myvalue");
					$this.children("span").text(text);
					$this.children("input:hidden").val(value);
					$options.hide();					
				})
				$("html").click(function(){
					$options.hide();
					$this.children("span").css({"border-color":"#b29ffb","background-position":"right 0"});
				});
			});
		}
	});
})(jQuery);
