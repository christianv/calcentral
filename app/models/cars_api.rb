class CarsApi < MyMergedModel
  include ActiveRecordHelper

  def initialize(uid)
    super(uid)
  end

  def init
    # Todo - replace with @uid
    # 21159906
    # 24094654
    @edw_person_id ||= EdwpersonData.get_cars_id('21159906') || {}
    @edw_activity ||= EdwpersonData.get_activity(@edw_person_id) || {}
    @edw_summary ||= EdwpersonData.get_summary(@edw_person_id) || {}
  end

  def get_feed_internal
    {
      :edw => {
        :person_id => @edw_person_id,
        :summary => @edw_summary,
        :activity => @edw_activity
      },
      :uid => @uid
    }
  end

end
