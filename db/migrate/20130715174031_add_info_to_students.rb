class AddInfoToStudents < ActiveRecord::Migration
  def change
    add_column :students, :phone, :string
    add_column :students, :address1, :string
    add_column :students, :address2, :string
    add_column :students, :email, :string
  end
end
