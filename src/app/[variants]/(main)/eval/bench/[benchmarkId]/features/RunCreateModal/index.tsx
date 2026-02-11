'use client';

import { Form, Input, InputNumber, Modal } from 'antd';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useEvalStore } from '@/store/eval';

interface RunCreateModalProps {
  benchmarkId: string;
  datasetId: string;
  onClose: () => void;
  open: boolean;
}

const RunCreateModal = memo<RunCreateModalProps>(({ open, onClose, datasetId, benchmarkId }) => {
  const { t } = useTranslation('eval');
  const navigate = useNavigate();
  const createRun = useEvalStore((s) => s.createRun);
  const startRun = useEvalStore((s) => s.startRun);
  const isCreatingRun = useEvalStore((s) => s.isCreatingRun);
  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();
    const run = await createRun({
      datasetId,
      name: values.name,
      targetAgentId: values.targetAgentId,
      config: {
        concurrency: values.concurrency,
        timeout: values.timeout,
      },
    });
    if (run?.id) {
      await startRun(run.id);
      navigate(`/eval/bench/${benchmarkId}/runs/${run.id}`);
    }
    onClose();
  };

  return (
    <Modal
      confirmLoading={isCreatingRun}
      onCancel={onClose}
      onOk={handleOk}
      open={open}
      title={t('run.create.title')}
    >
      <Form form={form} layout="vertical">
        <Form.Item label={t('run.config.model')} name="name">
          <Input placeholder="Run name" />
        </Form.Item>
        <Form.Item label={t('run.config.agentId')} name="targetAgentId">
          <Input placeholder="Agent ID" />
        </Form.Item>
        <Form.Item initialValue={5} label={t('run.config.concurrency')} name="concurrency">
          <InputNumber max={10} min={1} />
        </Form.Item>
        <Form.Item initialValue={300000} label={t('run.config.timeout')} name="timeout">
          <InputNumber min={30000} step={30000} />
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default RunCreateModal;
