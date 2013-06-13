class EdwpersonData < EdwDatabase
  include ActiveRecordHelper

  def self.table_prefix
    puts "prefixxxxx - #{Settings.edwqa.edwqa_prefix}"
    Settings.edwqa.edwqa_prefix || ''
  end

  def self.get_cars_id(person_id)
    result = {}
    use_pooled_connection {
      log_access(connection, connection_handler, name)
      sql = <<-SQL
      select  *
      from    CARSSTG.WK_TCAR_ALIAS_CODE
      where   trim(ALIAS_NME) = #{connection.quote(person_id)}
        and     ALIAS_TYP7 = 'S'
      SQL
      result = connection.select_one(sql)
    }

    if result
      result = result['bus_num']
    end

    puts result

    # if result
    #   result[:reg_status] = {
    #       :code => result["reg_status_cd"],
    #       :summary => self.reg_status_translator.status(result["reg_status_cd"]),
    #       :explanation => self.reg_status_translator.status_explanation(result["reg_status_cd"]),
    #       :needsAction => !self.reg_status_translator.is_registered(result["reg_status_cd"])
    #   }
    #   result[:reg_block] = self.reg_block_translator.translate(result["acad_blk_flag"], result["admin_blk_flag"], result["fin_blk_flag"], result["reg_blk_flag"])
    #   result[:units_enrolled] = result["tot_enroll_unit"]
    #   result[:education_level] = self.educ_level_translator.translate(result["educ_level"])
    #   result[:california_residency] = self.cal_residency_translator.translate(result["cal_residency_flag"])
    #   result['affiliations'] ||= ""
    #   result[:roles] = {
    #       :student => result['affiliations'].include?("STUDENT-TYPE-"),
    #       :faculty => result['affiliations'].include?("EMPLOYEE-TYPE-ACADEMIC"),
    #       :staff => result['affiliations'].include?("EMPLOYEE-TYPE-STAFF")
    #   }
    # end

    result
  end

  def self.get_awards(cars_id)
    result = {}
    use_pooled_connection {
      log_access(connection, connection_handler, name)
      sql = <<-SQL
      select      A.CUST_NUM,
                  A.RCVB_ITEM_NUM as transID,
                  to_char(A.RCVB_ITEM_DT, 'mm/dd/yyyy') as transDate,
                  trim(B.DESC_FLD) as transDesc,
                  trim(A.SUB_ACCT) as transDept,
                  to_char(A.PMT_DUE_DT, 'mm/dd/yyyy') as transDueDate,
                  A.RCVB_ITEM_AMT as transAmount,
                  A.RCVB_ITEM_BAL as transBalance,
                  A.RCVB_ITEM_TYP as transType,
                  trim(A.TRM_CD) as transTermCd,
                  trim(A.TRM_YR) as transTermYr,
                  A.RCVB_ITEM_STA as transStatus
      from        CARSSTG.WK_TCAR_RCVB_ITEM A
      JOIN        CARSSTG.WK_TCAR_AR_INV_HDR B
      ON          A.RCVB_ITEM_NUM = B.RCVB_ITEM_NUM
      AND         A.CUST_NUM = B.CUST_NUM
      where       A.CUST_NUM  IN   (#{connection.quote(cars_id)})
      order by    A.CUST_NUM, A.RCVB_ITEM_DT desc
      SQL
      result = connection.select_all(sql)
    }

    puts result

    # if result
    #   result[:transID] = result["RCVB_ITEM_NUM"]
    # end

    # puts result

    result
  end

  def self.database_alive?
    is_alive = false
    begin
      use_pooled_connection {
        connection.select_one("select 1 from DUAL")
        is_alive = true
      }
    rescue ActiveRecord::StatementInvalid => exception
      Rails.logger.warn("Oracle server is down: #{exception}")
    end
    is_alive
  end

end
