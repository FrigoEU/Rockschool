class Period < ActiveRecord::Base
  attr_accessible :closinghours, :closingminutes, :enddate, :open_for_registration, :open_on_friday, :open_on_monday, :open_on_saturday, :open_on_sunday, :open_on_thursday, :open_on_tuesday, :open_on_wednesday, :openinghours, :openingminutes, :startdate
end
