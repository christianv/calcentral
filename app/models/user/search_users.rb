module User
  class SearchUsers < AbstractModel

    def initialize(options={})
      @id = options[:id]
    end

    def search_users
      self.class.fetch_from_cache "#{@id}" do
        search_users_by_uid + search_users_by_sid
      end
    end

    def search_users_by_uid
      self.class.fetch_from_cache "uid-#{@id}" do
        CampusOracle::Queries.find_people_by_uid(@id)
      end
    end

    def search_users_by_sid
      self.class.fetch_from_cache "sid-#{@id}" do
        CampusOracle::Queries.find_people_by_student_id(@id)
      end
    end

  end
end
