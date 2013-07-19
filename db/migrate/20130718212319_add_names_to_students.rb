class AddNamesToStudents < ActiveRecord::Migration
  def change
    add_column :students, :firstname, :string
    add_column :students, :lastname, :string
  end
end
