class AddApprovedToEnrollments < ActiveRecord::Migration
  def change
    add_column :enrollments, :approved, :boolean
  end
end
