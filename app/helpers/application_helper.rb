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
	
	  def new_remember_token(new_user)
	    logger.debug("saving remember_token")
	      cookies.delete(:remember_token)
	      cookies.permanent[:remember_token] = new_user.remember_token
	  end
end
