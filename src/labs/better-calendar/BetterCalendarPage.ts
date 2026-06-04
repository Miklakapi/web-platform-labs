import { css, html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '@/labs/better-calendar/BetterCalendar'

@customElement('better-calendar-page')
class BetterCalendarPage extends LitElement {
    static styles = css`
        :host {
            display: block;
            min-height: 180vh;
            padding: 24px;
            box-sizing: border-box;
        }

        .page {
            display: flex;
            flex-direction: column;
            gap: 32px;
        }

        .header {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .title {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
        }

        .description {
            max-width: 780px;
            margin: 0;
            color: #666;
            line-height: 1.5;
        }

        .section {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 12px;
            background: #fff;
        }

        .section-title {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
        }

        .top-row {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
        }

        .field {
            display: flex;
            min-width: 240px;
            flex-direction: column;
            gap: 8px;
        }

        .field label {
            font-size: 13px;
            font-weight: 600;
            color: #444;
        }

        .debug {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 12px;
        }

        .debug-box {
            padding: 12px;
            border: 1px dashed #ccc;
            border-radius: 8px;
            background: #fafafa;
            font-size: 13px;
            line-height: 1.4;
        }

        .debug-box strong {
            display: block;
            margin-bottom: 4px;
        }

        .edge-test-area {
            position: relative;
            min-height: 520px;
            overflow: hidden;
            border: 1px dashed #bbb;
            border-radius: 12px;
            background: linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px), linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px);
            background-size: 24px 24px;
        }

        .edge-box {
            position: absolute;
            width: 260px;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 10px;
            background: #fff;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .edge-box label {
            display: block;
            margin-bottom: 8px;
            font-size: 13px;
            font-weight: 600;
        }

        .edge-box.top-left {
            top: 16px;
            left: 16px;
        }

        .edge-box.top-right {
            top: 16px;
            right: 16px;
        }

        .edge-box.bottom-left {
            bottom: 16px;
            left: 16px;
        }

        .edge-box.bottom-right {
            right: 16px;
            bottom: 16px;
        }

        .fixed-test {
            position: fixed;
            right: 24px;
            bottom: 24px;
            z-index: 20;
            width: 260px;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 10px;
            background: #fff;
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.14);
        }

        .fixed-test label {
            display: block;
            margin-bottom: 8px;
            font-size: 13px;
            font-weight: 600;
        }

        .scroll-spacer {
            display: flex;
            min-height: 320px;
            align-items: center;
            justify-content: center;
            border: 1px dashed #ddd;
            border-radius: 12px;
            color: #888;
            background: #fafafa;
        }

        @media (max-width: 760px) {
            :host {
                padding: 16px;
            }

            .top-row {
                flex-direction: column;
            }

            .field {
                min-width: 0;
            }

            .edge-test-area {
                min-height: 760px;
            }

            .edge-box {
                position: static;
                width: auto;
                margin: 16px;
            }

            .fixed-test {
                right: 16px;
                bottom: 16px;
                left: 16px;
                width: auto;
            }
        }
    `

    @state()
    private singleValue = '2026-06-04'

    @state()
    private rangeValue = '2026-06-04,2026-06-12'

    @state()
    private topLeftValue = '2026-01-15'

    @state()
    private topRightValue = '2026-02-15'

    @state()
    private bottomLeftValue = '2026-03-15'

    @state()
    private bottomRightValue = '2026-04-15'

    @state()
    private fixedValue = '2026-05-15'

    render() {
        return html`
            <div class="page">
                <div class="header">
                    <h1 class="title">Better Calendar</h1>
                </div>

                <section class="section">
                    <h2 class="section-title">Basic usage</h2>

                    <div class="top-row">
                        <div class="field">
                            <label for="single-calendar">Single date</label>
                            <better-calendar
                                id="single-calendar"
                                name="single-example"
                                mode="single"
                                .value=${this.singleValue}
                                @change=${this.handleSingleChange}
                            ></better-calendar>
                        </div>

                        <div class="field">
                            <label for="range-calendar">Date range</label>
                            <better-calendar
                                id="range-calendar"
                                name="range-example"
                                mode="range"
                                .value=${this.rangeValue}
                                @change=${this.handleRangeChange}
                            ></better-calendar>
                        </div>
                    </div>

                    <div class="debug">
                        <div class="debug-box">
                            <strong>Single value</strong>
                            ${this.singleValue}
                        </div>

                        <div class="debug-box">
                            <strong>Range value</strong>
                            ${this.rangeValue}
                        </div>
                    </div>
                </section>

                <section class="section">
                    <h2 class="section-title">Container edge test</h2>

                    <div class="edge-test-area">
                        <div class="edge-box top-left">
                            <label>Top left</label>
                            <better-calendar
                                name="top-left-example"
                                mode="single"
                                .value=${this.topLeftValue}
                                @change=${this.handleTopLeftChange}
                            ></better-calendar>
                        </div>

                        <div class="edge-box top-right">
                            <label>Top right</label>
                            <better-calendar
                                name="top-right-example"
                                mode="single"
                                .value=${this.topRightValue}
                                @change=${this.handleTopRightChange}
                            ></better-calendar>
                        </div>

                        <div class="edge-box bottom-left">
                            <label>Bottom left</label>
                            <better-calendar
                                name="bottom-left-example"
                                mode="single"
                                .value=${this.bottomLeftValue}
                                @change=${this.handleBottomLeftChange}
                            ></better-calendar>
                        </div>

                        <div class="edge-box bottom-right">
                            <label>Bottom right</label>
                            <better-calendar
                                name="bottom-right-example"
                                mode="single"
                                .value=${this.bottomRightValue}
                                @change=${this.handleBottomRightChange}
                            ></better-calendar>
                        </div>
                    </div>
                </section>

                <div class="scroll-spacer">Scroll test — the popup should still calculate its position correctly.</div>

                <section class="section">
                    <h2 class="section-title">After scroll test</h2>

                    <div class="top-row">
                        <div class="field">
                            <label for="scroll-calendar">Single after scroll</label>
                            <better-calendar id="scroll-calendar" name="scroll-example" mode="single" value="2026-06-20"></better-calendar>
                        </div>

                        <div class="field">
                            <label for="scroll-range-calendar">Range after scroll</label>
                            <better-calendar
                                id="scroll-range-calendar"
                                name="scroll-range-example"
                                mode="range"
                                value="2026-06-20,2026-07-04"
                            ></better-calendar>
                        </div>
                    </div>
                </section>

                <div class="fixed-test">
                    <label>Fixed bottom right</label>
                    <better-calendar name="fixed-example" mode="single" .value=${this.fixedValue} @change=${this.handleFixedChange}></better-calendar>
                </div>
            </div>
        `
    }

    private handleSingleChange(event: Event) {
        this.singleValue = this.readCalendarValue(event)
    }

    private handleRangeChange(event: Event) {
        this.rangeValue = this.readCalendarValue(event)
    }

    private handleTopLeftChange(event: Event) {
        this.topLeftValue = this.readCalendarValue(event)
    }

    private handleTopRightChange(event: Event) {
        this.topRightValue = this.readCalendarValue(event)
    }

    private handleBottomLeftChange(event: Event) {
        this.bottomLeftValue = this.readCalendarValue(event)
    }

    private handleBottomRightChange(event: Event) {
        this.bottomRightValue = this.readCalendarValue(event)
    }

    private handleFixedChange(event: Event) {
        this.fixedValue = this.readCalendarValue(event)
    }

    private readCalendarValue(event: Event) {
        const target = event.target as HTMLElement & { value?: string }

        return target.value ?? ''
    }
}
