import React from 'react';
import { TableResponse } from '../../types/order.types';
import { TableQrStudio } from './TableQrStudio';

export interface TableQrStandsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: TableResponse[];
  onRefreshTables?: () => void;
}

export const TableQrStandsModal: React.FC<TableQrStandsModalProps> = ({
  isOpen,
  onClose,
  tables,
  onRefreshTables,
}) => {
  if (!isOpen) return null;

  return (
    <TableQrStudio
      isModal={true}
      isOpen={isOpen}
      onClose={onClose}
      tables={tables}
      onRefreshTables={onRefreshTables}
    />
  );
};

export default TableQrStandsModal;
