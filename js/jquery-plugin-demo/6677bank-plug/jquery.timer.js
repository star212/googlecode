/*=============================================================================
#     FileName: jquery.timer.js
#         Desc: timer
#       Author: Smeagol
#        Email: star212417@163.com
#     HomePage: http://www.quxing.info
#      Version: 0.0.1
#   LastChange: 2011-12-04 21:35:51
#      History:
=============================================================================*/
(function($) {

	var methods = {
		init: function(options) {
			return this.each(function() {
                var opts = $.extend({},$.fn.timer.defaults, options);
				var $this = $(this);
				setTimeout(function() {
					opts.countdown > 0 ? opts.per.call($this,opts.countdown) : opts.over.call($this);
					opts.countdown -= opts.step;
					if(opts.countdown >= 0) {
						setTimeout(arguments.callee, opts.timeout);
					}
				}, opts.step);
			});

		}
	};

	$.fn.timer = function(method) {

		// Method calling logic
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || ! method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.timer');
		}

	};
    $.fn.timer.defaults = {
		countdown: 60,
		per: function(count){},
		over: function(){},
		timeout: 1000,
		step: 1
	}
})(jQuery);
