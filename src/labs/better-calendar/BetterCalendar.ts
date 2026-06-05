import { css, html, LitElement, nothing } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'

@customElement('better-calendar')
class BetterCalendar extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 100%;
        }

        .calendar-field {
            position: relative;
            display: block;
            width: 100%;
        }

        .calendar-input {
            width: 100%;
            height: 38px;
            padding: 0 12px;
            box-sizing: border-box;
            border: 1px solid #ccc;
            border-radius: 8px;
            background: #fff;
            color: #222;
            font: inherit;
            cursor: pointer;
        }

        .calendar-input:focus {
            outline: none;
            border-color: #777;
            box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
        }

        .calendar-popup {
            position: fixed;
            z-index: 1000;
            width: 312px;
            padding: 12px;
            box-sizing: border-box;
            border: 1px solid #ddd;
            border-radius: 12px;
            background: #fff;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.16);
        }

        .calendar-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            margin-bottom: 12px;
        }

        .calendar-title {
            font-size: 14px;
            font-weight: 700;
            color: #222;
        }

        .calendar-nav {
            display: flex;
            gap: 4px;
        }

        .calendar-nav-button {
            display: inline-flex;
            width: 30px;
            height: 30px;
            align-items: center;
            justify-content: center;
            border: 0;
            border-radius: 8px;
            background: transparent;
            color: #222;
            font: inherit;
            cursor: pointer;
        }

        .calendar-nav-button:hover {
            background: #f2f2f2;
        }

        .calendar-grid {
            display: grid;
            grid-template-columns: 34px repeat(7, 1fr);
            gap: 2px;
        }

        .calendar-weekday,
        .calendar-week-number {
            display: flex;
            height: 28px;
            align-items: center;
            justify-content: center;
            color: #777;
            font-size: 11px;
            font-weight: 600;
        }

        .calendar-day {
            position: relative;
            display: flex;
            height: 34px;
            align-items: center;
            justify-content: center;
            border: 0;
            border-radius: 8px;
            background: transparent;
            color: #222;
            font: inherit;
            font-size: 13px;
            cursor: pointer;
        }

        .calendar-day:hover {
            background: #f1f1f1;
        }

        .calendar-day.outside {
            color: #aaa;
        }

        .calendar-day.today {
            font-weight: 700;
        }

        .calendar-day.in-range {
            border-radius: 0;
            background: #eef2ff;
        }

        .calendar-day.range-start {
            border-top-left-radius: 8px;
            border-bottom-left-radius: 8px;
            background: #dfe6ff;
            font-weight: 700;
        }

        .calendar-day.range-end {
            border-top-right-radius: 8px;
            border-bottom-right-radius: 8px;
            background: #dfe6ff;
            font-weight: 700;
        }

        .calendar-day.selected {
            border-radius: 8px;
            background: #222;
            color: #fff;
            font-weight: 700;
        }

        .calendar-day.selected:hover {
            background: #222;
        }
    `

    @property({ type: String })
    name = 'better-calendar'

    @property({ type: String })
    mode: CalendarMode = 'single'

    @property({ type: String })
    value = ''

    @query('.calendar-input')
    private inputElement?: HTMLInputElement

    @state()
    private open = false

    @state()
    private popupTop = 0

    @state()
    private popupLeft = 0

    @state()
    private viewDate = this.createTodayDate()

    @state()
    private rangeDraftStart = ''

    disconnectedCallback() {
        super.disconnectedCallback()

        this.removePopupListeners()
    }

    updated(changedProperties: Map<string, unknown>) {
        if (changedProperties.has('value')) {
            this.syncViewDateWithValue()
        }

        if (changedProperties.has('open') && this.open) {
            this.updateComplete.then(() => {
                this.updatePopupPosition()
            })
        }
    }

    render() {
        return html`
            <div class="calendar-field">
                <input
                    class="calendar-input"
                    type="text"
                    readonly
                    .name=${this.name}
                    .value=${this.getDisplayValue()}
                    @click=${this.toggleCalendar}
                />

                ${this.open ? this.renderCalendar() : nothing}
            </div>
        `
    }

    private renderCalendar() {
        const days = this.createCalendarDays()
        const title = this.formatMonthTitle(this.viewDate)

        return html`
            <div class="calendar-popup" style="top: ${this.popupTop}px; left: ${this.popupLeft}px;">
                <div class="calendar-header">
                    <div class="calendar-title">${title}</div>

                    <div class="calendar-nav">
                        <button class="calendar-nav-button" type="button" aria-label="Previous month" @click=${this.showPreviousMonth}>‹</button>
                        <button class="calendar-nav-button" type="button" aria-label="Next month" @click=${this.showNextMonth}>›</button>
                    </div>
                </div>

                <div class="calendar-grid">
                    <div class="calendar-weekday">Wk</div>
                    <div class="calendar-weekday">Mon</div>
                    <div class="calendar-weekday">Tue</div>
                    <div class="calendar-weekday">Wed</div>
                    <div class="calendar-weekday">Thu</div>
                    <div class="calendar-weekday">Fri</div>
                    <div class="calendar-weekday">Sat</div>
                    <div class="calendar-weekday">Sun</div>

                    ${days.map((day) => this.renderCalendarDay(day))}
                </div>
            </div>
        `
    }

    private renderCalendarDay(day: CalendarDay) {
        if (day.weekNumber !== null) {
            return html`
                <div class="calendar-week-number">${day.weekNumber}</div>
                ${this.renderDayButton(day)}
            `
        }

        return this.renderDayButton(day)
    }

    private renderDayButton(day: CalendarDay) {
        const classes = {
            'calendar-day': true,
            outside: !day.isCurrentMonth,
            today: day.isToday,
            selected: day.isSelected,
            'in-range': day.isInRange,
            'range-start': day.isRangeStart,
            'range-end': day.isRangeEnd,
        }

        return html`
            <button class=${this.createClassName(classes)} type="button" @click=${() => this.selectDate(day.dateString)}>${day.day}</button>
        `
    }

    private toggleCalendar() {
        if (this.open) {
            this.closeCalendar()

            return
        }

        this.open = true
        this.rangeDraftStart = ''
        this.syncViewDateWithValue()
        this.addPopupListeners()
    }

    private closeCalendar() {
        if (!this.open) {
            return
        }

        this.open = false
        this.rangeDraftStart = ''
        this.removePopupListeners()
    }

    private selectDate(dateString: string) {
        if (this.mode === 'range') {
            this.selectRangeDate(dateString)

            return
        }

        this.value = dateString
        this.dispatchChange()
        this.closeCalendar()
    }

    private selectRangeDate(dateString: string) {
        const [start, end] = this.getRangeValue()

        if (!this.rangeDraftStart || (start && end)) {
            this.rangeDraftStart = dateString
            this.value = dateString
            this.dispatchChange()

            return
        }

        const sortedRange = this.sortDateStrings(this.rangeDraftStart, dateString)

        this.value = `${sortedRange[0]},${sortedRange[1]}`
        this.rangeDraftStart = ''
        this.dispatchChange()
        this.closeCalendar()
    }

    private showPreviousMonth() {
        this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1)
    }

    private showNextMonth() {
        this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1)
    }

    private createCalendarDays() {
        const days: CalendarDay[] = []
        const year = this.viewDate.getFullYear()
        const month = this.viewDate.getMonth()
        const firstMonthDay = new Date(year, month, 1)
        const gridStart = this.getMondayOfWeek(firstMonthDay)
        const todayString = this.formatDate(this.createTodayDate())
        const selectedValue = this.mode === 'single' ? this.value : ''
        const [rangeStart, rangeEnd] = this.getActiveRangeValue()

        for (let index = 0; index < 42; index++) {
            const date = this.addDays(gridStart, index)
            const dateString = this.formatDate(date)
            const isCurrentMonth = date.getMonth() === month
            const isSelected = selectedValue === dateString
            const isRangeStart = rangeStart === dateString
            const isRangeEnd = rangeEnd === dateString
            const isInRange = this.isDateInRange(dateString, rangeStart, rangeEnd)
            const isFirstDayOfWeek = index % 7 === 0

            days.push({
                date,
                dateString,
                day: date.getDate(),
                weekNumber: isFirstDayOfWeek ? this.getWeekNumber(date) : null,
                isToday: todayString === dateString,
                isCurrentMonth,
                isSelected,
                isRangeStart,
                isRangeEnd,
                isInRange,
            })
        }

        return days
    }

    private getDisplayValue() {
        return this.value
    }

    private getRangeValue() {
        if (this.mode !== 'range') {
            return ['', '']
        }

        const parts = this.value
            .split(',')
            .map((part) => part.trim())
            .filter(Boolean)

        return [parts[0] ?? '', parts[1] ?? '']
    }

    private getActiveRangeValue() {
        const [start, end] = this.getRangeValue()

        if (this.rangeDraftStart) {
            return [this.rangeDraftStart, '']
        }

        return [start, end]
    }

    private isDateInRange(dateString: string, rangeStart: string, rangeEnd: string) {
        if (!rangeStart || !rangeEnd) {
            return false
        }

        return dateString > rangeStart && dateString < rangeEnd
    }

    private sortDateStrings(firstDate: string, secondDate: string) {
        if (firstDate <= secondDate) {
            return [firstDate, secondDate]
        }

        return [secondDate, firstDate]
    }

    private syncViewDateWithValue() {
        const dateString = this.mode === 'range' ? this.getRangeValue()[0] : this.value

        if (!dateString) {
            return
        }

        const date = this.parseDate(dateString)

        if (!date) {
            return
        }

        this.viewDate = new Date(date.getFullYear(), date.getMonth(), 1)
    }

    private updatePopupPosition() {
        if (!this.inputElement) {
            return
        }

        const viewportMargin = 8
        const popupWidth = 312
        const popupHeight = 360
        const inputRect = this.inputElement.getBoundingClientRect()
        const spaceBelow = window.innerHeight - inputRect.bottom
        const shouldOpenAbove = spaceBelow < popupHeight && inputRect.top > popupHeight
        const preferredTop = shouldOpenAbove ? inputRect.top - popupHeight - 6 : inputRect.bottom + 6

        const minLeft = viewportMargin
        const maxLeft = window.innerWidth - popupWidth - viewportMargin
        const minTop = viewportMargin
        const maxTop = window.innerHeight - popupHeight - viewportMargin

        this.popupLeft = this.clamp(inputRect.left, minLeft, Math.max(minLeft, maxLeft))
        this.popupTop = this.clamp(preferredTop, minTop, Math.max(minTop, maxTop))
    }

    private addPopupListeners() {
        window.addEventListener('resize', this.closeCalendarOnOutsideAction)
        window.addEventListener('wheel', this.closeCalendarOnOutsideAction, true)
        document.addEventListener('mousedown', this.handleDocumentMouseDown)
        document.addEventListener('keydown', this.handleDocumentKeydown)
    }

    private removePopupListeners() {
        window.removeEventListener('resize', this.closeCalendarOnOutsideAction)
        window.removeEventListener('wheel', this.closeCalendarOnOutsideAction, true)
        document.removeEventListener('mousedown', this.handleDocumentMouseDown)
        document.removeEventListener('keydown', this.handleDocumentKeydown)
    }

    private closeCalendarOnOutsideAction = () => {
        this.closeCalendar()
    }

    private handleDocumentKeydown = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') {
            return
        }

        this.closeCalendar()
    }

    private handleDocumentMouseDown = (event: MouseEvent) => {
        const eventPath = event.composedPath()

        if (eventPath.includes(this)) {
            return
        }

        this.closeCalendar()
    }

    private dispatchChange() {
        this.dispatchEvent(
            new Event('change', {
                bubbles: true,
                composed: true,
            }),
        )
    }

    private createTodayDate() {
        const date = new Date()

        return new Date(date.getFullYear(), date.getMonth(), date.getDate())
    }

    private parseDate(dateString: string) {
        const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/)

        if (!match) {
            return null
        }

        const year = Number(match[1])
        const month = Number(match[2]) - 1
        const day = Number(match[3])
        const date = new Date(year, month, day)

        if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
            return null
        }

        return date
    }

    private formatDate(date: Date) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')

        return `${year}-${month}-${day}`
    }

    private formatMonthTitle(date: Date) {
        return new Intl.DateTimeFormat('en', {
            month: 'long',
            year: 'numeric',
        }).format(date)
    }

    private addDays(date: Date, days: number) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
    }

    private getMondayOfWeek(date: Date) {
        const day = date.getDay()
        const diff = day === 0 ? -6 : 1 - day

        return this.addDays(date, diff)
    }

    private getWeekNumber(date: Date) {
        const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())

        const dayNumber = (target.getDay() + 6) % 7

        target.setDate(target.getDate() - dayNumber + 3)

        const firstThursday = new Date(target.getFullYear(), 0, 4)
        const firstThursdayDayNumber = (firstThursday.getDay() + 6) % 7

        firstThursday.setDate(firstThursday.getDate() - firstThursdayDayNumber + 3)

        return 1 + Math.round((target.getTime() - firstThursday.getTime()) / 604800000)
    }

    private clamp(value: number, min: number, max: number) {
        return Math.min(Math.max(value, min), max)
    }

    private createClassName(classes: Record<string, boolean>) {
        return Object.entries(classes)
            .filter(([, active]) => active)
            .map(([className]) => className)
            .join(' ')
    }
}
