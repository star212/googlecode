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
				var rule ={};
				rule['mobile'] = {};
				rule['mobile']['required'] = true;
				rule['mobile']['mobile'] = true;
				if(opts.done){
					rule['mobile']['checkMobile'] = true;
				}else{
					rule['mobile']['!checkMobile'] = true;
				}
				$this.validate({
					rules: rule,
					messages : {
						'mobile': {
							required: "手机号码不能为空",
							mobile: "您输入的手机号码格式不对"
						}
					},
					errorLabelContainer: $("div.container",$this),
					submitHandler: function(form) {
						$.ajax({
							type:'post',
							url: opts.sendmsgUrl,
							global:false,
							data:$this.serialize(),
							beforeSend: function(){
							},
							success:function(json){
								if(json.return_code = 0){
									$(opts.captcha).show();
									$("input:submit,input:text",$this).prop("readonly",true);
									$(opts.note).show().html(opts.noteMsg.replace("$1",$("input:text",$this).val()));
									$(opts.again).show().find("input:button").timer({
										//每次时回调
										per: function(count) {
											$(this).val(count + "秒后重新发送校验码");
										},
										//结束时回调
										over: function() {
											$(this).val("重新发送校验码").prop("disabled",false);
										}
									});
								}else{
									$(opts.again).show().addClass("warn").html(json.return_msg);
								}
							},
							error:function(XMLHttpRequest,textStatus){
								console.log(textStatus);
							}
						});
					}
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
					errorLabelContainer: $("div.container",$(opts.captcha)),
					submitHandler: function(form) {
						$.ajax({
							type:'post',
							url: $(form).prop("action"),
							global:false,
							data:$this.serialize()+"&"+$(form).serialize(),
							beforeSend: function(){
							},
							success:function(json){
								if(json.result){
									location.href= $(this).prop("action");
								}else{
									alert("验证失败，服务器正忙请稍后再试");
								}
							},
							error:function(XMLHttpRequest,textStatus){
								console.log(textStatus);
							}
						});
					}
				});
				//重发事件
				$(opts.again + " input:button").click(function() {
					methods.sendMsg(opts.sendmsgUrl,$this);
					$(this).prop("disabled",true).val("短信已发送");
				})
			});
		},
		sendMsg: function(url,obj) {
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
		//重发组件id
		again: ".again",
		//用户名已注册检测true或用户名未注册检测false
		done: false
	};
})(jQuery);
