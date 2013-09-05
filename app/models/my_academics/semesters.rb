class MyAcademics::Semesters

  include MyAcademics::AcademicsModule

  def merge(data)
    proxy = CampusUserCoursesProxy.new({:user_id => @uid})
    feed = proxy.get_all_campus_courses
    is_past = false
    is_future = true
    semesters = []

    feed.keys.each do |semester_key|
      term_yr = semester_key.split("-")[0]
      term_cd = semester_key.split("-")[1]
      sections = []

      feed[semester_key].each do |course|
        next unless course[:role] == 'Student'
        course_number = course[:course_code]
        next unless course_number.strip.length

        # If we have a transcript unit, it needs to trump the unit.
        units = course[:transcript_unit] ? course[:transcript_unit] : course[:unit]
        title = course[:name]
        if course[:pnp_flag].present?
          grade_option = course[:pnp_flag].upcase == "Y" ? "P/NP" : "Letter"
        else
          Rails.logger.warn "#{self.class.name} - Course #{course[:ccn]} has a empty 'pnp_flag' field: #{course}"
          grade_option = ''
        end
        waitlist_pos = course[:waitlist_pos] if course[:waitlist_pos].present?
        grade = course[:grade] ? course[:grade].strip : nil
        slug = course_to_slug(course[:dept], course[:catid])
        i = 0
        course[:sections].each do |this_section|
          Rails.logger.info "this_section schedules = #{this_section[:schedules]}"
          ccn = this_section[:ccn]
          format = this_section[:instruction_format]
          section = this_section[:section_num]
          section_label = "#{format} #{section}"
          schedules = this_section[:schedules]
          instructors = this_section[:instructors]
          is_primary_section = this_section[:is_primary_section]
          entry = {
            :course_number => course_number,
            :slug => slug,
            :ccn => ccn,
            :title => title,
            :units => units,
            :grade_option => grade_option,
            :section => section,
            :format => format,
            :section_label => section_label,
            :schedules => schedules,
            :instructors => instructors,
            :is_primary_section => is_primary_section,
            :grade => grade
          }
          if waitlist_pos.present?
            entry[:waitlist_pos] = waitlist_pos
            entry[:enroll_limit] = course[:enroll_limit]
          end
          sections << entry
          i += 1
        end
      end

      semester_name = TermCodes.to_english(term_yr, term_cd)
      is_current = Settings.sakai_proxy.current_terms.include?(semester_name)
      if is_current
        is_future = false
      end

      time_bucket = ''
      if is_current
        time_bucket = 'current'
      elsif is_past
        time_bucket = 'past'
      elsif is_future
        time_bucket = 'future'
      end

      semesters << {
        :name => semester_name,
        :slug => TermCodes.to_slug(term_yr, term_cd),
        :time_bucket => time_bucket,
        :sections => sections
      }
      if is_current
        is_past = true # so the next semesters in the loop show up as past
      end
    end

    data[:semesters] = semesters
  end
end
