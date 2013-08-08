class InvoicesController < ApplicationController
	def index
		get_current_user
    	return (render json: {errors: ["Je bent niet geauthoriseerd om dit te doen"]}, status: :unprocessable_entity) unless @current_user.isAdmin

		if params.has_key?(:enrollment_id)
			@invoices = Invoice.where("enrollment_id = ?", params[:enrollment_id])
		end
		render json: @invoices
	end
	def create
		get_current_user
    	return (render json: {errors: ["Je bent niet geauthoriseerd om dit te doen"]}, status: :unprocessable_entity) unless @current_user.isAdmin

    	@invoice = Invoice.new(params[:invoice])
    	if @invoice.save
    		render json: @invoice, status: :created, location: @invoice
    	else
    		render json: {errors: @invoice.errors.full_messages}, status: :unprocessable_entity 
    	end
	end
	def destroy
		get_current_user
	    return (render json: {errors: ["Je bent niet geauthoriseerd om dit te doen"]}, status: :unprocessable_entity) unless @current_user.isAdmin

	    @invoice = Invoice.find(params[:id])
	    @invoice.destroy
		head :no_content 
	end
	def update
		get_current_user

		return (render json: {errors: ["Je bent niet geauthoriseerd om dit te doen"]}, status: :unprocessable_entity) unless @current_user.isAdmin

		@invoice = Invoice.find(params[:id])
	    if @invoice.update_attributes(params[:invoice])
	        head :no_content 
	    else
	        render json: {errors: @invoice.errors.full_messages}, status: :unprocessable_entity 
	    end
	end
end
