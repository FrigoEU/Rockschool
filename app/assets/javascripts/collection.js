var CollectionView = Backbone.View.extend({
	initialize: function(){
		this.childViews = [];
		this.collection.on("add", rerender(this));
	},
	events: {
	},
	render: function(){
		this.killChildViews();
		this.collection.each(_.bind(
			function(element, index, list){
				this.renderIndividualModel(element, this.modelViewTemplateSelector);
			}, this));
	},
	renderIndividualModel: function(element, templateSelector){
		var modelView = new window[this.modelView]({
			model: element,
			template: $(templateSelector)
		});
		$(this.el).append(modelView.render().el);
		this.childViews.push(modelView);
	},
	killChildViews: function(){
		if (this.childViews){
			_.each(this.childViews, function(element, index, list){
				element.close();
				list.splice(index,1);
			});
		}
	},
	close: function(){
		this.killChildViews();
		this.remove();
		this.unbind();
		this.collection.off("add");
	}
});