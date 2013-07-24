class UsersController < ApplicationController
 	# GET /users
  	# GET /users.json
	def index
		
	end
	# PUT /students/1
	# PUT /students/1.json
	def update
		@user = User.find(params[:id])

	    respond_to do |format|
	      if @user.update_attributes(params[:user])
	        format.json { head :no_content }
	      else
	        format.json { render json: {errors: @user.errors.full_messages}, status: :unprocessable_entity }
	      end
	    end
	end
end
