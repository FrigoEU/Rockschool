module PeriodsHelper
	def to_boolean(s)
  		s == true
	end
	def jsdate_to_railsdate(str)
		return Date.strptime(str, '%Y-%m-%d')
	end
end
