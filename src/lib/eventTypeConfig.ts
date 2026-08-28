import type { IconType } from 'react-icons'
import { LuCake, LuPartyPopper, LuCalendarHeart, LuTag } from 'react-icons/lu'
import { EventType } from '@/generated/prisma'

export const EVENT_TYPE_CONFIG: Record<
  EventType,
  { label: string; color: string; dot: string; icon: IconType }
> = {
  BIRTHDAY: {
    label: 'Aniversário',
    color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
    dot: 'bg-pink-400',
    icon: LuCake,
  },
  ANNIVERSARY: {
    label: 'Comemoração',
    color:
      'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    dot: 'bg-purple-400',
    icon: LuPartyPopper,
  },
  HOLIDAY: {
    label: 'Data especial',
    color:
      'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-400',
    icon: LuCalendarHeart,
  },
  OTHER: {
    label: 'Outro',
    color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
    dot: 'bg-gray-400',
    icon: LuTag,
  },
}
