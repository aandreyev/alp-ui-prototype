interface LinkProp {
  title: string;
  icon: string;
  variant: 'default' | 'ghost';
  routerName: string;
  permission?: string;
  modalName?: string;
}

interface LinkGroup {
  group: string;
  isExpanded?: boolean;
  links: LinkProp[];
}

export const allUserLinks: LinkGroup[] = [
  {
    group: "General",
    isExpanded: true,
    links: [
      {
        title: "Dashboard",
        icon: "lucide:inbox",
        variant: "default",
        routerName: "Dashboard"
      },
      {
        title: "Emails",
        icon: "lucide:mail",
        variant: "ghost",
        routerName: "Emails",
        permission: "Core.View"
      },
      {
        title: "Calendar",
        icon: "lucide:calendar",
        variant: "ghost",
        routerName: "Calendar",
        permission: "Core.View"
      }
    ]
  },
  {
    group: "CRM",
    isExpanded: true,
    links: [
      {
        title: "Contacts",
        icon: "lucide:contact",
        variant: "ghost",
        routerName: "Contacts",
        permission: "Contact.View",
        modalName: "CreateContact"
      },
      {
        title: "Organisations",
        icon: "lucide:building-2",
        variant: "ghost",
        routerName: "Organisations",
        permission: "Organisation.View",
        modalName: "CreateOrganisation"
      },
      {
        title: "Clients",
        icon: "lucide:book-user",
        variant: "ghost",
        routerName: "Clients",
        permission: "Client.View",
        modalName: "CreateClient"
      }
    ]
  },
  {
    group: "Matters",
    isExpanded: true,
    links: [
      {
        title: "Matters",
        icon: "lucide:scale",
        variant: "ghost",
        routerName: "Matters",
        permission: "Matter.View",
        modalName: "CreateMatter"
      },
      {
        title: "Matters Report",
        icon: "lucide:file-text",
        variant: "ghost",
        routerName: "Matters Report",
        permission: "Matter.View"
      },
      {
        title: "Offerings",
        icon: "lucide:book-open-text",
        variant: "ghost",
        routerName: "Offerings Public",
        permission: "Matter.View"
      }
    ]
  },
  {
    group: "Projects",
    isExpanded: true,
    links: [
      {
        title: "Projects",
        icon: "lucide:kanban",
        variant: "ghost",
        routerName: "Projects",
        permission: "Project.View",
        modalName: "CreateProject"
      },
      {
        title: "Routines",
        icon: "lucide:repeat",
        variant: "ghost",
        routerName: "Project Routines",
        permission: "Project.View"
      },
      {
        title: "Project Tasks",
        icon: "lucide:check-square",
        variant: "ghost",
        routerName: "Project TasksList",
        permission: "Project.View"
      },
      {
        title: "To Do",
        icon: "lucide:list-todo",
        variant: "ghost",
        routerName: "Todo",
        permission: "Project.View"
      }
    ]
  },
  {
    group: "Time & Invoices",
    isExpanded: true,
    links: [
      {
        title: "Time Entries",
        icon: "lucide:clock",
        variant: "ghost",
        routerName: "Time Entry Table",
        modalName: "CreateTimeEntry",
        permission: "Matter.View"
      },
      {
        title: "Invoices",
        icon: "lucide:receipt-text",
        variant: "ghost",
        routerName: "Invoices",
        modalName: "CreateInvoice",
        permission: "Matter.View"
      },
      {
        title: "Waiting Approvals",
        icon: "lucide:check-circle",
        variant: "ghost",
        routerName: "Invoice Approvals",
        permission: "Invoice.Approve"
      },
      {
        title: "Ready to Send",
        icon: "lucide:send",
        variant: "ghost",
        routerName: "Invoices Ready",
        permission: "Invoice.Send"
      }
    ]
  },
  {
    group: "Registers",
    isExpanded: false,
    links: [
      {
        title: "Mail Register",
        icon: "lucide:mailbox",
        variant: "ghost",
        routerName: "Incoming Mails",
        permission: "MailRegister.View"
      },
      {
        title: "Risk Register",
        icon: "lucide:alert-triangle",
        variant: "ghost",
        routerName: "Risk Registers",
        permission: "Risk.View"
      },
      {
        title: "Incident Log",
        icon: "lucide:message-square",
        variant: "ghost",
        routerName: "Incident Logs",
        permission: "IncidentLog.View"
      },
      {
        title: "PPSR Register",
        icon: "lucide:shield-check",
        variant: "ghost",
        routerName: "PPSR Registers",
        permission: "PPSRRegister.View"
      },
      
    ]
  },
  {
    group: "Contracts",
    isExpanded: false,
    links: [
      {
        title: "Contracts",
        icon: "lucide:signature",
        variant: "ghost",
        routerName: "Contracts",
        permission: "Contract.View"
      }
    ]
  },
  {
    group: "Reports",
    isExpanded: true,
    links: [
      {
        title: "Metabase Reports",
        icon: "lucide:trending-up",
        variant: "ghost",
        routerName: "Metabase Public Reports",
        permission: "Metabase.View"
      }
    ]
  },

  {
    group: "Syntaq",
    isExpanded: false,
    links: [
      {
        title: "Syntaq Forms",
        icon: "lucide:file-text",
        variant: "ghost",
        routerName: "Syntaq Forms",
        permission: "Matter.View"
      },
      {
        title: "Syntaq Records",
        icon: "lucide:archive",
        variant: "ghost",
        routerName: "Syntaq Records",
        permission: "Matter.View"
      }
    ]
  },
  {
    group: "Support",
    isExpanded: false,
    links: [
      {
        title: "Support Tickets",
        icon: "lucide:bot",
        variant: "ghost",
        routerName: "Support Tickets",
        modalName: "CreateSupportTicket",
        permission: "SupportTicket.View"
      },
      {
        title: "Wiki",
        icon: "lucide:book-marked",
        variant: "ghost",
        routerName: "Wiki Pages",
        permission: "Core.View"
      }
    ]
  },
  {
    group: "Admin",
    isExpanded: true,
    links: [
      {
        title: "Admin Settings",
        icon: "lucide:layout-dashboard",
        variant: "ghost",
        routerName: "Admin Dashboard"
      }
    ]
  }
];

