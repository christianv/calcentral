class SearchUsersController < ApplicationController

  def search_users
    authorize(current_user, :can_view_as?)
    users_found = User::SearchUsers.new(id: params['id']).search_users
    render json: { users: users_found }.to_json
  end

  def search_users_by_uid
    authorize(current_user, :can_view_as?)
    users_found = User::SearchUsers.new(id: params['id']).search_users_by_uid
    render json: { users: users_found }.to_json
  end

  def search_users_by_sid
    authorize(current_user, :can_view_as?)
    users_found = User::SearchUsers.new(id: params['id']).search_users_by_sid
    render json: { users: users_found }.to_json
  end

end
