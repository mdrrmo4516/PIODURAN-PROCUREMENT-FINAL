import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { SearchBox } from '../common/SearchBox';
import { StatusBadge } from '../common/StatusBadge';
import { ActionButtons } from '../common/ActionButtons';
import { formatCurrency, formatDate } from '../../lib/storage';

export const DataTable = ({
  title,
  columns,
  data,
  onApprove,
  onDeny,
  onEdit,
  onPrint,
  onDelete,
  showSearch = true,
  showStatusActions = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const renderCell = (column, item) => {
    switch (column.type) {
      case 'status':
        return <StatusBadge status={item[column.key]} />;
      case 'currency':
        return formatCurrency(item[column.key]);
      case 'date':
        return formatDate(item[column.key]);
      case 'actions':
        return (
          <ActionButtons
            purchase={item}
            onApprove={onApprove}
            onDeny={onDeny}
            onEdit={onEdit}
            onPrint={onPrint}
            onDelete={onDelete}
            showStatusActions={showStatusActions}
          />
        );
      default:
        return item[column.key] || '-';
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-500 relative overflow-hidden">
      {/* Decorative Background Pattern */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl -z-0" />
      
      <div className="relative z-10">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          {title && (
            <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
              {title}
            </h3>
          )}
          {showSearch && (
            <SearchBox
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search..."
            />
          )}
        </div>

        <div className="overflow-x-auto rounded-xl">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent bg-gradient-to-r from-primary/5 to-accent/5">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className="text-primary uppercase text-xs font-bold tracking-wider"
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center text-muted-foreground py-12"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl">
                        📭
                      </div>
                      <p className="font-medium">No data available</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item, index) => (
                  <TableRow
                    key={item.id || index}
                    className="border-border hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all duration-300 hover:shadow-sm group"
                    style={{
                      animation: 'slide-up 0.3s ease-out',
                      animationDelay: `${index * 0.05}s`,
                      animationFillMode: 'both'
                    }}
                  >
                    {columns.map((column) => (
                      <TableCell key={column.key} className="text-sm font-medium group-hover:text-foreground transition-colors">
                        {renderCell(column, item)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
