class Period < ActiveRecord::Base
  attr_accessible :closinghours, :closingminutes, :enddate, :open_for_registration, :open_on_friday, :open_on_monday, :open_on_saturday, :open_on_sunday, :open_on_thursday, :open_on_tuesday, :open_on_wednesday, :openinghours, :openingminutes, :startdate, :active
  validates :open_on_monday, :open_on_tuesday, :open_on_wednesday, :open_on_thursday, :open_on_friday, :open_on_saturday, :open_on_sunday, inclusion: { in: [true, false], message: "Open/gesloten niet ingevuld voor bepaalde weekdag." }
  validates :openinghours, :closinghours, inclusion: { in: 1..23, message: "Open- of sluitingsuur niet correct ingevuld." }
  validates :openingminutes, :closingminutes, inclusion: { in: 0..23, message: "Open- of sluitingsminuten niet correct ingevuld." }
end
