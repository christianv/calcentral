class CarsApi < MyMergedModel
  include ActiveRecordHelper

  def initialize(uid)
    super(uid)
  end

  def init
    # Todo - replace with @uid
    # 21159906
    # 24094654

    @person_attr = CampusData.get_person_attributes(@uid) || {}

    @edw_person_id ||= EdwpersonData.get_cars_id(@person_attr['student_id']) || {}
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
