class MyAcademics::PastSemesters

  include MyAcademics::AcademicsModule

  def merge(data)
    semesters = {}
    transcript = CampusData.get_student_transcript @uid
    transcript.each do |course|
      semester_name = TermCodes.to_english course["term_yr"], course["term_cd"]
      semesters[semester_name] ||= {
        :name => semester_name,
        :slug => make_slug(semester_name),
        :courses => []
      }
      course.keys.each do |key|
        course[key] = course[key].strip
      end
      semesters[semester_name][:courses] << course
    end
    data[:past_semesters] = semesters.values
  end

end

