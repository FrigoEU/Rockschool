class AddRolesToUsers < ActiveRecord::Migration
  def change
    add_column :users, :role, :string
    add_column :users, :role_id, :integer
  end
end
