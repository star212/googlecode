$(document).ready(function(){
	//var ok = true;
	//var _value = $("#shouyi label");
	$("#tabs").tabs();
	//_value.click(function() {
	//	$("#shouyi dl").toggle();
	//});
	//$("#shouyi dd").click(function() {
	//	_value.html($(this).text());
	//	$("#shouyi dl").toggle();
	//});
	$("form").submit(function() {
		console.log(a.value.text());
		console.log(b.value.text());
		return false;
	});
	function dropdown(id){
		var self = this;
		self.value = $(id + " label");
		$(id + " label").click(function() {
			$(id + " dl").toggle();
		});
		$(id + " dd").click(function() {
			self.value.html($(this).text());
			$(id + " dl").toggle();
		});
	}
	dropdown.prototype.say =
	function(i) {
		alert(this.value.text());
	};
	var a = new dropdown("#shouyi");
	alert(a.value.text());
	var b = new dropdown("#period");
});
