import type { DeadlineStatus, DeliveryOrder } from '../types';

const statusRank: Record<DeadlineStatus, number> = {
  unplanned: 0,
  overdue: 0,
  due_today: 1,
  normal: 2,
};

export function getDeadlineStatus(order: DeliveryOrder): DeadlineStatus {
  if (order.status !== 'pending') return 'normal';
  if (!order.plannedDeliveryDate) return 'unplanned';
  return order.deadlineStatus || 'normal';
}

export function getDeadlineLabel(order: DeliveryOrder): string {
  const status = getDeadlineStatus(order);
  if (status === 'unplanned') return 'Plan delivery date';
  if (status === 'overdue') return 'Overdue';
  if (status === 'due_today') return 'Due today';
  if (order.deliveryDeadline) return `Deliver by ${order.deliveryDeadline}`;
  return 'No deadline';
}

export function sortByDeadlinePriority(orders: DeliveryOrder[]): DeliveryOrder[] {
  return [...orders].sort((a, b) => {
    const statusDiff = statusRank[getDeadlineStatus(a)] - statusRank[getDeadlineStatus(b)];
    if (statusDiff !== 0) return statusDiff;
    return getDeadlineTime(a) - getDeadlineTime(b);
  });
}

function getDeadlineTime(order: DeliveryOrder): number {
  if (getDeadlineStatus(order) === 'unplanned') return 0;
  if (!order.deliveryDeadline) return Number.MAX_SAFE_INTEGER;
  const parsed = parseSheetDate(order.deliveryDeadline);
  return parsed ? parsed.getTime() : Number.MAX_SAFE_INTEGER;
}

function parseSheetDate(value: string): Date | null {
  const raw = String(value || '').trim();
  const dmy = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/);
  if (dmy) {
    const year = Number(dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3]);
    return new Date(year, Number(dmy[2]) - 1, Number(dmy[1]));
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
