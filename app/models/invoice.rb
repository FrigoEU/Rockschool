class Invoice < ActiveRecord::Base
  attr_accessible :amount, :due_date, :enrollment_id, :paid
  belongs_to :enrollment
  validates :amount, :due_date, :enrollment_id, :presence => {:message => ' moet ingevuld zijn, Factuur niet opgeslagen'}
end
