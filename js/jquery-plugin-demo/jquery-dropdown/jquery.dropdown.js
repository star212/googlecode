(function($) {

	$.fn.dropdown = function(options) {

		var opts = $.extend({},$.fn.dropdown.defaults, options);
		return this.each(function() {
			var $this = $(this);
			var _menu = $this.find(opts.menuClass);
			if(opts.eventType != "hover") {
				$this.delegate(opts.toggleClass, opts.eventType, function(e) {
					var isActive = _menu.is(":visible");
					menuClose(_menu,opts.openClass);
					!isActive && _menu.show().parent().addClass(opts.openClass);
					return false;
				})
			}else{
				$this.bind("mouseover mouseout",function(e) {
					if(e.type == "mouseover") {
						_menu.show().parent().addClass(opts.openClass);
					}else{
						menuClose(_menu,opts.openClass);
					}
				});
			}
			$('html').bind("click", function() {
				menuClose(_menu,opts.openClass);
			});
		});
	};

	//$.fn.qTab.FUNCT = function() {
	//};
	$.fn.dropdown.defaults = {
		eventType: 'hover',
		toggleClass: '.dropdown_toggle',
		menuClass: '.dropdown_menu',
		openClass: 'open'
	};

	function menuClose(obj,open) {
		obj.hide();
		obj.parent().removeClass(open);
	}
})(jQuery);

