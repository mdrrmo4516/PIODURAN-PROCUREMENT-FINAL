import React from 'react';
import { cn } from '../../lib/utils';
import { 
  Building, 
  LayoutDashboard, 
  ShoppingCart,
  FileText,
  FileStack,
  FileCheck,
  Receipt,
  Scale,
  Trophy,
  ClipboardCheck,
  ArrowLeftRight,
  Search
} from 'lucide-react';

const navSections = [
  {
    title: 'Main Menu',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'purchases', label: 'All Purchases', icon: ShoppingCart }
    ]
  },
  {
    title: 'Documents',
    items: [
      { id: 'pr', label: 'Purchase Request', icon: FileText },
      { id: 'po', label: 'Purchase Order', icon: FileStack },
      { id: 'obr', label: 'Obligation Request', icon: FileCheck },
      { id: 'dv', label: 'Disbursement Voucher', icon: Receipt },
      { id: 'canvass', label: 'Canvass Forms', icon: Scale },
      { id: 'abstract', label: 'Abstract of Canvass', icon: Trophy }
    ]
  },
  {
    title: 'Inventory',
    items: [
      { id: 'par', label: 'PAR', icon: ClipboardCheck },
      { id: 'ris', label: 'RIS', icon: ArrowLeftRight },
      { id: 'air', label: 'Inspection Report', icon: Search }
    ]
  }
];

export const Sidebar = ({ activeSection, onSectionChange, collapsed = false }) => {
  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen gradient-sidebar shadow-sidebar z-50 overflow-y-auto custom-scrollbar transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[280px]"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "text-center py-5 px-5 border-b border-foreground/10",
        collapsed && "px-2"
      )}>
        <h1 className={cn(
          "text-foreground font-semibold flex items-center justify-center gap-2",
          collapsed ? "text-lg" : "text-xl"
        )}>
          <Building className="w-6 h-6 flex-shrink-0" />
          {!collapsed && <span>MDRRMO</span>}
        </h1>
        {!collapsed && (
          <p className="text-sm text-accent mt-1">Procurement Form System</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-5 space-y-5">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-2">
            {!collapsed && (
              <h3 className="text-xs uppercase text-muted-foreground tracking-wider font-medium">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onSectionChange(item.id)}
                    className={cn(
                      "flex items-center w-full rounded-lg transition-all duration-200",
                      collapsed ? "p-3 justify-center" : "px-4 py-3 gap-3",
                      isActive 
                        ? "gradient-btn-primary shadow-btn-primary text-primary-foreground"
                        : "bg-foreground/5 text-foreground hover:bg-foreground/15 hover:translate-x-1"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={cn("flex-shrink-0", collapsed ? "w-5 h-5" : "w-5 h-5")} />
                    {!collapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};
