class UsersController < ApplicationController
 	# GET /users
  	# GET /users.json
	def index
		logger.debug(params)
		if params.has_key?(:email) && params.has_key?(:password)
			@user = User.where("email = ?",params[:email]).first

			respond_to do |format|
				if @user
					if @user && @user.authenticate(params[:password])
						cookies.permanent[:remember_token] = @user.remember_token
						format.json { render json: @user, status: :created, location: @user }
					else
						format.json { render json: @user.errors}
					end
				else
					format.json { render json: {:errors => ['Login of paswoord niet correct: ' + params[:email]] }, status: :unprocessable_entity}
				end
			end
		else
			respond_to do |format|
				format.json { render json: {:errors => ['Login of paswoord niet correct'] }, status: :unprocessable_entity}
			end
		end
	end
end
