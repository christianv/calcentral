class CarsApi < MyMergedModel
  include ActiveRecordHelper

  def initialize(uid)
    super(uid)
  end

  def init
    # Todo - replace with @uid
    @edw_person_id ||= EdwpersonData.get_cars_id('24094654') || {}
    @edw_awards ||= EdwpersonData.get_awards(@edw_person_id) || {}
  end

  def get_feed_internal
    {
      :edw => {
        :person_id => @edw_person_id,
        :awards => @edw_awards
      },
      :uid => @uid
    }
  end

end