// All Admin Links

export const allAdminLinks: LinkGroup[] = [
  {
    group: "Admin - Accounts",
    isExpanded: true,
    links: [
      {
        title: "Admin Dashboard",
        icon: "lucide:layout-dashboard",
        variant: "default",
        routerName: "Admin Dashboard"
      },
      {
        title: "Roles",
        icon: "lucide:user-cog",
        variant: "default",
        routerName: "Roles",
        permission: "Roles.View"
      },
      {
        title: "Users",
        icon: "lucide:user-cog",
        variant: "default",
        routerName: "Users",
        permission: "Users.View"
      },
      {
        title: "Remunerations",
        icon: "lucide:user-cog",
        variant: "default",
        routerName: "Remunerations",
        permission: "Remunerations.View"
      }
    ]
  },
  {
    group: "Admin - Projects",
    isExpanded: true,
    links: [
      {
        title: "Sprints",
        icon: "lucide:list",
        variant: "default",
        routerName: "Sprints",
        permission: "CommonType.View"
      },
      {
        title: "Standard Tasks",
        icon: "lucide:list",
        variant: "default",
        routerName: "Standard Tasks",
        permission: "CommonType.View"
      },
      {
        title: "Project Templates",
        icon: "lucide:list",
        variant: "default",
        routerName: "Project Templates",
        permission: "CommonType.View"
      }
    ]
  },
  {
    group: "Admin - Resources",
    isExpanded: false,
    links: [
      {
        title: "Email Templates",
        icon: "lucide:folder-open",
        variant: "default",
        routerName: "Email Templates",
        permission: "CommonType.View"
      },
      {
        title: "Resource Documents",
        icon: "lucide:folder-open",
        variant: "default",
        routerName: "Resource Documents",
        permission: "ResourceDocument.Edit"
      },
      {
        title: "Resource Urls",
        icon: "lucide:folder-open",
        variant: "default",
        routerName: "Resource Urls",
        permission: "CommonType.View"
      },
      {
        title: "Metabase Report Groups",
        icon: "lucide:folder-open",
        variant: "default",
        routerName: "Metabase Report Groups",
        permission: "Metabase.Edit"
      },
      {
        title: "Metabase Reports",
        icon: "lucide:trending-up",
        variant: "default",
        routerName: "Metabase Reports",
        permission: "Metabase.Edit"
      }
    ]
  },
  {
    group: "Admin - Metadata",
    isExpanded: false,
    links: [
      {
        title: "Dynamic Parameters",
        icon: "lucide:tags",
        variant: "default",
        routerName: "Dynamic Parameters",
        permission: "DynamicParameter.Edit"
      },
      {
        title: "Entity Parameters",
        icon: "lucide:tags",
        variant: "default",
        routerName: "Entity Parameters",
        permission: "DynamicParameter.Edit"
      }
    ]
  },
  {
    group: "Admin - Offerings",
    isExpanded: false,
    links: [
      {
        title: "Offering Categories",
        icon: "lucide:book-open-text",
        variant: "default",
        routerName: "Offering Categories",
        permission: "Offering.Edit"
      },
      {
        title: "Offerings",
        icon: "lucide:book-open-text",
        variant: "default",
        routerName: "Offerings",
        permission: "Offering.Edit"
      },
      {
        title: "Offering Components",
        icon: "lucide:book-open-text",
        variant: "default",
        routerName: "Offering Components",
        permission: "Offering.Edit"
      }
    ]
  },
  {
    group: "Admin - Trust",
    isExpanded: true,
    links: [
      {
        title: "Trust Accounts",
        icon: "lucide:vault",
        variant: "default",
        routerName: "Trust Accounts",
        permission: "Trust.View"
      },
      {
        title: "Trust Ledgers",
        icon: "lucide:vault",
        variant: "default",
        routerName: "Trust Ledgers",
        permission: "Trust.Operator"
      }
    ]
  },
  {
    group: "Admin - BusOps",
    isExpanded: false,
    links: [
      {
        title: "Asset Register",
        icon: "lucide:monitor",
        variant: "default",
        routerName: "Asset Register",
        permission: "CommonType.View"
      }
    ]
  },
  {
    group: "Admin - Data",
    isExpanded: false,
    links: [
      {
        title: "Email Groups",
        icon: "lucide:database",
        variant: "default",
        routerName: "Email Groups",
        permission: "CommonType.View"
      },
      {
        title: "Business Entities",
        icon: "lucide:database",
        variant: "default",
        routerName: "Business Entities",
        permission: "CommonType.View"
      },
      {
        title: "Law Areas",
        icon: "lucide:database",
        variant: "default",
        routerName: "Law Areas",
        permission: "CommonType.View"
      },
      {
        title: "Law Sub Areas",
        icon: "lucide:database",
        variant: "default",
        routerName: "Law Sub Areas",
        permission: "CommonType.View"
      },
      {
        title: "Business Areas",
        icon: "lucide:database",
        variant: "default",
        routerName: "Business Areas",
        permission: "CommonType.View"
      },
      {
        title: "Capabilities",
        icon: "lucide:database",
        variant: "default",
        routerName: "Capabilities",
        permission: "CommonType.View"
      },
      {
        title: "Sub Capabilities",
        icon: "lucide:database",
        variant: "default",
        routerName: "Sub Capabilities",
        permission: "CommonType.View"
      },
      {
        title: "Organisation Types",
        icon: "lucide:database",
        variant: "default",
        routerName: "Organisation Types",
        permission: "CommonType.View"
      },
      {
        title: "Industry Categories",
        icon: "lucide:database",
        variant: "default",
        routerName: "Industry Categories",
        permission: "CommonType.View"
      },
      {
        title: "Industry Sub Categories",
        icon: "lucide:database",
        variant: "default",
        routerName: "Industry Sub Categories",
        permission: "CommonType.View"
      },
      {
        title: "Occupations",
        icon: "lucide:database",
        variant: "default",
        routerName: "Occupations",
        permission: "CommonType.View"
      },
      {
        title: "Segments",
        icon: "lucide:database",
        variant: "default",
        routerName: "Segments",
        permission: "CommonType.View"
      },
      {
        title: "Sub Segments",
        icon: "lucide:database",
        variant: "default",
        routerName: "Sub Segments",
        permission: "CommonType.View"
      },
      {
        title: "Standard Disbursements",
        icon: "lucide:database",
        variant: "default",
        routerName: "Standard Disbursements",
        permission: "CommonType.View"
      },
      {
        title: "Asset Register Type",
        icon: "lucide:database",
        variant: "default",
        routerName: "Asset Register Type",
        permission: "CommonType.View"
      }
    ]
  },
  {
    group: "Admin - Safe Storage",
    isExpanded: false,
    links: [
      {
        title: "Document Types",
        icon: "lucide:archive",
        variant: "default",
        routerName: "Safe Storage Document Types",
        permission: "CommonType.View"
      },
      {
        title: "Sections",
        icon: "lucide:archive",
        variant: "default",
        routerName: "Safe Storage Sections",
        permission: "CommonType.View"
      }
    ]
  },
  {
    group: "Admin - Logs",
    isExpanded: false,
    links: [
      {
        title: "Audit Logs",
        icon: "lucide:file-text",
        variant: "default",
        routerName: "Audit Logs",
        permission: "AuditLog.View"
      }
    ]
  },
  {
    group: "User",
    isExpanded: true,
    links: [
      {
        title: "User Menu",
        icon: "lucide:layout-dashboard",
        variant: "ghost",
        routerName: "Dashboard"
      }
    ]
  }
];
