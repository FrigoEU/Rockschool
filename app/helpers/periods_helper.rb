module PeriodsHelper
	def to_boolean(s)
  		!!(s =~ /^(true|t|yes|y|1)$/i)
	end
end
