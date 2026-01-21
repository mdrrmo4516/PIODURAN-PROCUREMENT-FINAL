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
        "backdrop-blur-xl bg-gradient-to-b from-primary/95 via-secondary/95 to-accent/95",
        collapsed ? "w-[70px]" : "w-[280px]"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "text-center py-6 px-5 border-b border-white/20 relative",
        collapsed && "px-2"
      )}>
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        
        <h1 className={cn(
          "text-white font-bold flex items-center justify-center gap-2 relative animate-slide-down drop-shadow-lg",
          collapsed ? "text-lg" : "text-2xl"
        )}>
          <Building className={cn(
            "flex-shrink-0 animate-bounce-gentle",
            collapsed ? "w-6 h-6" : "w-8 h-8"
          )} />
          {!collapsed && <span>MDRRMO</span>}
        </h1>
        {!collapsed && (
          <p className="text-sm text-white/90 mt-2 font-medium tracking-wide relative animate-slide-down" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            Procurement Form System
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-5 space-y-6">
        {navSections.map((section, sectionIndex) => (
          <div 
            key={section.title} 
            className="space-y-2 animate-slide-in-left"
            style={{ 
              animationDelay: `${0.1 * (sectionIndex + 1)}s`,
              animationFillMode: 'both'
            }}
          >
            {!collapsed && (
              <h3 className="text-xs uppercase text-white/70 tracking-wider font-semibold px-2">
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
                      "flex items-center w-full rounded-xl transition-all duration-300 group relative overflow-hidden",
                      collapsed ? "p-3 justify-center" : "px-4 py-3 gap-3",
                      isActive 
                        ? "bg-white text-primary shadow-lg scale-105"
                        : "bg-white/10 text-white hover:bg-white/20 hover:translate-x-1 hover:shadow-md"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    {/* Hover Gradient Effect */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    )}
                    
                    {/* Icon */}
                    <Icon className={cn(
                      "flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-110",
                      collapsed ? "w-5 h-5" : "w-5 h-5",
                      isActive && "animate-wiggle"
                    )} />
                    
                    {/* Label */}
                    {!collapsed && (
                      <span className="text-sm font-semibold relative z-10">{item.label}</span>
                    )}
                    
                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-l-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      
      {/* Decorative Bottom Element */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-accent/30 to-transparent pointer-events-none" />
    </aside>
  );
};
