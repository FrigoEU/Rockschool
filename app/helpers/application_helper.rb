module ApplicationHelper
	def argumentok?(hash,arg)
		if hash.has_key?(arg)
			if hash[arg].nil?
				false
			else
				true
			end
		else
			false
		end
	end
	def get_current_user()
		if cookies.has_key?(:remember_token) && User.where("remember_token = ?", cookies[:remember_token]).first
	  		@current_user = User.where("remember_token = ?", cookies[:remember_token]).first
	  	else
	  		@current_user = User.new
	  	end
	end
	def make_new_user(email, role, role_id=0)
	  user = User.new({
        email: email,
        password: "rockschool",
        password_confirmation: "rockschool", 
        role: role,
        role_id: role_id
      })
      if params[:mail_student] == true
        #sendgrid mail app
        UserMailer.welcome_email(@user).deliver
      end
      user
	end
end
