'use client';
import { useState } from 'react';
import React from 'react';
import { Modal } from 'antd';

interface ConfirmDialogProps {
  trigger: React.ReactElement<{ onClick?: () => void }>;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

export function ConfirmDialog({ trigger, title, description, confirmLabel = 'Confirm', onConfirm }: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {React.cloneElement(trigger, { onClick: () => setOpen(true) })}
      <Modal
        open={open}
        title={title}
        okText={confirmLabel}
        okType="danger"
        onOk={() => { onConfirm(); setOpen(false); }}
        onCancel={() => setOpen(false)}
      >
        <p>{description}</p>
      </Modal>
    </>
  );
}
