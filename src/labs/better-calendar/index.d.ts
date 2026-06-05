type CalendarMode = 'single' | 'range'

type CalendarDay = {
    date: Date
    dateString: string
    day: number
    weekNumber: number | null
    isToday: boolean
    isCurrentMonth: boolean
    isSelected: boolean
    isRangeStart: boolean
    isRangeEnd: boolean
    isInRange: boolean
}
