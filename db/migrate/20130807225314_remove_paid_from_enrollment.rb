class RemovePaidFromEnrollment < ActiveRecord::Migration
  def up
    remove_column :enrollments, :paid
  end

  def down
    add_column :enrollments, :paid, :boolean
  end
end
