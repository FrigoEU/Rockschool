main = function() {
	allTeachers = new Teachers();
	allTeachers.fetch();

	allStudents = new Students();
	allStudents.fetch({
		success: function(collection, response, options) {
			if (allStudents.length == 1) {
				current_student = allStudents.at(0);
			}
		},
		error: function(collection, response, options){
				standardHTTPErrorHandling(collection, response, options);
		}
	});
	allClosingPeriods = new ClosingPeriods();
	allClosingPeriods.fetch({
		success: function(collection, response, options){
			;
		},
		error: function(collection, response, options){
			standardHTTPErrorHandling(collection, response, options);
		}
	});

	period = new Period();
	period.fetch({
		data:{'active': true}
	});

	$('#sidebar,#middle').mCustomScrollbar();
	$( "nav" ).buttonset();
	$("nav #teachers").on("click", function (event){
		moderator.showMainScreenTeacherIndex();
	});
	$("nav #students").on("click", function (event) {
		moderator.showMainScreenStudentIndex();
	});
	$("nav #options").on("click", function (event) {
		moderator.setMainScreenOptions();
	});
	$("nav #login").on("click", function (event) {
		moderator.setMainScreenLogin();
	});
	$("nav #logout").on("click", function (event) {
		logout();
	});
	$("nav #signup").on("click", function (event) {
		moderator.setMainScreenEditStudent();
	});
	$.fn.outside = function(ename, cb){
		return this.each(function(){
				var $this = $(this),
				self = this;
				$(document).bind(ename, function tempo(e){
					if(e.target !== self){
							cb.apply(self, [e]);
							if(!self.parentNode) $(document).unbind(ename, tempo);
					}
				});
			});
	};
	$.fn.valplace = function(){
		var val = this.val();
		var placeholder = this.attr("placeholder");
		if (val){
			return val;
		}
		else if (placeholder) {
			return placeholder;
		}
			else return val;
	}
	
};
function pad(num, size) {
	var s = "000000000" + num;
	return s.substr(s.length-size);
}
if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.toLowerCase().slice(0, str.length) == str.toLowerCase();
  };
}
Date.prototype.stdTimezoneOffset = function() {
    var jan = new Date(this.getFullYear(), 0, 1);
    var jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
};

Date.prototype.dst = function() {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
};
var rerender = function(context){
	return function(){
		context.render();
	};
};