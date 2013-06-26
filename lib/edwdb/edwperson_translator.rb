class EdwpersonTranslator

  def translateDepartment(deptCode)
    @departments = {
      "OR" => "Registrar",
      "SM" => "Summer Sessions",
      "LK" => "Billing & Payment Services",
      "CO" => "Billing & Payment Services",
      "NT" => "ASUC Auxiliary",
      "YA" => "Housing",
      "CW" => "University Health Services",
      "PB" => "Recreational Sports Facility",
      "Housing" => "Housing & Dining",
      "FN" => "Telecom",
      "RF" => "New Student Services",
      "FA" => "Financial Aid",
      "GD" => "Graduate Division",
      "XT" => "University Extension"
    }
    @departments[deptCode]
    #@departments.select{|key, hash| key == deptCode }
  end

  def translateAmount(amount, type)
    amount = amount.to_f
    if type == 'credit' || type == 'refund'
      amount = amount * -1
    end
    amount
  end

  def translateType(typeCode, transId, transTermYr)
    transType = ''
    if (typeCode == 'C')
      transType = 'credit'
    elsif (typeCode == 'I')
      transType = 'charge'
    elsif (typeCode == 'D')
      if transId[0..1] == 'RF'
        transType = 'refund'
      elsif transId[0..2] == 'SGM'
        transType = 'charge'
      elsif transId[0..1] == 'FA'
        transType = 'chargeback'
      else
        # TODO!
        # What if RCVB_ITEM_NUM == 0000625453 or DM0000574240? What is the transType in this case?
        puts transId
      end
    elsif (typeCode == 'P')
      if transTermYr == '00'
        transType = 'payment'
      else
        transType = 'dispursement'
      end
    end
    if transType == ''
      puts "EDW Person - couldn't translate the following type: typeCode: #{typeCode} - transId: #{transId} - transTermYr: #{transTermYr}"
    end
    transType
  end

  def translateStatus(status)
    transStatus = ''
    if status == 'C' || status == 'R' || status == 'A'
      transStatus = 'closed'
    elsif status == 'O'
      # Todo - look at the aging opt
      transStatus = 'pastDue/current/future'
    else
      puts "EDW Person - unknown transstatus: #{status}"
    end
    transStatus
  end

  def translateTerm(termcd, termyr)

    if termyr == '00'
      return ''
    end

    termcode = ''
    if termcd == 'B'
      termcode = 'Spring'
    elsif termcd == 'C'
      termcode = 'Summer'
    elsif termcd == 'D'
      termcode = 'Fall'
    else
      puts "EDW Person - unknown term code: #{termcd}"
    end

    termyear = ''
    termyr = termyr.to_i

    if (termyr < 10)
      termyear = '200' + termyr.to_s
    else
      termyear = '20' + termyr.to_s
    end

    # TODO - use transDate to calculate Term
    termstring = termcode + ' ' + termyear

    termstring
  end

  def translateTransaction(transaction)
    transType = translateType(transaction["transtype"], transaction["transid"], transaction["transtermyr"])
    response = {
      :transId => transaction["transid"],
      :transDate => transaction["transdate"],
      :transDesc => transaction["transdesc"],
      :transDept => translateDepartment(transaction["transdept"]),
      :transDueDate => transaction["transduedate"],
      :transAmount => translateAmount(transaction["transamount"], transType),
      :transBalance => translateAmount(transaction["transbalance"], transType),
      :transType => transType,
      :transTerm => translateTerm(transaction["transtermcd"], transaction["transtermyr"]),
      :transStatus => translateStatus(transaction["transstatus"])
    }
    response
  end

end

