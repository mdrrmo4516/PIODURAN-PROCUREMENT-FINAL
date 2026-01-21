import React from 'react';
import { cn } from '../../lib/utils';

export const StatCard = ({ icon: Icon, value, label, colorClass = 'icon-blue' }) => {
  return (
    <div className="gradient-card rounded-2xl p-6 border border-border/50 hover:-translate-y-2 hover:shadow-card-hover transition-all duration-500 backdrop-blur-sm bg-white/80 group animate-slide-up relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative">
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl mb-4 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500",
          colorClass
        )}>
          <Icon className="w-7 h-7" />
        </div>
        <h3 className="text-3xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">{value}</h3>
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
      </div>
      
      {/* Decorative Corner Element */}
      <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />
    </div>
  );
};
