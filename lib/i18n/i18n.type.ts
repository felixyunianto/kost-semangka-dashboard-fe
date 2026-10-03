export type TDictionary = {
  common: {
    overview: string;
    button: {
      edit: string;
      detail: string;
      delete: string;
      reset: string;
      retry: string;
      cancel: string;
      save: string;
    };
    search: string;
    pagination: {
      showing: string;
      page: string;
      previous: string;
      next: string;
    };
    toast: {
      created: string;
      updated: string;
      deleted: string;
      checkedOut: string;
      billCancelled: string;
      billPaidCash: string;
      signedOut: string;
      passwordReset: string;
      error: string;
    };
    occuped: string;
    vacant: string;
  };
  DashboardPage: {
    title: string;
    subtitle: string;
    filter: {
      property: string;
      propertyAll: string;
    };
    cards: {
      properties: string;
      rooms: string;
      occupied: string;
      available: string;
      occupancy: string;
      occupants: string;
      unpaid: string;
      overdue: string;
      pending: string;
      paidThisMonth: string;
    };
    finance: {
      title: string;
      subtitle: string;
      viewReport: string;
      period1m: string;
      period3m: string;
      period6m: string;
      period1y: string;
      gross: string;
      expense: string;
      net: string;
      rental: string;
      other: string;
      empty: string;
    };
    retry: string;
  };
  PropertyPage: {
    title: string;
    subtitle: string;
    buttons: {
      addProperty: string;
    };
    form: {
      addTitle: string;
      addSubtitle: string;
      editTitle: string;
      editSubtitle: string;
      name: string;
      namePlaceholder: string;
      description: string;
      descriptionPlaceholder: string;
      address: string;
      addressPlaceholder: string;
      phone: string;
      phonePlaceholder: string;
      lateFee: string;
      lateFeeHelper: string;
      lateFeeOn: string;
      lateFeeOff: string;
      lateFeeType: string;
      lateFeeFixed: string;
      lateFeePercentage: string;
      lateFeeAmount: string;
      lateFeeGraceDays: string;
      required: string;
      percentageMax: string;
      back: string;
    };
    filter: {
      placeholder: string;
      name: string;
      lateFee: string;
      lateFeeAll: string;
      lateFeeOn: string;
      lateFeeOff: string;
    };
    table: {
      columns: {
        property: string;
        address: string;
        phone: string;
        lateFee: string;
        rooms: string;
        occupied: string;
        available: string;
        actions: string;
      };
      empty: string;
      helperEmpty: string;
      helperNotFound: string;
      deleteTitle: string;
      deleteDescription: string;
      deleteConfirm: string;
    };
  };
  RoomPage: {
    title: string;
    subtitle: string;
    pickTitle: string;
    pickSubtitle: string;
    allProperties: string;
    emptyProperties: string;
    emptyPropertiesHelper: string;
    buttons: {
      addRoom: string;
    };
    form: {
      addTitle: string;
      addSubtitle: string;
      editTitle: string;
      editSubtitle: string;
      name: string;
      namePlaceholder: string;
      description: string;
      descriptionPlaceholder: string;
      price: string;
      pricePlaceholder: string;
      type: string;
      typePlaceholder: string;
      length: string;
      width: string;
      inventories: string;
      inventorySection: string;
      inventoryName: string;
      inventoryNamePlaceholder: string;
      inventoryCondition: string;
      inventoryStatus: string;
      inventoryAdd: string;
      inventoryHelper: string;
      inventoryEmpty: string;
      inventoryGood: string;
      inventoryRepair: string;
      inventorySaveChanges: string;
      required: string;
      invalidNumber: string;
      back: string;
    };
    filter: {
      placeholder: string;
      occupantName: string;
      occupantNamePlaceholder: string;
      name: string;
      status: string;
      statusAll: string;
      available: string;
      occupied: string;
      minPrice: string;
      maxPrice: string;
      minLength: string;
      maxLength: string;
      minWidth: string;
      maxWidth: string;
      inventories: string;
      inventoriesPlaceholder: string;
      inventoryCondition: string;
      inventoryConditionAll: string;
      inventoryStatus: string;
      inventoryStatusAll: string;
      numberPlaceholder: string;
      moreFilters: string;
      lessFilters: string;
    };
    table: {
      columns: {
        room: string;
        type: string;
        size: string;
        price: string;
        occupant: string;
        inventory: string;
        status: string;
        actions: string;
      };
      empty: string;
      helperEmpty: string;
      helperNotFound: string;
      vacant: string;
      deleteTitle: string;
      deleteDescription: string;
      deleteConfirm: string;
      rentStatus: {
        PAID: string;
        UNPAID: string;
        PENDING: string;
        OVERDUE: string;
        NONE: string;
      };
      rentDueOn: string;
      rentOutstandingCount: string;
    };
    inventoryCondition: {
      GOOD: string;
      FAIR: string;
      POOR: string;
    };
    inventoryStatus: {
      FUNCTIONAL: string;
      REPAIRING: string;
    };
  };
  OccupantPage: {
    title: string;
    subtitle: string;
    buttons: {
      addOccupant: string;
    };
    form: {
      addTitle: string;
      addSubtitle: string;
      editTitle: string;
      editSubtitle: string;
      property: string;
      propertyPlaceholder: string;
      room: string;
      roomPlaceholder: string;
      noRooms: string;
      fullName: string;
      fullNamePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      phone: string;
      phonePlaceholder: string;
      checkIn: string;
      checkOut: string;
      required: string;
      invalidEmail: string;
      testEmail: string;
      testEmailSent: string;
      testEmailFailed: string;
      checkOutBeforeCheckIn: string;
      back: string;
    };
    filter: {
      placeholder: string;
      name: string;
      property: string;
      propertyAll: string;
      status: string;
      statusAll: string;
      active: string;
      inactive: string;
      checkInFrom: string;
      checkInTo: string;
    };
    table: {
      columns: {
        occupant: string;
        email: string;
        phone: string;
        property: string;
        room: string;
        checkIn: string;
        checkOut: string;
        status: string;
        actions: string;
      };
      empty: string;
      helperEmpty: string;
      helperNotFound: string;
      deleteTitle: string;
      deleteDescription: string;
      deleteConfirm: string;
      checkout: string;
      checkoutTitle: string;
      checkoutDescription: string;
      checkoutConfirm: string;
    };
    detail: {
      whatsapp: string;
      whatsappMissing: string;
      whatsappMessage: string;
    };
  };
  BillPage: {
    title: string;
    subtitle: string;
    buttons: {
      addManual: string;
      processOverdue: string;
      generateMissing: string;
      sendReminders: string;
    };
    form: {
      addTitle: string;
      addSubtitle: string;
      editTitle: string;
      editSubtitle: string;
      invoice: string;
      occupant: string;
      occupantPlaceholder: string;
      property: string;
      propertyPlaceholder: string;
      room: string;
      type: string;
      status: string;
      amount: string;
      amountPlaceholder: string;
      dueDate: string;
      description: string;
      descriptionPlaceholder: string;
      required: string;
      invalidAmount: string;
      noOccupants: string;
      cannotEdit: string;
      back: string;
    };
    processOverdue: {
      title: string;
      description: string;
      confirm: string;
      success: string;
    };
    generateMissing: {
      title: string;
      description: string;
      confirm: string;
      success: string;
    };
    sendReminders: {
      title: string;
      description: string;
      confirm: string;
      success: string;
    };
    cancel: {
      title: string;
      description: string;
      confirm: string;
    };
    payCash: {
      title: string;
      description: string;
      confirm: string;
    };
    filter: {
      invoiceNumber: string;
      invoicePlaceholder: string;
      occupantName: string;
      occupantPlaceholder: string;
      property: string;
      propertyAll: string;
      status: string;
      statusAll: string;
      type: string;
      typeAll: string;
      dueDateFrom: string;
      dueDateTo: string;
      moreFilters: string;
      lessFilters: string;
    };
    status: {
      UNPAID: string;
      PENDING: string;
      PAID: string;
      OVERDUE: string;
      CANCELLED: string;
    };
    type: {
      RENT: string;
      MANUAL: string;
      BOOKING: string;
    };
    table: {
      columns: {
        invoice: string;
        occupant: string;
        property: string;
        room: string;
        type: string;
        status: string;
        amount: string;
        lateFee: string;
        payable: string;
        dueDate: string;
        period: string;
        actions: string;
      };
      empty: string;
      helperEmpty: string;
      helperNotFound: string;
    };
  };
  FinancePage: {
    income: {
      title: string;
      subtitle: string;
      add: string;
      addTitle: string;
      addSubtitle: string;
      editTitle: string;
      editSubtitle: string;
      back: string;
      empty: string;
      helperEmpty: string;
      deleteTitle: string;
      deleteDescription: string;
    };
    expense: {
      title: string;
      subtitle: string;
      add: string;
      addTitle: string;
      addSubtitle: string;
      editTitle: string;
      editSubtitle: string;
      back: string;
      empty: string;
      helperEmpty: string;
      deleteTitle: string;
      deleteDescription: string;
    };
    category: {
      MAINTENANCE: string;
      SALARY: string;
      OTHER: string;
    };
    form: {
      property: string;
      propertyPlaceholder: string;
      category: string;
      categoryPlaceholder: string;
      amount: string;
      amountPlaceholder: string;
      occurredAt: string;
      description: string;
      descriptionPlaceholder: string;
      notes: string;
      notesPlaceholder: string;
      required: string;
      invalidAmount: string;
      invalidDateRange: string;
    };
    filter: {
      description: string;
      descriptionPlaceholder: string;
      property: string;
      propertyAll: string;
      category: string;
      categoryAll: string;
      occurredFrom: string;
      occurredTo: string;
    };
    table: {
      columns: {
        description: string;
        property: string;
        category: string;
        amount: string;
        occurredAt: string;
        notes: string;
        actions: string;
      };
      helperNotFound: string;
    };
  };
  ReportPage: {
    title: string;
    subtitle: string;
    filter: {
      property: string;
      propertyAll: string;
      from: string;
      to: string;
      invalidDateRange: string;
    };
    cards: {
      rentalIncome: string;
      otherIncome: string;
      totalIncome: string;
      expenses: string;
      net: string;
      entries: string;
    };
    breakdown: {
      otherIncome: string;
      expenses: string;
      category: string;
      count: string;
      amount: string;
      empty: string;
    };
    monthly: {
      title: string;
      month: string;
      income: string;
      expense: string;
      net: string;
      empty: string;
    };
    empty: string;
  };
  PaymentPage: {
    title: string;
    subtitle: string;
    view: string;
    back: string;
    openPayUrl: string;
    filter: {
      invoiceNumber: string;
      invoicePlaceholder: string;
      occupantName: string;
      occupantPlaceholder: string;
      property: string;
      propertyAll: string;
      status: string;
      statusAll: string;
      gateway: string;
      gatewayAll: string;
      paidFrom: string;
      paidTo: string;
      moreFilters: string;
      lessFilters: string;
      invalidDateRange: string;
    };
    status: {
      PENDING: string;
      PAID: string;
      FAILED: string;
      EXPIRED: string;
      CANCELLED: string;
    };
    chargeStatus: {
      PENDING: string;
      PAID: string;
      EXPIRED: string;
      FAILED: string;
      SUPERSEDED: string;
    };
    gateway: {
      MIDTRANS: string;
    };
    table: {
      columns: {
        invoice: string;
        occupant: string;
        property: string;
        room: string;
        gateway: string;
        status: string;
        amount: string;
        paidAt: string;
        expiredAt: string;
        actions: string;
      };
      empty: string;
      helperEmpty: string;
      helperNotFound: string;
    };
    detail: {
      title: string;
      subtitle: string;
      invoice: string;
      occupant: string;
      property: string;
      room: string;
      amount: string;
      status: string;
      gateway: string;
      gatewayReference: string;
      paidAt: string;
      expiredAt: string;
      lastChargedAt: string;
      createdAt: string;
      payUrl: string;
      qrCode: string;
      charges: string;
      chargeReference: string;
      chargeAmount: string;
      chargeStatus: string;
      chargeExpired: string;
      chargeCreated: string;
      chargesEmpty: string;
    };
  };
  SettingPage: {
    title: string;
    subtitle: string;
    password: {
      title: string;
      current: string;
      next: string;
      confirm: string;
      required: string;
      mismatch: string;
      sameAsCurrent: string;
      minLength: string;
      save: string;
      success: string;
    };
    logoutAll: {
      title: string;
      description: string;
      button: string;
      confirm: string;
    };
  };
  ForgotPasswordPage: {
    emailTitle: string;
    emailSubtitle: string;
    otpTitle: string;
    otpSubtitle: string;
    passwordTitle: string;
    passwordSubtitle: string;
    email: string;
    emailPlaceholder: string;
    otp: string;
    otpPlaceholder: string;
    password: string;
    confirmPassword: string;
    required: string;
    invalidEmail: string;
    invalidOtp: string;
    otpFailed: string;
    minLength: string;
    mismatch: string;
    sendCode: string;
    verify: string;
    reset: string;
    resend: string;
    resendIn: string;
    backToSignIn: string;
    changeEmail: string;
  };
};
