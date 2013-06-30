window.onload = function() {
	allTeachers = new Teachers();
	allTeachers.fetch();

	allStudents = new Students();
	allStudents.fetch();

	period = new Period();
	period.fetch({
		data:{'active': true}
	});

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
};
	function pad(num, size) {
		var s = "000000000" + num;
		return s.substr(s.length-size);
}