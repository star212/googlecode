/*=============================================================================
#     FileName: jquery.listener.js
#         Desc: for long poller with ajax
#       Author: Smeagol
#        Email: star212417@163.com
#     HomePage: http://www.quxing.info
#      Version: 0.0.1
#   LastChange: 2011-12-29 09:15:02
#      History:
=============================================================================*/
(function($) {

	var methods = {
		init: function(options) {
			return this.each(function() {
                var opts = $.extend({},$.fn.listener.defaults, options);
				var $this = $(this);
				$this.data("opts",opts);
				setTimeout(function(){
					var iteration = arguments.callee;
					$.ajax({
						type: "GET",
						url: opts.url,
						async: true, 
						cache: false,
						timeout:20000, /* Timeout in ms */
						success: function(data){ 
							opts.callback.call($this,data); 
							setTimeout(iteration, opts.timeout);
						},
						error: function(XMLHttpRequest, textStatus, errorThrown){
							setTimeout(iteration, opts.timeout);
						}
					});
				}, opts.timeout);
			});
		},
		somefunction: function() {
		}
	};

	$.fn.listener = function(method) {

		// Method calling logic
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || ! method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.listener');
		}

	};
    $.fn.listener.defaults = {
		url: '',
		timeout: 2000,
		callback:function(data){}
	};
})(jQuery);
