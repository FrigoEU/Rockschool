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
end
