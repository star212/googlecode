/*=============================================================================
#     FileName: jquery.mobile.js
#         Desc: for mobile check
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
                var opts = $.extend({},$.fn.mobile.defaults, options);
				var $this = $(this);
				//绑定验证
				$.validator.addMethod("checkCaptcha", function(value) {
				var val = false;
				var self = this;
				$.ajax({
					type:'post',
					url: opts.checkCaptcha,
					data:{'siteUser.tel':value},
					global:false,
					async:false,
					beforeSend: function(){
						self.containers.addClass("loading");
					},
					success:function(data){
						if(data){
							val = true;
						}else{
							val = false; 
						}
						self.containers.removeClass("loading");
					},
					error:function(XMLHttpRequest,textStatus){
						console.log(textStatus);
					}
				});
				return val;
				}, '校验码错误');
				$this.validate({
					rules:{
						'mobile' : {
							required : true,
							mobile: true,
							checkMobile: true
						}
					},
					messages : {
						'mobile': {
							required: "手机号码不能为空",
							mobile: "您输入的手机号码格式不对"
						}
					},
					errorLabelContainer: $("div.container",$this)
				});
				$(opts.captcha).validate({
					rules:{
						'randCode' : {
							required : true,
							number: true,
							checkCaptcha: true
						}
					},
					messages : {
						'randCode': {
							required: "验证码不能为空",
							number: "验证码只能为数字"
						}
					},
					errorLabelContainer: $("div.container",$(opts.captcha))
				});
				//提交事件
				$this.submit(function(){
					if($this.valid()){
						methods.sendMsg(opts.sendmsgUrl,$this);
						$(opts.captcha).show();
						$("input:submit,input:text",$this).prop("disabled",true);
						$(opts.note).show().html(opts.noteMsg.replace("$1",$("input:text",$this).val()));
						$(opts.again).show().find("input:button").timer({
							//每次时回调
							per: function(count) {
								$(this).val(count + "秒后重新发送校验码");
							},
							//结束时回调
							over: function  () {
								$(this).val("重新发送校验码").prop("disabled",false);
							}
						});
					}
					return false;
				})
				$(opts.captcha).submit(function() {
					if($(this).valid()){
						$.ajax({
							type:'post',
							url: opts.checkCaptcha,
							global:false,
							data:$(this).serialize(),
							beforeSend: function(){
							},
							success:function(data){
								if(data){
									location.href= $(this).prop("action");
								}else{
								}
							},
							error:function(XMLHttpRequest,textStatus){
								console.log(textStatus);
							}
						});
					}
					return false;
				})
				//重发事件
				$(opts.again + " input:button").click(function() {
					methods.sendMsg(opts.sendmsgUrl,$this);
					$(this).prop("disabled",true).val("短信已发送");
				})
			});
		},
		sendMsg: function(url,obj) {
			$.ajax({
				type:'post',
				url: url,
				global:false,
				data:obj.serialize(),
				beforeSend: function(){
				},
				success:function(data){
					if(data){
					}else{
					}
				},
				error:function(XMLHttpRequest,textStatus){
					console.log(textStatus);
				}
			});
			
		}
	};

	$.fn.mobile = function(method) {

		// Method calling logic
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || ! method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.mobile');
		}
	};
    $.fn.mobile.defaults = {
		//验证码表单
		captcha: "#captcha_form",
		//短信发送请求地址
		sendmsgUrl: "../data/true.html",
		//提示信息class
		note: ".note",
		//提示信息内容
		noteMsg: "手机用户 <b>$1</b> 我们已向您发送免费校验码短信",
		//验证码校验地址
		checkCaptcha: "../data/true.html",
		//重发组件id
		again: ".again"
	};
})(jQuery);
