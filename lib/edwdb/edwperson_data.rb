class EdwpersonData < EdwDatabase
  include ActiveRecordHelper

  def self.table_prefix
    Settings.edwqa.edwqa_prefix || ''
  end

  def self.edwperson_translator
    @edwperson_translator ||= EdwpersonTranslator.new
  end

  def self.get_cars_id(person_id)
    result = {}
    use_pooled_connection {
      log_access(connection, connection_handler, name)
      # Select the columns instead of doing *
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

    result
  end

  def self.get_activity(cars_id)
    result = {}
    response = {}
    use_pooled_connection {
      log_access(connection, connection_handler, name)
      sql = <<-SQL
select * from
((select
            trim(A.RCVB_ITEM_NUM) as transId,
            to_char(A.RCVB_ITEM_DT, 'mm/dd/yyyy') as transDate,
            trim(B.DESC_FLD) as transDesc,
            trim(A.SUB_ACCT) as transDept,
            to_char(A.PMT_DUE_DT, 'mm/dd/yyyy') as transDueDate,
            A.RCVB_ITEM_AMT as transAmount,
            A.RCVB_ITEM_BAL as transBalance,
            A.RCVB_ITEM_TYP as transType,
            trim(A.TRM_CD) as transTermCd,
            trim(A.TRM_YR) as transTermYr,
            A.RCVB_ITEM_STA as transStatus,
            '' as agingOpt
from        CARSSTG.WK_TCAR_RCVB_ITEM A
JOIN        CARSSTG.WK_TCAR_AR_INV_HDR B
ON          A.RCVB_ITEM_NUM = B.RCVB_ITEM_NUM
AND         A.CUST_NUM = B.CUST_NUM
where       A.CUST_NUM  IN   (#{connection.quote(cars_id)}))

UNION ALL

(select     C.LKBX_NUM as transId,
            to_char(A.RCVB_ITEM_DT, 'mm/dd/yyyy') as transDate,
            trim(C.DESC_FLD) as transDesc,
            trim(A.SUB_ACCT) as transDept,
            to_char(A.PMT_DUE_DT, 'mm/dd/yyyy') as transDueDate,
            A.RCVB_ITEM_AMT as transAmount,
            A.RCVB_ITEM_BAL as transBalance,
            A.RCVB_ITEM_TYP as transType,
            trim(A.TRM_CD) as transTermCd,
            trim(A.TRM_YR) as transTermYr,
            A.RCVB_ITEM_STA as transStatus,
            A.AGING_OPT as agingOpt
from        CARSSTG.WK_TCAR_RCVB_ITEM A
JOIN        CARSSTG.WK_TCAR_LOCKBOX C
ON          A.LKBX_NUM = C.LKBX_NUM
where       A.CUST_NUM  IN   (#{connection.quote(cars_id)})))
      SQL
      result = connection.select_all(sql)
    }

    if result
      response = result.map { |item|
        item = self.edwperson_translator.translateTransaction(item)
      }
    end

    response
  end

  def self.get_summary(cars_id)
    result = {}
    use_pooled_connection {
      log_access(connection, connection_handler, name)
      sql = <<-SQL

select  a.lastStatementBalance,
        a.lastStatementDate,
        a.minimumAmountDueDate,
        b.totalPastDueAmount,
        c.futureActivity,
        d.totalCurrentBalance,
        e.unbilledActivity,
        f.minimumAmountDue from
(select LAST_STMT_AMT1 as lastStatementBalance,
       to_char(LAST_STMT_DT1, 'mm/dd/yyyy') as lastStatementDate,
       to_char(NEXT_STMT_DT, 'mm/dd/yyyy') as minimumAmountDueDate,
       CUST_NUM
from CARSSTG.WK_TCAR_CUST
where CUST_NUM = #{connection.quote(cars_id)}) a

LEFT OUTER JOIN

(select  sum(RCVB_ITEM_BAL) as totalPastDueAmount,
        CUST_NUM
from    CARSSTG.WK_TCAR_RCVB_ITEM
where   trim(RCVB_ITEM_STA) = 'O'
and     trim(AGING_OPT) in ('1','2','3','4','5','6','7' )
and     CUST_NUM = #{connection.quote(cars_id)}
group by CUST_NUM) b

ON a.CUST_NUM = b.CUST_NUM

LEFT OUTER JOIN

(select  sum(RCVB_ITEM_BAL) as futureActivity,
        CUST_NUM
from    CARSSTG.WK_TCAR_RCVB_ITEM
where   trim(RCVB_ITEM_STA) = 'O'
and     AGING_OPT = 'F'
and     CUST_NUM = #{connection.quote(cars_id)}
group by CUST_NUM) c

ON a.CUST_NUM = c.CUST_NUM

LEFT OUTER JOIN

(select  sum(RCVB_ITEM_BAL) as totalCurrentBalance,
        CUST_NUM
from    CARSSTG.WK_TCAR_RCVB_ITEM
where   trim(RCVB_ITEM_STA) = 'O'
AND     CUST_NUM = #{connection.quote(cars_id)}
group by CUST_NUM) d

ON a.CUST_NUM = d.CUST_NUM

LEFT OUTER JOIN

(select  sum(I.RCVB_ITEM_BAL) as unbilledActivity,
        I.CUST_NUM
from    CARSSTG.WK_TCAR_RCVB_ITEM I
join    CARSSTG.WK_TCAR_CUST C
on      I.CUST_NUM = C.CUST_NUM
where   trim(I.RCVB_ITEM_STA) = 'O'
and     I.RCVB_ITEM_DT > C.LAST_STMT_DT1
and     I.CUST_NUM = #{connection.quote(cars_id)}
group by I.CUST_NUM) e

ON a.CUST_NUM = e.CUST_NUM

LEFT OUTER JOIN

(select  sum(RCVB_ITEM_BAL) as minimumAmountDue,
        CUST_NUM
from    CARSSTG.WK_TCAR_RCVB_ITEM
where   trim(RCVB_ITEM_STA) = 'O'
and     trim(AGING_OPT) in ('C','1','2','3','4','5','6','7' )
and     CUST_NUM = #{connection.quote(cars_id)}
group by CUST_NUM) f

ON a.CUST_NUM = f.CUST_NUM
      SQL
      result = connection.select_one(sql)
    }

    if result
      response = {
        # Check if null in utility function
        :lastStatementBalance => result['laststatementbalance'].to_f,
        :lastStatementDate => result['laststatementdate'],
        :unbilledActivity =>  result['unbilledactivity'].to_f,
        :totalCurrentBalance => result['totalcurrentbalance'].to_f,
        :futureActivity =>  result['futureactivity'].to_f,
        :minimumAmountDue => result['minimumamountdue'].to_f,
        :minimumAmountDueDate => result['minimumamountduedate'],
        :totalPastDueAmount => result['totalpastdueamount'].to_f
      }
    end

    response
  end

  # Move up to parent class
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
