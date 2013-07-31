class UsersController < ApplicationController
	include ApplicationHelper
 	# GET /users
  	# GET /users.json
	def index
		if params.has_key?(:email)
			@user = User.where("email = ?", params[:email]).first
			render json: @user.to_json
		else
			head :no_content 
		end
	end
	# PUT /users/1
	# PUT /users/1.json
	def update
		get_current_user
		@user = User.find(params[:id])

		return (render json: {errors: ["Je bent niet geauthoriseerd om dit te doen"]}, status: :unprocessable_entity) unless (@current_user.isAdmin || @current_user.id == @user.id)

	    respond_to do |format|
	      if @user.update_attributes(params[:user])
	      	new_remember_token(@user) if @current_user.isStudent
	        format.json { head :no_content }
	      else
	        format.json { render json: {errors: @user.errors.full_messages}, status: :unprocessable_entity }
	      end
	    end
	end
end
