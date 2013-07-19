class RemoveNameFromStudents < ActiveRecord::Migration
  def up
    remove_column :students, :name
  end

  def down
    add_column :students, :name, :string
  end
end
