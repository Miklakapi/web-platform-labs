type TriStateMode = 'select' | 'switch' | 'checkbox'

type TriStateOptionValue = string | number | boolean | null

type TriStateOption = {
    label: string
    value: TriStateOptionValue
}
