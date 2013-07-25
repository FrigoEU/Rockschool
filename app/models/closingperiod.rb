class Closingperiod < ActiveRecord::Base
  attr_accessible :enddate, :startdate
	validate :enddate_must_be_bigger_than_startdate
	validate :should_not_be_inside_another_closingperiod

  def enddate_must_be_bigger_than_startdate
    if startdate >= enddate
      errors.add(:base, "Einddatum moet groter zijn dan startdatum")
    end
  end
  def should_not_be_inside_another_closingperiod
  	@closingperiods = Closingperiod.all
  	@closingperiods.each do 
  		|closingperiod|
  		if ((startdate == closingperiod.startdate )|| (startdate == closingperiod.enddate )|| (startdate > closingperiod.startdate && startdate < closingperiod.enddate)) || ((enddate == closingperiod.startdate) || (enddate == closingperiod.enddate) || (enddate > closingperiod.startdate && enddate < closingperiod.enddate))
  		  errors.add(:base, "Start- of einddatum ligt in een reeds bestaande vakantieperiode.")
  		  return
  		end
  	end
  end
end
