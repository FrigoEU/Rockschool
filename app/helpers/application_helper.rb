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
		if cookies.has_key?(:remember_token)
	  		@current_user = User.where("remember_token = ?", cookies[:remember_token]).first
	  	else
	  		@current_user = User.new
	  	end
	end
end
