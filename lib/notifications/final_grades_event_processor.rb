class FinalGradesEventProcessor < AbstractEventProcessor
  include ActiveRecordHelper

  def accept?(event)
    return false unless super event
    event["topic"] == "Bearfacts:EndOfTermGrades"
  end

  def process_internal(event, timestamp)
    return [] unless event["payload"] && courses = event["payload"]["course"]

    notifications = []
    courses.each do |course|
      next unless (ccn = course["ccn"]) && (course["term"]) && (year = course['term']["year"]) && (term = course['term']["name"])
      notifications += process_course(ccn, year, term, timestamp, event["topic"])
    end
    notifications
  end

  private
    def process_course(ccn, term_yr, term_cd, timestamp, topic)
      students = CampusData.get_enrolled_students(ccn, term_yr, term_cd)

      return [] unless students
      Rails.logger.debug "#{self.class.name} Found students enrolled in #{term_yr}-#{term_cd}-#{ccn}: #{students}"

      notifications = []
      students.each do |student|
        event = {ccn: ccn, year: term_yr, term: term_cd, topic: topic}
        unless is_dupe?(student["ldap_uid"], event , timestamp, "FinalGradesTranslator")
          entry = nil
          use_pooled_connection {
            entry = Notification.new(
              {
                :uid => student["ldap_uid"],
                :data => {
                  :event => event,
                  :timestamp => timestamp
                },
                :translator => "FinalGradesTranslator",
                :occurred_at => timestamp
              })
          }
          notifications.push entry unless entry.blank?
        end
      end
      notifications
    end
end
