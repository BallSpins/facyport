export const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'Menunggu',
  IN_PROGRESS: 'Diproses',
  RESOLVED: 'Selesai',
};

export const getStatusLabel = (status: string): string => {
  return STATUS_LABELS[status] || status;
};