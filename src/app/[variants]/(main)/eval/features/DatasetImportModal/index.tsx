'use client';

import { Modal } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface DatasetImportModalProps {
  onClose: () => void;
  open: boolean;
}

const DatasetImportModal = memo<DatasetImportModalProps>(({ open, onClose }) => {
  const { t } = useTranslation('eval');

  return (
    <Modal
      onCancel={onClose}
      open={open}
      title={t('dataset.import.title')}
    >
      {/* TODO: Implement multi-step import flow */}
    </Modal>
  );
});

export default DatasetImportModal;
