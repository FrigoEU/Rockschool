var DropDownView = Backbone.View.extend({
	initialize: function () {
	},
	tagName: "div",
	id: "dropDown",
	events: {

	},
	render: function() {
		var old = $("#dropDown");
		if (old.length) {
			old.remove();
		}
		$("body").append("<div id='dropDown'> </div>");
		this.setElement("#dropDown");
		this.$el.html(this.renderInnerHTML());
		this.$el.children('.menu').menu();
		this.$el.css({position: 'absolute',
						zIndex:   5000,
						top: this.options.posY,
						left: this.options.posX
					});

		this.$el.outside('click', function(e){
			if ($(this).offset().left != e.pageX || $(this).offset().top != e.pageY) {
				$(this).remove();
			}
		});
	},
	renderInnerHTML: function(){
		return "";
	}
});
