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
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
        {showSearch && (
          <SearchBox
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search..."
          />
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className="text-accent uppercase text-xs font-semibold tracking-wider bg-foreground/5"
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
                  className="text-center text-muted-foreground py-8"
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item, index) => (
                <TableRow
                  key={item.id || index}
                  className="border-border hover:bg-foreground/5 transition-colors"
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className="text-sm">
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
  );
};
