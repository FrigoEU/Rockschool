var ModelView = Backbone.View.extend({
	initialize: function(){
		this.model.on("change", rerender(this));
		this.model.on("destroy", _.bind(this.close, this));
	},
	render: function(){
		this.el.innerHTML = Mustache.render(this.options.template.html(), this.getTemplateHash());
		return this;
	},
	close: function(){
		this.unbind();
		this.remove();
		this.model.off("change");
		this.model.off("destory");
	}
});